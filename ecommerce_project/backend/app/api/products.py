from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from app.core.database import get_database
from app.models.product import Product
from app.models.user import User
from app.api.deps import get_current_user, get_current_admin
from bson import ObjectId
import os
import uuid
from pathlib import Path

router = APIRouter()

@router.get("/", response_model=List[Product])
async def get_products(search: str = ""):
    db = get_database()
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
        
    products = await db.products.find(query).to_list(length=100)
    return products

@router.get("/{id}", response_model=Product)
async def get_product(id: str):
    db = get_database()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=404, detail="Invalid ID")
        
    product = await db.products.find_one({"_id":ObjectId(id)})
    if product:
        return product
    raise HTTPException(status_code=404, detail="Product not found")

@router.post("/", dependencies=[Depends(get_current_admin)], response_model=Product)
async def create_product(product_in: Product):
    db = get_database()
    
    product_data = product_in.model_dump(by_alias=True, exclude={"id", "_id"})
    if "_id" in product_data:
        del product_data["_id"]
    
    # Convert user ID string to ObjectId for DB storage
    if product_data.get("user") and isinstance(product_data["user"], str):
        product_data["user"] = ObjectId(product_data["user"])
        
    new_product = await db.products.insert_one(product_data)
    created_product = await db.products.find_one({"_id": new_product.inserted_id})
    return created_product

@router.put("/{id}", dependencies=[Depends(get_current_admin)], response_model=Product)
async def update_product(id: str, product_update: Product):
    db = get_database()
    if not ObjectId.is_valid(id):
         raise HTTPException(status_code=404, detail="Invalid ID")

    product = await db.products.find_one({"_id":ObjectId(id)})
    if product:
        update_data = product_update.model_dump(exclude_unset=True)
        # Avoid updating _id
        if "_id" in update_data:
            del update_data["_id"]
        
        # Ensure 'user' is stored as ObjectId if present
        if update_data.get("user") and isinstance(update_data["user"], str):
            update_data["user"] = ObjectId(update_data["user"])
            
        await db.products.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        updated_product = await db.products.find_one({"_id": ObjectId(id)})
        return updated_product
    else:
        raise HTTPException(status_code=404, detail="Product not found")

@router.delete("/{id}", dependencies=[Depends(get_current_admin)])
async def delete_product(id: str):
    db = get_database()
    if not ObjectId.is_valid(id):
         raise HTTPException(status_code=404, detail="Invalid ID")
         
    product = await db.products.find_one({"_id":ObjectId(id)})
    if product:
        await db.products.delete_one({"_id": ObjectId(id)})
        return {"message": "Product removed"}
    else:
        raise HTTPException(status_code=404, detail="Product not found")

@router.post("/upload", dependencies=[Depends(get_current_admin)])
async def upload_product_images(files: List[UploadFile] = File(...)):
    """
    Upload product images (max 3 files)
    Accepts: jpg, jpeg, png, webp
    Max size: 5MB per file
    """
    if len(files) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 images allowed")
    
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    max_file_size = 5 * 1024 * 1024  # 5MB
    
    uploaded_urls = []
    
    # Get the uploads directory path
    upload_dir = Path(__file__).parent.parent.parent / "static" / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    for file in files:
        # Validate file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.filename}. Allowed: jpg, jpeg, png, webp"
            )
        
        # Read file content to check size
        content = await file.read()
        if len(content) > max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File {file.filename} exceeds 5MB limit"
            )
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Create URL for the uploaded file
        file_url = f"/static/uploads/{unique_filename}"
        uploaded_urls.append(file_url)
    
    return {"images": uploaded_urls}

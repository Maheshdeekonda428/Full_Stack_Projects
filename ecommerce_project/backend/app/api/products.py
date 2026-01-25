from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.database import get_database
from app.models.product import Product
from app.models.user import User
from app.api.deps import get_current_user, get_current_admin
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[Product])
async def get_products():
    db = get_database()
    products = await db.products.find({}).to_list(length=100)
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
async def create_product():
    db = get_database()
    product = Product(
        name="Sample Name",
        price=0,
        user=None, # Should ideally be current admin user ID but optional for now
        image="/images/sample.jpg",
        brand="Sample Brand",
        category="Sample Category",
        countInStock=0,
        numReviews=0,
        description="Sample Description"
    )
    product_data = product.model_dump(by_alias=True, exclude={"id"})
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

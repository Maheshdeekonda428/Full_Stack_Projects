from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_database
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token
from bson import ObjectId

router = APIRouter()

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"email": form_data.username}) # Using email as username
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=str(user["_id"]))
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")
async def register(user: User):
    db = get_database()
    user_exists = await db.users.find_one({"email": user.email})
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    user.password = get_password_hash(user.password)
    user_data = user.model_dump(by_alias=True, exclude={"id"})
    if "_id" in user_data:
        del user_data["_id"]
        
    new_user = await db.users.insert_one(user_data)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    access_token = create_access_token(subject=str(created_user["_id"]))
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": User(**created_user)
    }


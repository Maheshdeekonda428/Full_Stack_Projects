from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.database import get_database
from app.models.user import User
from app.api.deps import get_current_user, get_current_admin
from app.core.security import get_password_hash
from bson import ObjectId

router = APIRouter()

@router.get("/profile", response_model=User)
async def read_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=User)
async def update_user_profile(user_update: User, current_user: User = Depends(get_current_user)):
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(str(current_user.id))})
    
    if user:
        user["name"] = user_update.name or user["name"]
        user["email"] = user_update.email or user["email"]
        if user_update.password:
            user["password"] = get_password_hash(user_update.password)
        
        await db.users.update_one({"_id": ObjectId(str(current_user.id))}, {"$set": user})
        updated_user = await db.users.find_one({"_id": ObjectId(str(current_user.id))})
        return User(**updated_user)
    else:
        raise HTTPException(status_code=404, detail="User not found")

@router.get("/", response_model=List[User], dependencies=[Depends(get_current_admin)])
async def read_users():
    db = get_database()
    users = await db.users.find({}).to_list(length=100)
    return users

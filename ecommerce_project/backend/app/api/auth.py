from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
import secrets
from datetime import datetime, timedelta
from app.core.database import get_database
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.config import settings
from jose import jwt, JWTError
from bson import ObjectId

router = APIRouter()

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    db = get_database()
    user = await db.users.find_one({"email": request.email.lower()})
    if not user:
        # We don't want to leak if a user exists or not
        return {"message": "If your email is registered, you will receive a reset link shortly."}
    
    reset_token = secrets.token_urlsafe(32)
    reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "reset_token": reset_token,
                "reset_token_expiry": reset_token_expiry
            }
        }
    )
    
    # Mock sending email
    reset_link = f"http://localhost:5173/reset-password/{reset_token}"
    print(f"MOCK EMAIL: Password reset link for {request.email}: {reset_link}")
    
    return {"message": "If your email is registered, you will receive a reset link shortly."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    db = get_database()
    user = await db.users.find_one({
        "reset_token": request.token,
        "reset_token_expiry": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    hashed_password = get_password_hash(request.new_password)
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password": hashed_password},
            "$unset": {"reset_token": "", "reset_token_expiry": ""}
        }
    )
    
    return {"message": "Password reset successfully"}

@router.post("/login")
async def login(res: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"email": form_data.username}) # Using email as username
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        # Ensure password exists in DB and verify it
        db_password = user.get("password")
        if not db_password or not verify_password(form_data.password, db_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception as e:
        # Catch bcrypt errors (like 72 char limit) or other passlib failures
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication error: {str(e)}"
        )

    access_token = create_access_token(subject=str(user["_id"]))
    refresh_token = create_refresh_token(subject=str(user["_id"]))
    
    response = {"access_token": access_token, "token_type": "bearer"}
    
    # Set refresh token in HTTP-only cookie
    res.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        # expires=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False, # Set to True in production with HTTPS
    )
    
    return response

@router.post("/register")
async def register(res: Response, user: User):
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
    refresh_token = create_refresh_token(subject=str(created_user["_id"]))
    
    # Set refresh token in HTTP-only cookie
    res.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": User(**created_user)
    }

@router.post("/refresh")
async def refresh_token(request: Request, res: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
    
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if not payload.get("refresh"):
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
        
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
        
    new_access_token = create_access_token(subject=str(user["_id"]))
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(res: Response):
    res.delete_cookie(key="refresh_token")
    return {"message": "Successfully logged out"}


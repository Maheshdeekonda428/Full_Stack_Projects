from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

from app.models.common import PyObjectId


class User(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    email: EmailStr
    password: str
    isAdmin: bool = False
    reset_token: Optional[str] = None
    reset_token_expiry: Optional[datetime] = None

    model_config = ConfigDict(
        populate_by_name=True,
    )

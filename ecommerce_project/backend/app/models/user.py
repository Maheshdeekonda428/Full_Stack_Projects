from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional

from app.models.common import PyObjectId


class User(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    email: EmailStr
    password: str
    isAdmin: bool = False

    model_config = ConfigDict(
        populate_by_name=True,
    )

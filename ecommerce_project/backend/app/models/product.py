from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.common import PyObjectId
from pydantic import ConfigDict


class Review(BaseModel):
    name: Optional[str] = ""
    rating: float = 4.8
    comment: Optional[str] = ""
    user: Optional[PyObjectId] = None


class Product(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user: Optional[PyObjectId] = None

    name: str
    image: Optional[str] = ""
    brand: Optional[str] = ""
    category: Optional[str] = ""
    description: Optional[str] = ""

    reviews: List[Review] = Field(default_factory=list)
    rating: float = 4.8
    numReviews: int = "50+"
    price: float = 0
    countInStock: int = 100

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

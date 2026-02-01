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

    name: str = Field(...,)
    image: Optional[str] = ""  # Kept for backward compatibility
    images: List[str] = Field(default_factory=list)  # New: support multiple images
    brand: str = Field(...,)
    category: Optional[str] = ""
    description: str = Field(...,)

    reviews: List[Review] = Field(default_factory=list)
    rating: float = 4.8
    numReviews: int = 50
    price: float
    countInStock: int

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

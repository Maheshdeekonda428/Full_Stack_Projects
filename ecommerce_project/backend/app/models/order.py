from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

from app.models.common import PyObjectId


class OrderItem(BaseModel):
    name: str
    qty: int
    image: str
    price: float
    product: PyObjectId


class ShippingAddress(BaseModel):
    address: str
    city: str
    postalCode: str
    country: str


class PaymentResult(BaseModel):
    id: Optional[str] = None
    status: Optional[str] = None
    update_time: Optional[str] = None
    email_address: Optional[str] = None


class Order(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user: Optional[PyObjectId] = None
    orderItems: List[OrderItem] = []
    shippingAddress: Optional[ShippingAddress] = None
    paymentMethod: str = ""
    paymentResult: Optional[PaymentResult] = None
    taxPrice: float = 0.0
    shippingPrice: float = 0.0
    totalPrice: float = 0.0
    isPaid: bool = False
    paidAt: Optional[datetime] = None
    isDelivered: bool = False
    deliveredAt: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
    )

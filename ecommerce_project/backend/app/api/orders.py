from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from app.core.database import get_database
from app.models.order import Order
from app.models.user import User
from app.api.deps import get_current_user, get_current_admin
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=Order)
async def add_order_items(order: Order, current_user: User = Depends(get_current_user)):
    if current_user.isAdmin:
        raise HTTPException(status_code=400, detail="Admins cannot place orders")
        
    db = get_database()
    if not order.orderItems:
         raise HTTPException(status_code=400, detail="No order items")
    
    order.user = current_user.id
    order_data = order.model_dump(by_alias=True, exclude={"id"})
    if "_id" in order_data:
        del order_data["_id"]
        
    # Convert user ID to ObjectId for DB storage
    if order_data.get("user") and isinstance(order_data["user"], str):
        order_data["user"] = ObjectId(order_data["user"])
        
    new_order = await db.orders.insert_one(order_data)
    created_order = await db.orders.find_one({"_id": new_order.inserted_id})
    return created_order

@router.get("/myorders", response_model=List[Order])
async def get_my_orders(current_user: User = Depends(get_current_user)):
    if current_user.isAdmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot have personal orders"
        )
    db = get_database()
    orders = await db.orders.find({
        "user": ObjectId(current_user.id),
        "isUserDeleted": {"$ne": True}
    }).to_list(length=100)
    return orders

@router.get("/{id}", response_model=Order)
async def get_order_by_id(id: str, current_user: User = Depends(get_current_user)):
    db = get_database()
    if not ObjectId.is_valid(id):
         raise HTTPException(status_code=404, detail="Invalid ID")
         
    order = await db.orders.find_one({"_id": ObjectId(id)})
    if order:
        if current_user.isAdmin or str(order["user"]) == str(current_user.id):
             return order
        else:
             raise HTTPException(status_code=400, detail="Not authorized to view this order")
    else:
        raise HTTPException(status_code=404, detail="Order not found")

@router.put("/{id}/pay", response_model=Order)
async def update_order_to_paid(id: str, current_user: User = Depends(get_current_user)):
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(id)})
    if order:
        if current_user.isAdmin or str(order["user"]) == str(current_user.id):
            update_data = {
                "isPaid": True,
                "paidAt": datetime.utcnow()
                # in real app update paymentResult here too
            }
            await db.orders.update_one({"_id": ObjectId(id)}, {"$set": update_data})
            return await db.orders.find_one({"_id": ObjectId(id)})
        else:
             raise HTTPException(status_code=400, detail="Not authorized")
    else:
        raise HTTPException(status_code=404, detail="Order not found")

@router.get("/", response_model=List[Order], dependencies=[Depends(get_current_admin)])
async def get_orders():
    db = get_database()
    orders = await db.orders.find({}).to_list(length=100)
    return orders

@router.put("/{id}/deliver", dependencies=[Depends(get_current_admin)], response_model=Order)
async def update_order_to_delivered(id: str):
    db = get_database()
    order = await db.orders.find_one({"_id": ObjectId(id)})
    if order:
        update_data = {
            "isDelivered": True,
            "deliveredAt": datetime.utcnow()
        }
        await db.orders.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        return await db.orders.find_one({"_id": ObjectId(id)})
    else:
        raise HTTPException(status_code=404, detail="Order not found")
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(id: str, current_user: User = Depends(get_current_user)):
    db = get_database()
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=404, detail="Invalid ID")
        
    order = await db.orders.find_one({"_id": ObjectId(id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # If admin calls, we do a hard delete
    if current_user.isAdmin:
        await db.orders.delete_one({"_id": ObjectId(id)})
        return None
        
    # If owner calls, we do a soft delete (hide from user)
    if str(order["user"]) == str(current_user.id):
        await db.orders.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"isUserDeleted": True}}
        )
        return None
        
    raise HTTPException(status_code=403, detail="Not authorized to delete this order")

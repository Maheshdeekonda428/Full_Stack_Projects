from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.middleware import JWTMiddleware
from app.api import auth, products, orders, users, upload
# import os

app = FastAPI()

app.add_middleware(JWTMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://d4pfdf5xz48rd.cloudfront.net",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# # Static files for uploaded images
# static_path = os.path.join(os.path.dirname(__file__), "..", "static")
# upload_path = os.path.join(static_path, "uploads")
# os.makedirs(upload_path, exist_ok=True)
# app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

@app.get("/")
async def read_root():
    return {"message": "Welcome to the ShopSmart API"}

# AWS Lambda Handler
from mangum import Mangum
handler = Mangum(app, api_gateway_base_path="/dev")

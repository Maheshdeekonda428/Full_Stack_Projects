from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api import auth, products, orders, users
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        # "http://localhost:5174",
        # "http://localhost:5175",
        # "http://127.0.0.1:5173",
        # "http://127.0.0.1:5174",
        # "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded images
static_path = os.path.join(os.path.dirname(__file__), "..", "static")
os.makedirs(static_path, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_path), name="static")

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

@app.get("/")
async def read_root():
    return {"message": "Welcome to the E-commerce API"}

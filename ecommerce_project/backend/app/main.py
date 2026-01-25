from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api import auth, products, orders, users

# from app.core.database import connect_to_mongo, close_mongo_connection, db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Should be specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# @app.get("/health")
# async def health_check():
#     try:
#         # Ping the database
#         await db.client.admin.command('ping')
#         return {"status": "healthy", "database": "connected"}
#     except Exception as e:
#         return {"status": "unhealthy", "database": str(e)}


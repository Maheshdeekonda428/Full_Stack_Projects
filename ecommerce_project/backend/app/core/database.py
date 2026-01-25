from motor.motor_asyncio import AsyncIOMotorClient
from os import getenv

from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGO_URL)
    print("Connected to MongoDB")

async def close_mongo_connection():
    db.client.close()
    print("Closed MongoDB connection")

def get_database():
    return db.client[settings.DATABASE_NAME]

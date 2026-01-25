import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def seed():
    try:
        load_dotenv()
        url = os.getenv("MONGO_URL")
        db_name = os.getenv("DATABASE_NAME")
        client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=5000)
        db = client[db_name]
        
        product = {
            "name": "Quick Test Product",
            "price": 100,
            "description": "Just a test",
            "category": "Electronics",
            "image": "https://via.placeholder.com/150",
            "countInStock": 10
        }
        
        await db.products.insert_one(product)
        count = await db.products.count_documents({})
        
        with open("seed_result.txt", "w") as f:
            f.write(f"Count: {count}")
            
        client.close()
    except Exception as e:
        with open("seed_result.txt", "w") as f:
            f.write(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(seed())

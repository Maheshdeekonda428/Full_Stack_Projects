"""
Seed script to create initial admin user and sample products.
Run with: python -m app.seed
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_USER = {
    "name": "Admin User",
    "email": "admin@shophub.com",
    "password": pwd_context.hash("admin123"),
    "isAdmin": True
}

SAMPLE_PRODUCTS = [
    {
        "name": "Wireless Bluetooth Headphones",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        "brand": "SoundMax",
        "category": "Electronics",
        "description": "Premium wireless headphones with noise cancellation and 30-hour battery life.",
        "price": 2999,
        "countInStock": 50,
        "rating": 4.5,
        "numReviews": 128,
        "reviews": []
    },
    {
        "name": "Men's Casual Cotton T-Shirt",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        "brand": "UrbanStyle",
        "category": "Clothing",
        "description": "Comfortable 100% cotton t-shirt perfect for casual wear.",
        "price": 599,
        "countInStock": 200,
        "rating": 4.2,
        "numReviews": 89,
        "reviews": []
    },
    {
        "name": "Smart Watch Pro",
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        "brand": "TechFit",
        "category": "Electronics",
        "description": "Advanced smartwatch with heart rate monitor, GPS, and fitness tracking.",
        "price": 4999,
        "countInStock": 30,
        "rating": 4.7,
        "numReviews": 256,
        "reviews": []
    },
    {
        "name": "Running Shoes Air Max",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        "brand": "SportsPro",
        "category": "Sports",
        "description": "Lightweight running shoes with superior cushioning and breathable mesh.",
        "price": 3499,
        "countInStock": 75,
        "rating": 4.4,
        "numReviews": 167,
        "reviews": []
    },
    {
        "name": "Leather Wallet Classic",
        "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500",
        "brand": "LeatherCraft",
        "category": "Clothing",
        "description": "Genuine leather wallet with multiple card slots and RFID protection.",
        "price": 1299,
        "countInStock": 100,
        "rating": 4.3,
        "numReviews": 78,
        "reviews": []
    },
    {
        "name": "Portable Bluetooth Speaker",
        "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
        "brand": "BassBoost",
        "category": "Electronics",
        "description": "Waterproof portable speaker with deep bass and 12-hour playtime.",
        "price": 1999,
        "countInStock": 45,
        "rating": 4.6,
        "numReviews": 203,
        "reviews": []
    },
    {
        "name": "Yoga Mat Premium",
        "image": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
        "brand": "ZenFit",
        "category": "Sports",
        "description": "Non-slip yoga mat with extra cushioning for comfortable workouts.",
        "price": 899,
        "countInStock": 120,
        "rating": 4.1,
        "numReviews": 95,
        "reviews": []
    },
    {
        "name": "Bestseller Novel Collection",
        "image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
        "brand": "BookHouse",
        "category": "Books",
        "description": "Collection of 5 bestselling novels from award-winning authors.",
        "price": 1499,
        "countInStock": 60,
        "rating": 4.8,
        "numReviews": 312,
        "reviews": []
    },
]

async def seed_database():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.DATABASE_NAME]
    
    # Check if admin exists
    existing_admin = await db.users.find_one({"email": ADMIN_USER["email"]})
    if existing_admin:
        print(f"Admin user already exists: {ADMIN_USER['email']}")
    else:
        await db.users.insert_one(ADMIN_USER)
        print(f"✅ Created admin user: {ADMIN_USER['email']} / admin123")
    
    # Check if products exist
    product_count = await db.products.count_documents({})
    if product_count > 0:
        print(f"Products already exist ({product_count} found)")
    else:
        await db.products.insert_many(SAMPLE_PRODUCTS)
        print(f"✅ Created {len(SAMPLE_PRODUCTS)} sample products")
    
    client.close()
    print("\n🎉 Database seeding complete!")
    print("\n📝 Login credentials:")
    print(f"   Email: admin@example.com")
    print(f"   Password: admin123")

if __name__ == "__main__":
    asyncio.run(seed_database())

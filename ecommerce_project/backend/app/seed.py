"""
Seed script to create initial admin user.
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
    
    client.close()
    print("\n🎉 Database seeding complete!")
    print("\n📝 Login credentials:")
    print(f"   Email: admin@shophub.com")
    print(f"   Password: admin123")

if __name__ == "__main__":
    asyncio.run(seed_database())



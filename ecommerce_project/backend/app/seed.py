"""
Seed script to create initial admin user.
Run with: python -m app.seed
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from app.core.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    print("Connecting to MongoDB...")
    
    # Get credentials from settings
    admin_email = settings.admin_email
    admin_password = settings.admin_password
    
    if admin_email == "[EMAIL_ADDRESS]" or admin_password == "[PASSWORD]":
        print("❌ ERROR: Admin credentials not set in .env file!")
        return

    ADMIN_USER = {
        "name": "admin",
        "email": admin_email,
        "password": pwd_context.hash(admin_password),
        "isAdmin": True
    }

    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.DATABASE_NAME]
    
    # Check if admin exists
    existing_admin = await db.users.find_one({"email": admin_email})
    if existing_admin:
        print(f"Admin user already exists: {admin_email}")
    else:
        await db.users.insert_one(ADMIN_USER)
        print(f"✅ Created admin user: {admin_email}")
    
    client.close()
    print("\n🎉 Database seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_database())



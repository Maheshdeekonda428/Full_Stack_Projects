import httpx
import asyncio
from jose import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000"
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def create_test_token(user_id: str):
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode = {"exp": expire, "sub": user_id}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def test_public_route():
    print("\nTesting public route (/api/products)...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/products")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Success: Public route accessible.")
        else:
            print(f"Failure: Public route returned {response.status_code}")

async def test_protected_route_no_token():
    print("\nTesting protected route without token (/api/users/profile)...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/users/profile")
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("Success: Protected route blocked without token.")
        else:
            print(f"Failure: Protected route returned {response.status_code}")

async def test_protected_route_valid_token():
    print("\nTesting protected route with valid token...")
    # This requires a real user ID from the DB or a mock one if the DB is not checked
    # Since my middleware checks the DB, I'll need a valid user ID.
    # I'll try to get one from the products list if possible, or just use a known one.
    
    # For now, let's just attempt with a generic object ID
    token = create_test_token("65b7a1f5e4b0a123456789ab") 
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/users/profile", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Detail: {response.json().get('detail')}")
        if response.status_code == 200:
            print("Success: Protected route accessible with valid token.")
        elif response.status_code == 401 and "User not found" in response.text:
            print("Partial Success: Middleware validated token but user ID was mock.")
        else:
             print(f"Unexpected status: {response.status_code}")

async def main():
    print("Starting JWT Middleware Verification...")
    try:
        await test_public_route()
        await test_protected_route_no_token()
        await test_protected_route_valid_token()
    except Exception as e:
        print(f"Error during verification: {e}")
        print("Make sure the server is running with 'uvicorn app.main:app --reload'")

if __name__ == "__main__":
    asyncio.run(main())

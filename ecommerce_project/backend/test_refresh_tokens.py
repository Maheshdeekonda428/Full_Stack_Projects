import httpx
import asyncio
from jose import jwt
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000/api"
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# Use external test user if possible, otherwise we might need to create one
TEST_USER = {
    "username": "admin@shopsmart.com",
    "password": "admin999"
}

async def verify_everything():
    async with httpx.AsyncClient() as client:
        # 1. Test Login
        print("\n[1] Testing Login...")
        login_data = {"username": TEST_USER["username"], "password": TEST_USER["password"]}
        response = await client.post(f"{BASE_URL}/auth/login", data=login_data)
        
        if response.status_code != 200:
            print(f"FAILED: Login returned {response.status_code}")
            print(f"Detail: {response.text}")
            return

        data = response.json()
        access_token = data.get("access_token")
        refresh_token_cookie = response.cookies.get("refresh_token")
        
        print(f"Access Token: {access_token[:20]}...")
        print(f"Refresh Token Cookie present: {refresh_token_cookie is not None}")
        
        if not access_token or not refresh_token_cookie:
            print("FAILED: Missing access token or refresh token cookie")
            return
        
        print("SUCCESS: Login sets both tokens.")

        # 2. Test Refresh
        print("\n[2] Testing Token Refresh...")
        # Wait a bit if needed (not strictly necessary but good to check if state persists)
        refresh_response = await client.post(f"{BASE_URL}/auth/refresh")
        
        if refresh_response.status_code != 200:
            print(f"FAILED: Refresh returned {refresh_response.status_code}")
            print(f"Detail: {refresh_response.text}")
            return
            
        new_access_token = refresh_response.json().get("access_token")
        print(f"New Access Token: {new_access_token[:20]}...")
        
        if not new_access_token:
            print("FAILED: No new access token returned")
            return
            
        print("SUCCESS: Token refresh works.")

        # 3. Test Logout
        print("\n[3] Testing Logout...")
        logout_response = await client.post(f"{BASE_URL}/auth/logout")
        
        if logout_response.status_code != 200:
            print(f"FAILED: Logout returned {logout_response.status_code}")
            return
            
        # Check if cookie is deleted (httpx handles cookies automatically in the client)
        if client.cookies.get("refresh_token"):
             print("FAILED: Cookie still exists after logout")
             return
             
        print("SUCCESS: Logout clears cookie.")

        # 4. Verify Refresh fails after logout
        print("\n[4] Testing Refresh after logout (should fail)...")
        refresh_after_logout = await client.post(f"{BASE_URL}/auth/refresh")
        if refresh_after_logout.status_code == 401:
            print("SUCCESS: Refresh blocked after logout.")
        else:
            print(f"FAILED: Refresh returned {refresh_after_logout.status_code} instead of 401")

if __name__ == "__main__":
    asyncio.run(verify_everything())

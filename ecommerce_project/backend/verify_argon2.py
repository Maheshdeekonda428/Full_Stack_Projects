import sys
import os

# Add the project root to the python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from app.core.security import get_password_hash, verify_password

def test_hashing():
    print("Testing Argon2 hashing...", flush=True)
    
    # 1. Test normal password
    pwd = "shortpassword"
    hashed = get_password_hash(pwd)
    print(f"Short password hash: {hashed[:20]}...", flush=True)
    if "$argon2" not in hashed:
        print("WARNING: Hash does not look like Argon2", flush=True)
        
    if not verify_password(pwd, hashed):
        print("Short password verification failed", flush=True)
        sys.exit(1)
    print("Short password test passed", flush=True)

    # 2. Test long password (> 72 bytes)
    long_pwd = "a" * 80
    try:
        hashed_long = get_password_hash(long_pwd)
        print(f"Long password hashed successfully. Hash length: {len(hashed_long)}", flush=True)
    except Exception as e:
        print(f"FAILED: Long password hashing raised exception: {e}", flush=True)
        sys.exit(1)

    if not verify_password(long_pwd, hashed_long):
        print("Long password verification failed", flush=True)
        sys.exit(1)
    print("Long password test passed", flush=True)
    
    print("ALL TESTS PASSED", flush=True)

if __name__ == "__main__":
    test_hashing()

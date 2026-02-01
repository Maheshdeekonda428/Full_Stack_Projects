import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "ShopSmart API"
    PROJECT_VERSION: str = "1.0.0"
    
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ecommerce_db")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_secret_key_here_please_change_in_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    admin_email: str = os.getenv("ADMIN_EMAIL", "[EMAIL_ADDRESS]")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "[PASSWORD]")

settings = Settings()

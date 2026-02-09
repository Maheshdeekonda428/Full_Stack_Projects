import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "ShopSmart API"
    PROJECT_VERSION: str = "1.0.0"
    
    MONGO_URL: str = os.getenv("MONGO_URL")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 # 30 minutes
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    admin_email: str = os.getenv("ADMIN_EMAIL")
    admin_password: str = os.getenv("ADMIN_PASSWORD")

    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_S3_REGION: str = os.getenv("AWS_REGION", "ap-south-1")
    AWS_STORAGE_BUCKET_NAME: str = os.getenv("AWS_BUCKET_NAME")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID")

settings = Settings()

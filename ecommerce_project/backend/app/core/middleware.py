from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from jose import jwt, JWTError
from app.core.config import settings
from app.core.database import get_database
from bson import ObjectId

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # List of paths that do not require authentication
        excluded_paths = [
            "/api/auth/login",
            "/api/auth/google/login",
            "/api/auth/google/callback",
            "/api/auth/google-login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/logout",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/verify-email",
            "/api/auth/resend-verification-email",
            "/api/login",
            "/api/google/login",
            "/api/google/callback",
            "/api/register",
            "/api/forgot-password",
            "/api/reset-password",
            "/api/verify-email",
            "/api/resend-verification-email",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/static",
            "/",
            
        ]

        # Check if the request path is in the excluded paths or is a GET request to public routes
        path = request.url.path
        if path in excluded_paths or path.startswith("/static"):
             return await call_next(request)
        
        # Public product routes (GET requests)
        if request.method == "GET" and path.startswith("/api/products"):
            return await call_next(request)

        # Extract the Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid Authorization header"}
            )

        token = auth_header.split(" ")[1]

        try:
            # Decode the token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                return JSONResponse(status_code=401, content={"detail": "Invalid token payload"})
            
            # Optionally fetch the user and attach to request state
            db = get_database()
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if user is None:
                 return JSONResponse(status_code=401, content={"detail": "User not found"})
            
            # Attach user ID to request state for use in dependencies or routes
            request.state.user_id = user_id
            request.state.user = user

        except (JWTError, Exception) as e:
            return JSONResponse(
                status_code=401,
                content={"detail": f"Could not validate credentials: {str(e)}"}
            )

        response = await call_next(request)
        return response

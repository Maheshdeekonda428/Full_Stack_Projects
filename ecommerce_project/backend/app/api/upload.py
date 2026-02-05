from fastapi import APIRouter, UploadFile, File, HTTPException
import asyncio
from app.utils.s3_utilities import upload_file_to_s3
from typing import List
from fastapi.concurrency import run_in_threadpool
import io
import httpx
from pydantic import BaseModel, HttpUrl

router = APIRouter()

class UrlUpload(BaseModel):
    url: HttpUrl

@router.post("/")
async def upload_images(files: List[UploadFile] = File(...)):
    allowed_extensions = ["jpg", "jpeg", "png", "webp"]
    tasks = []
    
    for file in files:
        if not file.filename or "." not in file.filename:
             continue
              
        file_ext = file.filename.split(".")[-1].lower()
        if file_ext not in allowed_extensions:
            continue
        
        # Use threadpool for blocking I/O (S3 upload)
        tasks.append(run_in_threadpool(upload_file_to_s3, file.file, file.filename, file.content_type))
    
    if not tasks:
        raise HTTPException(status_code=400, detail="No valid images provided.")

    # Run all uploads in parallel
    results = await asyncio.gather(*tasks)
    uploaded_urls = [url for url in results if url]
    
    if not uploaded_urls:
         raise HTTPException(status_code=500, detail="Failed to upload images to S3.")
         
    return {"images": uploaded_urls}

@router.post("/url")
async def upload_image_from_url(url_in: UrlUpload):
    url_str = str(url_in.url)
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url_str)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Failed to fetch image from URL. Status: {response.status_code}")
            
            content_type = response.headers.get("content-type", "image/jpeg")
            if not content_type.startswith("image/"):
                raise HTTPException(status_code=400, detail="URL does not point to a valid image.")
            
            # Extract filename from URL or use a default
            filename = url_str.split("/")[-1].split("?")[0] or "image.jpg"
            if "." not in filename:
                filename += ".jpg"
            
            # Wrap bytes in BytesIO for upload_file_to_s3
            file_obj = io.BytesIO(response.content)
            
            s3_url = await run_in_threadpool(upload_file_to_s3, file_obj, filename, content_type)
            
            if not s3_url:
                raise HTTPException(status_code=500, detail="Failed to upload image to S3.")
                
            return {"url": s3_url}
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=400, detail=f"Error fetching image: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    
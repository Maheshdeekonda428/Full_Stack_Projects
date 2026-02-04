from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from fastapi.concurrency import run_in_threadpool
import asyncio
from app.utils.s3_utilities import upload_file_to_s3

router = APIRouter()

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

    
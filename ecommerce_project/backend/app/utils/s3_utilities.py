import boto3
from botocore.exceptions import NoCredentialsError, ClientError
from app.core.config import settings
import logging
import uuid


def upload_file_to_s3(file_obj, filename, content_type):
    """
    Uploads a file to an S3 bucket and returns the public URL.
    Ensures filename is unique.
    """
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION
    )

    # Generate unique filename
    ext = filename.split('.')[-1] if '.' in filename else ''
    unique_filename = f"{uuid.uuid4()}.{ext}" if ext else f"{uuid.uuid4()}"

    try:
        s3_client.upload_fileobj(
            file_obj,
            settings.AWS_STORAGE_BUCKET_NAME,
            unique_filename,
            ExtraArgs={'ContentType': content_type}
        )
        # Construct URL
        url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION}.amazonaws.com/{unique_filename}"
        logging.info(f"File uploaded successfully to S3: {url}")
        return url
    except (NoCredentialsError, ClientError) as e:
        logging.error(f"S3 Upload Error for {filename}: {e}")
        return None

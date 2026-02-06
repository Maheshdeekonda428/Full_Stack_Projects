# AWS Deployment Guide - ShopSmart

This guide provides clean, step-by-step instructions to deploy your website using the requested AWS architecture.

## Phase 1: Backend (Docker → Lambda → API Gateway)

### 1. Create ECR Repository
1.  Go to **Amazon ECR** console.
2.  Click **Create repository**.
3.  Name it `shopsmart-backend`.
4.  Copy the **URI** (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com/shopsmart-backend`).

### 2. Build and Push Image
Run these commands in your `backend/` directory:
```bash
# Login to ECR (Replace <region> and <aws_account_id>)
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com

# Build image
docker build -t shopsmart-backend .

# Tag and push
docker tag shopsmart-backend:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/shopsmart-backend:latest
docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/shopsmart-backend:latest
```

### 3. Create Lambda Function
1.  Go to **AWS Lambda** console -> **Create function**.
2.  Choose **Container image**.
3.  Function name: `shopsmart-api`.
4.  Select the image from your ECR repo.
5.  **Configuration** -> **Environment variables**: Add all keys from your `.env` (MONGO_URL, SECRET_KEY, etc.).
6.  **Configuration** -> **General configuration**: Set **Timeout** to 30 seconds.

### 4. Setup API Gateway
1.  Go to **API Gateway** console -> **Create API** -> **HTTP API**.
2.  Add **Integration** -> **Lambda**, and select `shopsmart-api`.
3.  Set **API name** to `shopsmart-gateway`.
4.  Configure routes: Set **Method** to `ANY` and **Resource path** to `/{proxy+}`.
5.  Copy the **Invoke URL** (e.g., `https://abcdefgh.execute-api.us-east-1.amazonaws.com`).

---

## Phase 2: Frontend (S3 + CloudFront)

### 1. Build React App
1.  Open `frontend/.env.production` and paste your **Invoke URL** as `VITE_API_URL`.
2.  Run: `npm run build` in the `frontend/` folder.

### 2. S3 Hosting
1.  Go to **Amazon S3** console -> **Create bucket** (e.g., `shopsmart-web-client`).
2.  Disable "Block all public access" (or use CloudFront OAI for better security).
3.  **Properties** -> **Static website hosting** -> **Enable**. Set index document to `index.html`.
4.  Upload the contents of `frontend/dist/` to the bucket.

### 3. CloudFront Distribution
1.  Go to **CloudFront** console -> **Create distribution**.
2.  **Origin domain**: Select your S3 bucket endpoint.
3.  **Default cache behavior**: Viewer protocol policy -> **Redirect HTTP to HTTPS**.
4.  **Error pages**:
    -   Create custom error response for **404**: Customize response -> Yes, Path: `/index.html`, Status: **200**.
    -   Create custom error response for **403**: Customize response -> Yes, Path: `/index.html`, Status: **200**.
5.  Wait for deployment and use the CloudFront **Distribution domain name** to access your site!

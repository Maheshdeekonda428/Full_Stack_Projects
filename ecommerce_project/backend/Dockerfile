# Use the official AWS Lambda base image for Python
# FROM public.ecr.aws/lambda/python:3.11
FROM python:3.11-slim

WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

EXPOSE 8000

# Set the CMD to your handler (app.main.handler)
# "app.main.handler"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

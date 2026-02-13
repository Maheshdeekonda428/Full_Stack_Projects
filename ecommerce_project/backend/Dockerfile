# Use the official AWS Lambda base image for Python
FROM public.ecr.aws/lambda/python:3.10

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code and static files
COPY ./app ./app
COPY ./static ./static

# Set the CMD to your handler (app.main.handler)
CMD ["app.main.handler"]


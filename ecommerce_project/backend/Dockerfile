# Use the official AWS Lambda base image for Python
FROM public.ecr.aws/lambda/python:3.11

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy the application code
COPY ./app ./app

# Set the CMD to your handler (app.main.handler)
CMD ["app.main.handler"]

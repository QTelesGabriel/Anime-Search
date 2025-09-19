# Uses a base image that includes a shell environment
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the wait-for-it script and make it executable first
COPY ./wait-for-it.sh .
RUN chmod +x /app/wait-for-it.sh

# Copy requirements and install dependencies
COPY ./requirements.txt .
RUN apt-get update && apt-get install -y build-essential python3-dev postgresql-client && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application code from the 'app' subfolder
COPY ./app ./app

# Use the wait-for-it script as the entrypoint
# This ensures the database is ready before starting the app
ENTRYPOINT ["/app/wait-for-it.sh", "db"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
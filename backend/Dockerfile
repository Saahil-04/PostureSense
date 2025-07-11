# Use Python 3.11 slim image
FROM python:3.11-slim

# Environment setup
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg libsm6 libxext6 libgl1-mesa-glx && \
    pip install --upgrade pip

# Set working directory
WORKDIR /app

# Copy everything
COPY . /app

# Install Python dependencies
RUN pip install -r requirements.txt

# Expose the port
EXPOSE 8000

# Start the FastAPI app using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

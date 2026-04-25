# Stage 1: Runtime stage
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set Python path for imports to ensure modules are found
ENV PYTHONPATH=/app

# Install minimal system dependencies for Python packages (e.g., for SQL drivers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
# This maintains the structure /app/src/app/main.py
COPY src/ src/

# Copy ML model artifact to expected runtime location
COPY src/serving/model /app/model

# Expose the API port (standardizing on 8000 as you've set in Azure)
EXPOSE 8000

# Start the API with uvicorn
# We use --app-dir src so that 'app.main:app' maps correctly to src/app/main.py
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "src"]
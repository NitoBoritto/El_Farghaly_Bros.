# Stage 1: Build stage
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set Python path for imports
ENV PYTHONPATH=/app

# Install minimal system dependencies required for Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY src/ src/

# Copy checked-in MLflow model artifact to expected runtime location
# inference.py looks for the model at /app/model
COPY src/serving/model /app/model

# Expose the API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "from urllib.request import urlopen; urlopen('http://localhost:8000/health').read()" || exit 1

# Start the API with uvicorn
CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000"]

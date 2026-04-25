FROM python:3.11-slim

WORKDIR /app

# Ensure we have the basics for adding repositories
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    gnupg \
    ca-certificates \
    unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# Add the Microsoft GPG key and repository using the modern method
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-prod.gpg \
    && curl https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
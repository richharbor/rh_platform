FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY services/api/requirements.txt /tmp/requirements.txt
COPY services/api/requirements-dev.txt /tmp/requirements-dev.txt

RUN pip install --no-cache-dir -r /tmp/requirements.txt -r /tmp/requirements-dev.txt

COPY services/api /app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "debug"]

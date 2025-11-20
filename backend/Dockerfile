# Multi-stage build for Django backend
FROM python:3.11-alpine as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    file-dev \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    poppler-utils \
    jpeg-dev \
    zlib-dev \
    freetype-dev \
    lcms2-dev \
    openjpeg-dev \
    tiff-dev

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY pyproject.toml ./
RUN pip install --upgrade pip
RUN pip install -e .

# Production stage
FROM python:3.11-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-libs \
    file \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    poppler-utils \
    libjpeg \
    zlib \
    freetype \
    lcms2 \
    openjpeg \
    tiff

# Create app user
RUN addgroup -S app && adduser -S app -G app

# Set work directory
WORKDIR /app

# Copy Python dependencies from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy project
COPY . .

# Create media directory
RUN mkdir -p /app/media/proformas && chown -R app:app /app/media

# Change ownership to app user
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]

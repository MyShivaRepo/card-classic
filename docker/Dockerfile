# ============================================================
# Stage 1 — Build React/Vite frontend
# ============================================================
FROM node:20-alpine AS frontend-build

WORKDIR /build/frontend

# Install dependencies (cached layer)
COPY frontend/package*.json ./
RUN npm install

# Build
COPY frontend/ ./
RUN npm run build


# ============================================================
# Stage 2 — Python/Flask backend + built frontend
# ============================================================
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy the compiled React app into Flask's static folder
COPY --from=frontend-build /build/frontend/dist ./static

# Volume for persistent SQLite database
# (mount a host directory or a named volume here to preserve data across rebuilds)
VOLUME ["/data"]

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:3000/api/contacts')" || exit 1

CMD ["python", "app.py"]

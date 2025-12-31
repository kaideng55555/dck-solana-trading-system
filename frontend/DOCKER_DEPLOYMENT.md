# 🐳 Docker Deployment Guide

Complete guide for deploying DCK Tools with Docker.

---

## 📋 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- Ports available: 3000 (frontend), 8000 (backend), 5432 (postgres), 6379 (redis)

---

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/kaideng55555/src.git
cd src
```

### 2. Configure Environment

Create `.env` file:

```bash
# Frontend
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_NETWORK=mainnet-beta

# Backend
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
REDIS_URL=redis://redis:6379
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/dcktools
```

### 3. Build and Run

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 📦 Services

### Frontend (React + Vite)
- **Port**: 3000
- **Tech**: React 18, TypeScript, Vite, Tailwind CSS
- **Build**: Multi-stage with nginx
- **Size**: ~50MB (optimized)

### Backend (FastAPI)
- **Port**: 8000
- **Tech**: Python 3.11, FastAPI, WebSockets
- **Features**: Real-time token data, REST API
- **Workers**: 4 (configurable)

### Redis
- **Port**: 6379
- **Purpose**: Caching, pub/sub
- **Persistence**: Volume mounted

### PostgreSQL
- **Port**: 5432
- **Purpose**: Token history, user data
- **Persistence**: Volume mounted

---

## 🛠️ Development Mode

Run with hot reload:

```bash
# Frontend only (dev mode)
npm run dev

# Backend only (dev mode)
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# All services with volumes
docker-compose -f docker-compose.dev.yml up
```

---

## 🏭 Production Deployment

### Option 1: Docker Compose (Single Server)

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Enable auto-restart
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### Option 2: Kubernetes (Scalable)

```bash
# Build and push images
docker build -t dcktools/frontend:latest .
docker push dcktools/frontend:latest

cd backend
docker build -t dcktools/backend:latest .
docker push dcktools/backend:latest

# Apply K8s manifests
kubectl apply -f k8s/
```

### Option 3: Cloud Run (Serverless)

```bash
# Build and deploy frontend
gcloud builds submit --tag gcr.io/PROJECT_ID/dcktools-frontend
gcloud run deploy dcktools-frontend --image gcr.io/PROJECT_ID/dcktools-frontend

# Build and deploy backend
cd backend
gcloud builds submit --tag gcr.io/PROJECT_ID/dcktools-backend
gcloud run deploy dcktools-backend --image gcr.io/PROJECT_ID/dcktools-backend
```

---

## 🔧 Configuration

### Nginx Tuning

Edit `nginx.conf`:

```nginx
# Increase worker connections
worker_connections 4096;

# Adjust buffer sizes
client_max_body_size 10M;
```

### Backend Scaling

Edit `docker-compose.yml`:

```yaml
backend:
  deploy:
    replicas: 4  # Scale to 4 instances
    resources:
      limits:
        cpus: '2'
        memory: 2G
```

---

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Check Resources

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up
docker system prune -a
```

### Health Checks

```bash
# Frontend
curl http://localhost:3000

# Backend
curl http://localhost:8000/health

# Redis
docker exec -it dcktools-redis redis-cli ping

# Postgres
docker exec -it dcktools-postgres psql -U postgres -c "SELECT 1"
```

---

## 🔒 Security

### Production Checklist

- [ ] Change default passwords in `.env`
- [ ] Use secrets management (Docker Secrets, AWS SSM)
- [ ] Enable HTTPS with reverse proxy (Caddy, Nginx)
- [ ] Configure CORS for specific domains
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Use non-root users in containers
- [ ] Scan images for vulnerabilities

### Example: Using Docker Secrets

```yaml
services:
  backend:
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    external: true
  api_key:
    external: true
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Inspect container
docker inspect dcktools-backend

# Enter container
docker exec -it dcktools-backend sh
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Change port in docker-compose.yml
ports:
  - "3001:80"  # Use 3001 instead
```

### Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory

# Or add to docker-compose.yml
services:
  backend:
    mem_limit: 2g
```

### Database Connection Failed

```bash
# Check postgres is running
docker-compose ps postgres

# Test connection
docker exec -it dcktools-backend python -c "import psycopg2; print('OK')"

# Reset database
docker-compose down -v
docker-compose up -d
```

---

## 📈 Performance Optimization

### Frontend

- Enable nginx gzip compression ✅
- Cache static assets (1 year) ✅
- Minify JS/CSS (automatic with Vite) ✅
- Use CDN for static assets
- Implement service worker

### Backend

- Use Redis for caching
- Enable database connection pooling
- Implement rate limiting
- Use async/await throughout
- Add indexes to database queries

### Database

```sql
-- Add indexes for common queries
CREATE INDEX idx_tokens_mint ON tokens(mint);
CREATE INDEX idx_tokens_created_at ON tokens(created_at DESC);
CREATE INDEX idx_tokens_market_cap ON tokens(market_cap DESC);
```

---

## 🔄 Backup & Restore

### Backup

```bash
# Backup database
docker exec dcktools-postgres pg_dump -U postgres dcktools > backup.sql

# Backup redis
docker exec dcktools-redis redis-cli SAVE
docker cp dcktools-redis:/data/dump.rdb ./redis-backup.rdb

# Backup volumes
docker run --rm -v dcktools_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

### Restore

```bash
# Restore database
docker exec -i dcktools-postgres psql -U postgres dcktools < backup.sql

# Restore redis
docker cp ./redis-backup.rdb dcktools-redis:/data/dump.rdb
docker-compose restart redis
```

---

## 📝 Useful Commands

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose build --no-cache frontend

# Scale service
docker-compose up -d --scale backend=3

# View container shell
docker exec -it dcktools-backend sh

# Export logs
docker-compose logs > logs.txt

# Update images
docker-compose pull
docker-compose up -d
```

---

## 🌐 Reverse Proxy (Optional)

### Using Caddy

Create `Caddyfile`:

```
dcktools.com {
    reverse_proxy frontend:80
}

api.dcktools.com {
    reverse_proxy backend:8000
}
```

Add to `docker-compose.yml`:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
```

---

## 📚 Next Steps

1. **Implement Backend API**
   - Token discovery from Raydium/Pump.fun
   - Real-time price feeds
   - WebSocket subscriptions

2. **Add Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Alert manager

3. **Set Up CI/CD**
   - GitHub Actions
   - Automated testing
   - Auto-deploy on push

4. **Scale Infrastructure**
   - Load balancer
   - Multiple backend instances
   - Database read replicas

---

## 🛠️ Development Best Practices

### Python Cache Cleanup

Clean Python cache files regularly when working with the backend:

```bash
# Remove __pycache__ directories and .pyc files
find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find backend -type f -name "*.pyc" -delete

# Or use docker-compose
docker-compose exec backend sh -c "find . -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null"
```

### Pre-commit Hooks

Install pre-commit hooks to catch issues before committing:

```bash
# Install pre-commit (requires Python)
pip install pre-commit

# Install hooks
pre-commit install

# Run hooks manually
pre-commit run --all-files
```

The repository includes `.pre-commit-config.yaml` with:
- Trailing whitespace removal
- End-of-file fixing
- YAML/JSON validation
- Python formatting (Black)
- Python linting (Flake8)

### Database Files

Database files (`.sqlite`, `.sqlite3`, `.db`) are excluded from version control via `.gitignore`. Always:
- Use separate development and production databases
- Include database migrations in version control
- Never commit actual database files
- Document schema changes in migration files

---

**🎉 Your DCK Tools platform is now Dockerized and ready for deployment!**

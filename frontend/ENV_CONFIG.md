# Environment Configuration Guide

This document explains the environment configuration for DCK Tools.

## Environment Files

### Root Level

#### `.env.example`
- **Purpose**: Template for environment variables
- **Location**: `/` (root directory)
- **Status**: Committed to repository
- **Usage**: Copy to `.env.local` for local development
- **Variables**:
  - `VITE_SOLANA_RPC_URL`: Solana RPC endpoint (required)
  - `VITE_API_URL`: Backend API URL (default: `http://localhost:8000`)
  - `VITE_WS_URL`: WebSocket URL (default: `ws://localhost:8000`)
  - `VITE_NETWORK`: Solana network (default: `mainnet-beta`)
  - `VITE_ENABLE_DEVTOOLS`: Enable developer tools (default: `false`)

#### `.env` (if exists)
- **Status**: Should NOT exist at root level
- **Security**: If found, should be added to `.gitignore` and removed from repository
- **Note**: Use `.env.local` or `.env.production` instead

### Backend Level

#### `backend/.env`
- **Purpose**: Backend configuration
- **Location**: `/backend/` directory
- **Status**: Contains production configuration (should be in `.gitignore`)
- **Variables**:
  - `RPC_HTTP_URLS`: Comma-separated Solana HTTP RPC URLs
  - `RPC_WS_URLS`: Comma-separated Solana WebSocket RPC URLs
  - `MULTI_RPC_MODE`: Multi-RPC failover mode (`parallel` or `rr`)
  - `WATCHER_ENABLED`: Enable token watcher (default: `true`)
  - `FAST_MODE`: Enable fast mode performance settings (default: `true`)
  - `XIE_MODE`: Risk analysis mode (`off` for maximum speed)
  - `WATCH_PROGRAMS`: Comma-separated Solana program IDs to monitor
  - `LOG_LEVEL`: Logging level (default: `INFO`)

## Port Configuration

### Backend
- **Default Port**: `8000`
- **Configuration**: Set in `backend/main.py` (line 163)
- **URL**: `http://0.0.0.0:8000`

### Frontend
- **Development Port**: `5173` (Vite default)
- **API Connection**: Uses `VITE_API_URL` or defaults to `http://localhost:8000`

## Security Best Practices

1. **Never commit `.env` files** containing sensitive data
2. **Use `.env.example`** as a template with safe defaults
3. **Store production secrets** in secure environment variable systems
4. **Review `.gitignore`** to ensure environment files are excluded
5. **Rotate RPC endpoints** regularly for security

## Database Configuration

### SQLite Database
- **Location**: `backend/events.sqlite`
- **Path Configuration**: Absolute path in `backend/watcher_kit/db.py`
- **Size**: ~51MB (production data)
- **Status**: Excluded from git via `.gitignore`

## Dependency Notes

### Backend Dependencies
- **Critical**: `aiosqlite==0.20.0` (required for database operations)
- **Solana**: Version constraints for compatibility:
  - `solana==0.32.0`
  - `solders>=0.20.0,<0.21.0`
  - `websockets>=9.0,<12.0`
  - `httpx>=0.23.0,<0.24.0`

## Troubleshooting

### Backend won't start
1. Check Python dependencies: `pip install -r backend/requirements.txt`
2. Verify `.env` file exists in `backend/` directory
3. Check database file exists: `backend/events.sqlite`
4. Verify port 8000 is not in use

### Frontend can't connect to backend
1. Verify backend is running on port 8000
2. Check `VITE_API_URL` in frontend environment
3. Ensure CORS is properly configured in `backend/main.py`
4. Check browser console for connection errors

### Database errors
1. Ensure `aiosqlite` is installed
2. Verify database path is correct in `backend/watcher_kit/db.py`
3. Check database file permissions
4. Verify SQLite database is not corrupted

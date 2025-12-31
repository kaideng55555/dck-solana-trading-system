# DCK Tools - Professional Trading Dashboard

A React + TypeScript + Vite trading platform with cyberpunk aesthetics, featuring real-time Solana token feeds, portfolio tracking, and bonding curve monitoring.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 🔧 Development Best Practices

#### Pre-commit Hooks (Optional)

Install pre-commit hooks to catch issues before committing:

```bash
# Install pre-commit (requires Python)
pip install pre-commit

# Install hooks
pre-commit install

# Run hooks manually
pre-commit run --all-files
```

The `.pre-commit-config.yaml` includes:
- Trailing whitespace removal
- End-of-file fixing
- YAML/JSON validation
- Python formatting (Black) and linting (Flake8)

#### Python Cache Cleanup

If you work with the Python backend, clean cache files regularly:

```bash
# Remove all Python cache files
find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find backend -type f -name "*.pyc" -delete
```

#### CSS Import Guidelines

When importing CSS files, use proper CSS `@import` syntax:

```css
/* ✅ Correct */
@import './styles.css';
@import url('https://fonts.googleapis.com/...');

/* ❌ Wrong - JavaScript syntax */
import './styles.css';
```

## 📦 Deploy to Vercel

**See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete deployment guide.**

Quick deploy:

1. Push code to GitHub
2. Visit [https://vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables (see `.env.example`)
5. Click "Deploy"

Your app will be live in 2-3 minutes! 🎉

## Available Scripts

- `npm run dev` - Start Vite dev server with hot reload
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run test` - Run Vitest unit tests (watch mode)
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler without emitting files

## Features

### 🏠 Dashboard

- **3-Column Token Feeds**: Newest tokens, bonding curve progress, graduated tokens
- **Real-time Updates**: WebSocket integration for live price and volume data
- **Portfolio Tracking**: PnL monitoring and activity feeds
- **Professional UI**: BullX/Pump.fun style interface with DCK cyberpunk aesthetics

### 🎨 Design System

- **Neon Colors**: Teal (`#2FD9FF`), Hot Pink (`#FF41D6`), custom gradients
- **Dripping Graffiti Typography**: Street art inspired fonts and effects
- **Dark Theme**: Cyberpunk background with glow effects

### 🔐 Security First

- Token authority validation (mint/freeze checks)
- Risk assessment for all tokens
- Liquidity verification
- Age-based filtering

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

- **Multi-version testing**: Node.js 18.x and 20.x
- **Quality checks**: Linting, type checking, tests
- **Coverage reporting**: Codecov integration (requires `CODECOV_TOKEN` secret)

## Project Structure

```text
/components      Trading dashboard, charts, token feeds
/contexts        Wallet and theme context providers
/services        WebSocket and API integration
/styles          DCK neon theme and CSS
/src             Additional app files
```

## 🤖 AI Coding Agent Guide

For repo-specific conventions and architecture notes for AI tools (Copilot, Cursor, etc.), see [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

A shorter quick-reference guide is also available at [`docs/COPILOT_INSTRUCTIONS.md`](docs/COPILOT_INSTRUCTIONS.md).

## Environment Variables

Use Vite conventions (prefix with `VITE_`):

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_NETWORK=mainnet-beta
```

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint 9 (flat config)
- **Charts**: Recharts + Technical Indicators
- **Blockchain**: Solana Web3.js, Wallet Adapters
- **Real-time**: Socket.io Client

## Development Notes

- ESLint uses new flat config format (`eslint.config.js`)
- Module type set to `"module"` in `package.json`
- TypeScript strict mode enabled
- Test setup includes jsdom environment

## Known Issues

- Some peer dependency warnings from Solana wallet adapters (non-breaking)
- `main-broken.tsx` renamed to `.bak` (excluded from builds)
- Several linting warnings in components (non-critical, mostly `any` types)

## Next Steps

To resolve linting warnings:

1. Define proper TypeScript interfaces for WebSocket data
2. Move component definitions outside render functions
3. Use `useMemo` for expensive calculations in components
4. Replace `Date.now()` calls in render with state or refs

---

### Built with ⚡ by DCK Tools

---

## 🌐 Live Deployment

Production URL: `https://your-project.vercel.app` (after deployment)

For deployment help, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

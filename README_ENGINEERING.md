
DCK Solana Trading System — Engineer Handoff (Clean)

This archive contains a clean, canonical reference for the DCK + XIE system.
Purpose: unblock engineering, establish truth, and restart momentum.

STACK
- Frontend: Vite + React (dck-dashboard)
- Backend: FastAPI (backend_python)
- Chain: Solana
- Infra: QuickNode
- AI/Risk Engine: XIE
- NFT / Access: Digital TCG
- Randomness (v1): Switchboard VRF (Solana only)

CORE MODULES
1. XIE Risk Engine
   - Wallet clustering
   - Sniper detection
   - Bonding curve abuse detection
   - Narrative / meme velocity hooks (stubbed)

2. Backend API (FastAPI)
   - /xie/*
   - /risk/*
   - /sniper/*
   - /execution/*
   - /ws/*
   - /notifications/*

3. Frontend
   - TokenPageXIE.tsx (XIE visualization + hooks)
   - Dashboard shell
   - Auth / access gating (stub)

CURRENT STATE
- Backend runs locally
- Frontend builds but UI is incomplete
- XIE logic exists but is fragmented across copies
- No single source of truth until now

WHAT ENGINEERS SHOULD DO FIRST
1. Treat this zip as canonical
2. Rehydrate repo from this structure
3. Wire backend -> frontend
4. Verify XIE endpoints
5. Add logging + tests
6. Ship demo UI

DECISIONS LOCKED
- Solana-only v1
- Switchboard VRF for randomness
- No multi-chain until v2
- No speculative token promises

Founder: Kaiden Giles
Project: DCK$ Tools + XIE

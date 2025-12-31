# Bonding Curve Path B Implementation (Pump.fun-like)

This doc is the **engineering plan** for real curve-driven Trenches staging:
**New Creations → About to Graduate → Graduated**.

## Goal
Make stage/progress a **source of truth** from on-chain curve state (not market-cap guesses).

---

## Contracts

### Backend emits (WS)
- `TOKEN_NEW`
- `TOKEN_UPDATE`
- `TOKEN_STAGE`
- `TOKEN_EXPIRE`

#### TOKEN_STAGE payload (minimum)
```json
{
  "type": "TOKEN_STAGE",
  "mint": "<base58>",
  "stage": "new|about_to_graduate|graduated",
  "progress": 0.0,
  "sold": 0,
  "total": 0,
  "priceSol": 0.0,
  "lpCreated": false,
  "ts": 1730000000
}
```

### Frontend consumes
Frontend should treat the above as **truth** and use:
- `stage` to choose Trenches column
- `progress` to render curve strip and about-to-graduate threshold marker

---

## Stage Rules (locked)
- `lpCreated === true` → `graduated`
- else if `progress >= ABOUT_TO_GRADUATE_PCT` → `about_to_graduate`
- else → `new`

Recommended defaults:
- `ABOUT_TO_GRADUATE_PCT = 0.90` (tune later)

---

## Backend modules

### 1) Curve state reader (new module)
File: `backend_python/curve_state.py`

Responsibilities:
- derive curve PDA for a mint
- fetch `getAccountInfo` from RPC
- parse account data (Anchor/Borsh)
- compute:
  - sold / total
  - progress
  - current curve price (SOL)
  - lpCreated (flag or derived)
- return normalized `CurveState`

### 2) Watcher integration
File: `backend_python/watch_all_coins.py`
After mint detection:
- call `get_curve_state(mint)`
- emit `TOKEN_STAGE` immediately
- schedule periodic refreshes (e.g., every 2–5s for hot tokens)

### 3) XIE API support
File: `backend_python/xie_api.py`
Add:
- `GET /xie/curve/{mint}` -> CurveState
- `POST /xie/analyze` -> { curve: CurveState, risk: RiskState, preset: SnipePresetOut }

---

## PDA + parsing checklist
To implement PDA derivation and parsing, you need:
- bonding curve program id (base58)
- seeds used for curve account PDA
- account layout (Anchor IDL strongly preferred)

If Anchor:
- use IDL to map fields (supply sold, supply total, flags)
If Borsh:
- implement borsh struct decoding and validate with known accounts.

---

## LP Created detection
Preferred: curve program stores `lpCreated` boolean.

Fallback approaches:
1) check for known DEX pool creation instruction (Raydium) for that mint
2) query for pool account existence
3) watch on-chain logs for LP creation event signature

---

## Recommended performance approach (Cheaper + Faster)
- cache curve state for each mint for short TTL (250–500ms) for UI requests
- for hot tokens, push stage updates over WS to avoid polling from UI
- limit on-chain reads per mint using:
  - refresh interval scaling with volatility
  - exponential backoff on RPC errors

---

## Testing plan
- Unit test parsing with captured base64 account blobs
- Integration test:
  - mint discovered -> TOKEN_STAGE emitted
  - progress crosses threshold -> stage changes to about_to_graduate
  - lpCreated flips -> stage becomes graduated
- E2E: UI columns update without refresh



# Backend Fee Override Patch (50 bps ready)

This patch adds a **flat fee override** to `backend/fees.py` so your backend can match the
frontend's `VITE_FEE_BPS` (e.g., **50 bps = 0.5%**). If `FEE_BPS_OVERRIDE` is set in env,
the backend applies that flat fee and routes it to the `protocol` treasury by default.

## Apply in VS Code

1. Download this zip.
2. In VS Code, open your project root (folder that contains `backend/`).
3. Unzip it into your project so it writes to `backend/fees.py`.
   - Alternatively, run in Terminal:
     ```bash
     unzip -o ~/Downloads/backend-fee-flat-override-patch.zip -d ~/dck-solana-trading-system_clean
     ```

4. Create/update **backend/.env** (VS Code will use this if you set `envFile` in `launch.json`):
   ```env
   PROTOCOL_TREASURY=FaciyzhG9zvki2uRxUfrhghGnv2aFBHibsSnRHoeqd9y
   CREATOR_TREASURY=FaciyzhG9zvki2uRxUfrhghGnv2aFBHibsSnRHoeqd9y
   LP_TREASURY=FaciyzhG9zvki2uRxUfrhghGnv2aFBHibsSnRHoeqd9y
   FEE_BPS_OVERRIDE=50
   ```

5. (Optional) VS Code debug config `.vscode/launch.json` example:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Backend (uvicorn)",
         "type": "python",
         "request": "launch",
         "module": "uvicorn",
         "args": ["main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
         "envFile": "${workspaceFolder}/backend/.env",
         "cwd": "${workspaceFolder}/backend"
       }
     ]
   }
   ```

6. If you use **Docker Compose**, put the same env vars under the `backend` service.

## Verify
- Restart your backend.
- Hit whatever endpoint returns fee breakdown (or add a print in `calculate_fee_breakdown`) and confirm:
  - `total_pct` ≈ `0.005` (for 50 bps)
  - `protocol` > 0, `creator` = `lp` = 0 when override is on

## Turn off override
- Remove `FEE_BPS_OVERRIDE` or set to `0` to go back to tiered fees.

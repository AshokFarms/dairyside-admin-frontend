# Deploying the DairySide Admin Panel

The admin panel is **two services** — a static frontend (this repo) and the
`admin-backend` API. Deploy the **backend first** so you know its URL, then the
frontend, then connect them. Config is already in the repos:

- **Frontend** → `vercel.json` (SPA rewrite so `/login`, `/orders`, … survive refresh)
- **Backend** → `admin-backend/render.yaml` (Render Blueprint)

Both `.env` files are gitignored — all secrets/URLs are set in the **host dashboards**, never committed.

---

## Step 1 — Deploy the backend (Render)

1. Push `admin-backend` to GitHub (it has `render.yaml`, `start` script, health check).
2. Render Dashboard → **New → Blueprint** → select the `admin-backend` repo.
3. Render reads `render.yaml` and prompts for each secret. Fill in:

   | Var | Value |
   |---|---|
   | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | your Aiven MySQL creds |
   | `BREVO_API_KEY` | your Brevo key (for order-delivered emails) |
   | `ADMIN_CORS_ORIGINS` | **leave blank for now** — set in Step 3 |
   | `FRONTEND_URL` | **leave blank for now** — set in Step 3 |

4. Deploy. When live you'll get a URL like `https://dairyside-admin-api.onrender.com`.
5. Verify: open `https://<that-url>/health` → should return `{"success":true,"data":{"status":"ok"...}}`.

> Free-tier Render sleeps after ~15 min idle; the first request after sleep takes ~30 s to wake. Fine for an internal admin panel.

---

## Step 2 — Deploy the frontend (Vercel)

1. Push this repo (`DairySide-admin`) to GitHub.
2. Vercel → **Add New → Project** → import the repo. Vercel auto-detects Vite + reads `vercel.json`.
3. Under **Environment Variables**, add:

   | Var | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://dairyside-admin-api.onrender.com/v1` (your Render URL **+ `/v1`**) |
   | `VITE_APP_NAME` | `DairySide Admin` |

   > `VITE_*` vars are baked in at **build time** — if you change this later you must **redeploy**, not just restart.

4. Deploy. You'll get a URL like `https://dairyside-admin.vercel.app` — **this is your live admin panel URL.**

---

## Step 3 — Connect them (CORS + email links)

Back in Render → the API service → **Environment**:

1. Set `ADMIN_CORS_ORIGINS` = your Vercel URL (e.g. `https://dairyside-admin.vercel.app`).
   Without this the browser blocks every API call.
2. Set `FRONTEND_URL` = the same Vercel URL (used for links inside emails).
3. Save → Render redeploys automatically.

Then open the Vercel URL → you should land on the **login page**:

```
Email:    admin@dairyside.in
Password: DairySide@2026
```

Sign in → the dashboard should load real data. Done. 🎉

---

## Step 4 — Before you share it publicly (security)

The static login is a **UI gate only** (credentials live in the JS bundle). The
API itself is currently open. Before exposing this beyond trusted people:

- On Render set `ADMIN_AUTH_ENABLED=true` and `ADMIN_UIDS=<firebase-admin-uid(s)>`
  so the **API** enforces auth, not just the panel.
- Consider changing the static login creds in `src/auth/session.js` and redeploying.

---

## Custom domain (optional)
- **Frontend:** Vercel → Project → Domains → add e.g. `admin.dairyside.in`.
- Then update Render `ADMIN_CORS_ORIGINS` and `FRONTEND_URL` to that domain and redeploy.

## Quick reference — what points where
```
Browser ──> Vercel (admin panel)  VITE_API_BASE_URL ──> Render (admin API) ──> Aiven MySQL
                                              ▲
                        Render ADMIN_CORS_ORIGINS must list the Vercel origin
```

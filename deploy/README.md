# Deployment Runbook — `ussy.host` (Living Edition)

> **Operator Note**: Deployment is intentionally manual and gated behind Kyle's explicit approval. Neither CI nor autonomous agents should touch live servers automatically.

## What Changed From Issue 01 (`v6.0.0` -> `v7.0.0`)

1. **Static Build Artifact (`dist/`)**:
   - Astro 7 compiles all pages (`/`, `/issues`, `/issues/02`, `/issues/01`, `/issues/02/<slug>`, `/issues/01/<slug>`, `/source-room`, `/robots.txt`, `/sitemap-index.xml`) into `dist/`.
   - Post-build CSP externalization ensures **zero inline `<script>` or `<style>` blocks** exist in `dist/`, allowing Nginx to enforce `script-src 'self'; style-src 'self' https://fonts.googleapis.com` with no `'unsafe-inline'`.
   - Sync `dist/` into `/home/mojo/web/out` while preserving historical subdirectories (`archives/`, `ari/`, `old2/`):
     ```bash
     npm ci
     npm run build
     rsync -av --exclude='archives' --exclude='ari' --exclude='old2' dist/ /home/mojo/web/out/
     ```

2. **Hono + Drizzle + SQLite API (`127.0.0.1:3016`)**:
   - Replaces the old `ussysite4` responder on `/api/health` and resolves the live `404` on `/api/press/state`.
   - Creates and migrates `/home/mojo/projects/ussysite6/data/living-edition.sqlite` automatically in WAL mode on first boot.
   - Optional secrets (`GEMINI_API_KEY`) and feature flags (`FEATURE_ASK_EDITOR=true`, etc.) belong in `/etc/ussysite6/env` (`chmod 600`), referenced via `EnvironmentFile=-/etc/ussysite6/env` in `deploy/ussysite6.service`.

3. **Nginx & Systemd Activation**:
   ```bash
   sudo bash /home/mojo/projects/ussysite6/deploy/activate.sh
   ```
   `activate.sh` backs up `/etc/nginx/sites-available/ussy.host`, restarts `ussysite6.service`, verifies `http://127.0.0.1:3016/api/health`, runs `nginx -t` (rolling back automatically on config error), reloads Nginx, and verifies `https://ussy.host/api/health`.

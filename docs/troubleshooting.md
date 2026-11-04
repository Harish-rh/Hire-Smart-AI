# HireSmart AI — Troubleshooting & Maintenance Guide

## 1. Operating on a 4 GB RAM Windows Computer

HireSmart AI has been architected to run smoothly within a 4 GB RAM footprint:
- **No Docker containers:** Zero background hypervisor overhead.
- **Pure-Python resume parsers:** Uses `pypdf` and `python-docx` without heavyweight native OCR dependencies.
- **Lightweight CSS charts:** Uses pure CSS/SVG renderers on the frontend to avoid heavy memory allocation.

### Memory Optimization Tips:
1. Close unnecessary browser tabs and background applications when running development servers.
2. If memory is tight, keep the backend in lightweight SQLite mode (`USE_SQLITE=True` in `backend/.env`).
3. When running local AI inference via Ollama, use the `llama3.2:1b` model (requires ~1.3 GB RAM). If Ollama causes system sluggishness, stop the Ollama daemon:
   ```powershell
   Stop-Process -Name "ollama" -ErrorAction SilentlyContinue
   ```
   HireSmart AI will automatically and seamlessly switch to its deterministic rule-based matching engine with zero disruption.

---

## 2. Common Issues & Solutions

### A. "Cannot connect to backend" or "Network Error" on Frontend
- **Check Backend Server:** Ensure the Django server is running on `http://127.0.0.1:8000`.
- **Verify CORS Settings:** Check `backend/.env`:
  ```env
  CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
  ```
- **Check Frontend .env:** Ensure `frontend/.env` has:
  ```env
  VITE_API_URL=http://localhost:8000/api
  ```

### B. "The term 'psql' is not recognized" (PostgreSQL)
- PostgreSQL is optional. HireSmart AI runs with dual-mode database support.
- If PostgreSQL is not installed or configured, ensure `USE_SQLITE=True` in `backend/.env`. The application uses the standard Django ORM with full relational integrity and migrations.
- To switch to PostgreSQL when installed:
  1. Set `USE_SQLITE=False` in `backend/.env`.
  2. Provide database credentials (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`).
  3. Run `python manage.py migrate` in `backend/`.

### C. Local AI / Ollama Inference Timing Out
- Local inference timeout is controlled by `AI_TIMEOUT_SECONDS` in `backend/.env` (default: 30 seconds).
- If your CPU is busy, you can increase this value in `backend/.env`:
  ```env
  AI_TIMEOUT_SECONDS=60
  ```
- If Ollama is offline or uninstalled, the application automatically uses its pure-Python rule-based question bank and resume matcher.

### D. Resume Upload Errors
- **Format:** Only `.pdf` and `.docx` files are supported.
- **Size Limit:** Uploads are capped at 5 MB.
- **Empty Files:** 0-byte files will be rejected with an informative error message.
- **Scanned Resumes:** Documents without selectable text will be stored, but text extraction will flag that no selectable text was found.

---

## 3. Database Backup & Restore

### Backup SQLite:
```powershell
Copy-Item .\backend\db.sqlite3 .\backend\db_backup.sqlite3
```

### Backup PostgreSQL (if active):
```powershell
pg_dump -U postgres -d hiresmart_db -F c -f hiresmart_backup.dump
```

### Restore PostgreSQL:
```powershell
pg_restore -U postgres -d hiresmart_db hiresmart_backup.dump
```

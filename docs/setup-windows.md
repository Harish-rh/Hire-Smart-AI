# HireSmart AI — Windows Local Setup Guide

This guide describes how to run HireSmart AI locally on Windows with 4 GB RAM and ₹0 cost.

## 1. Prerequisites Verified

- **OS:** Windows 10 Pro / 11 (64-bit)
- **RAM:** 4 GB Total
- **Python:** 3.11.x (Installed)
- **Node.js:** v20.11.x (Installed)
- **npm:** 9.7.x+ (Installed)
- **Git:** 2.42.x+ (Installed)
- **Package Manager:** `winget` (Available)

## 2. Running the Development Servers

### Backend (Django)

In PowerShell terminal 1:
```powershell
cd E:\Hire-Smart-AI\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```
Backend API will be accessible at: `http://localhost:8000/api/`

### Frontend (React + Vite)

In PowerShell terminal 2:
```powershell
cd E:\Hire-Smart-AI\frontend
npm run dev
```
Frontend will be accessible at: `http://localhost:5173/`

## 3. Environment Files

- `backend/.env`: Configures Django secret key, allowed hosts, database parameters, and AI model endpoints.
- `frontend/.env`: Configures `VITE_API_URL=http://localhost:8000/api`.

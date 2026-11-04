# HireSmart AI — Production-Style Local AI Recruitment Platform

> A locally running, zero-cost AI-powered recruitment management and resume analysis system engineered specifically for low-memory Windows environments (4 GB RAM, ₹0 budget).

---

## 1. Project Overview

HireSmart AI is a full-stack recruitment platform that enables recruiters to:
- **Manage Job Openings:** Complete lifecycle tracking (Draft, Open, On Hold, Closed, Archived) with experience validation and structured technical skill tagging.
- **Candidate & Resume Management:** Private file upload (`.pdf` and `.docx`), safe UUID hashed disk storage, and offline pure-Python text extraction using `pypdf` and `python-docx`.
- **Application Pipeline Workflow:** Multi-stage recruitment tracking across 7 stages (`New`, `In Review`, `Shortlisted`, `Interview`, `Offer`, `Rejected`, `Withdrawn`) with duplicate application prevention and a chronological audit trail (`ApplicationStatusHistory`).
- **AI-Assisted Resume Screening:** Compares resume text against target job requirements to produce structured JSON evidence breakdowns, identify unevidenced qualifications, and generate recruiter clarification questions.
- **Dual Inference Engine with Fallback:** Seamlessly switches between local Ollama LLM inference (`llama3.2:1b`) and an instant, zero-memory deterministic rule-based matching engine in pure Python.
- **Technical Interview Assistant:** Generates tailored interview questions with difficulty levels, evaluation rubrics, and model answers, backed by a verified offline question bank.
- **Real-Time Dashboard & Analytics:** Real-time counters, lightweight CSS progress bars, demand volume indicators, event activity feed, and CSV data export.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS, Lucide React, Axios, React Router v6
- **Backend:** Python 3.11, Django 5.1, Django REST Framework, SimpleJWT, django-cors-headers, pypdf, python-docx
- **Database:** Dual-mode Django ORM (Low-memory SQLite active by default; one-toggle switch to PostgreSQL)
- **Local AI Engine:** Ollama (`llama3.2:1b`) + Instant Deterministic Rule-Based Fallback
- **Cost:** **₹0** — 100% free local dependencies without paid cloud APIs or subscriptions

---

## 3. Phase Completion Status

- [x] **Phase 1 — Environment and Project Setup** (Vite + React, Django DRF, venv verified)
- [x] **Phase 2 — Database Configuration & Data Models** (Dual-mode schema, migrations applied)
- [x] **Phase 3 — Authentication & Role-Based Layout** (JWT tokens, Protected & Admin routes, responsive sidebar & navbar)
- [x] **Phase 4 — Job Management** (Full CRUD, search, status filters, experience validation)
- [x] **Phase 5 — Candidate Management & Resume Extraction** (PDF & DOCX parsing, text extraction inspector)
- [x] **Phase 6 — Application Pipeline & Workflow** (7-stage pipeline, duplicate checks, audit history timeline)
- [x] **Phase 7 — Local AI Integration & Fallback Service** (Ollama REST client, memory truncation, rule-based fallback, JSON validation)
- [x] **Phase 8 — AI Resume Analysis Screens** (Screening modal, evidence cards, clarification questions, advisory notice)
- [x] **Phase 9 — Interview Assistant & Question Generator** (Adaptive generator, evaluation rubrics, question bank fallback, in-place editor)
- [x] **Phase 10 — Dashboard & Reports Analytics** (Real-time metrics, CSS distribution charts, audit feed, CSV export)
- [x] **Phase 11 — Testing & Optimization** (47 automated unit tests passed across all 6 applications)
- [x] **Phase 12 — Final Documentation & Release Verification** (Complete setup guides, API reference, seed data script)

---

## 4. Quick Start: Running HireSmart AI Locally

### Prerequisites Verified
- Windows 10/11 (64-bit)
- Python 3.11+
- Node.js v20.11+ and npm

### Terminal 1: Start Backend API
```powershell
cd E:\Hire-Smart-AI\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```
Backend API will be accessible at: `http://localhost:8000/api/`

### Terminal 2: Start Frontend Application
```powershell
cd E:\Hire-Smart-AI\frontend
npm run dev
```
Open your browser and navigate to: `http://localhost:5173/`

---

## 5. Demonstration Accounts

The database is pre-seeded with realistic demonstration data:

| Role | Username | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@12345` | Full administrative control, user creation, jobs, candidates, AI screening, reports |
| **Recruiter** | `recruiter_sarah` | `Recruiter@12345` | Job openings, candidate profiles, pipeline management, AI resume analysis, interview questions |

*(The login screen also provides convenient one-click demo credential autofill buttons).*

---

## 6. Running Automated Tests

Run the full backend test suite (47 unit tests):
```powershell
cd E:\Hire-Smart-AI\backend
.\venv\Scripts\python.exe manage.py test accounts jobs candidates applications ai_assistant reports
```

Verify frontend production build:
```powershell
cd E:\Hire-Smart-AI\frontend
npm run build
```

---

## 7. Documentation Index

- [Architecture & Low-Memory Design](docs/architecture.md)
- [Database Models & Dual-Mode Configuration](docs/database.md)
- [Complete REST API Reference](docs/api.md)
- [Local AI & Fallback Service Guide](docs/ai-integration.md)
- [Windows Local Setup Guide](docs/setup-windows.md)
- [Troubleshooting & Maintenance Guide](docs/troubleshooting.md)

# HireSmart AI

> Production-style, locally running AI-powered recruitment management application engineered for low-memory Windows environments (4 GB RAM, ₹0 budget).

## Overview

HireSmart AI empowers recruitment teams with:
- **Job Opening Management:** Complete lifecycle tracking (Draft, Open, On Hold, Closed).
- **Candidate & Resume Management:** Secure file upload and private text extraction for PDF and DOCX files.
- **Application Tracking Pipeline:** Multi-stage recruitment workflow with audit logs.
- **Local AI Resume Analysis:** Uses local Ollama model (`llama3.2:1b`) with a deterministic rule-based fallback.
- **Technical Interview Assistant:** Dynamic question generation based on job requirements and candidate profiles.
- **Recruitment Analytics Dashboard:** Real-time metrics and charts.

## Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6
- **Backend:** Python 3.11, Django 5.1, Django REST Framework, SimpleJWT, django-cors-headers, pypdf, python-docx
- **Database:** PostgreSQL (with SQLite fallback for lightweight checks)
- **AI Engine:** Local Ollama (`llama3.2:1b`) with structured JSON schema enforcement and rule-based fallback

## Phase Status

- [x] **Phase 1 — Environment and Project Setup** (Completed & Verified)
- [ ] **Phase 2 — Database Configuration (PostgreSQL)**
- [ ] **Phase 3 — Authentication & Role-Based Access**
- [ ] **Phase 4 — Job Management**
- [ ] **Phase 5 — Candidate Management & Resume Extraction**
- [ ] **Phase 6 — Application Pipeline & Workflow**
- [ ] **Phase 7 — Local AI Integration & Fallback Service**
- [ ] **Phase 8 — AI Resume Analysis Screens**
- [ ] **Phase 9 — Interview Assistant & Question Generator**
- [ ] **Phase 10 — Dashboard & Analytics Reports**
- [ ] **Phase 11 — Testing & Optimization**
- [ ] **Phase 12 — Final Documentation & Release Verification**

## Getting Started

See [docs/setup-windows.md](docs/setup-windows.md) for step-by-step local execution instructions.

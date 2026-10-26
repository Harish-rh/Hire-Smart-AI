# HireSmart AI — Architecture & Design

## 1. System Overview

HireSmart AI is a production-style, locally hosted AI-powered recruitment management system. It enables recruiters to manage jobs, candidates, and job applications, extract text from resumes (PDF/DOCX), run automated qualifications matching via a small local AI model (Ollama) with deterministic rule-based fallback, and generate structured interview questions.

```
+-------------------------------------------------------------+
|                     React.js Frontend                       |
|         (Vite, Tailwind CSS, Lucide React, Axios)           |
+-------------------------------------------------------------+
                              |
                     REST APIs (HTTP/JSON)
                     JWT Auth Headers
                              v
+-------------------------------------------------------------+
|                Django REST Framework Backend                |
|      (Modular Apps: accounts, jobs, candidates, etc.)       |
+-------------------------------------------------------------+
            |                                      |
            v                                      v
+-----------------------+              +-----------------------+
|  PostgreSQL Database  |              | Local AI / Fallback   |
|   (Relational Data)   |              |  (Ollama llama3.2:1b  |
|                       |              |  or Rule-based engine)|
+-----------------------+              +-----------------------+
```

## 2. Low Memory Design Principles (4 GB RAM Target)

1. **Lightweight Python & Node Services:**
   - Pure Python libraries for PDF extraction (`pypdf`), zero heavy OCR/native ML frameworks loaded unnecessarily into RAM.
   - Vite-based ES module bundling for fast, minimal-footprint frontend serving.
2. **Local AI Resource Management:**
   - Dedicated service layer abstracts AI inference.
   - Input truncation and sanitized resume text prompt formatting (maximum 4000 characters).
   - Strict timeouts and fallback to pure Python deterministic matching when Ollama is stopped or unavailable.
   - Zero Docker containers or heavy message brokers.
3. **Database Optimization:**
   - PostgreSQL indexing on foreign keys and frequently queried fields.
   - Efficient ORM queries (`select_related`, `prefetch_related`) avoiding N+1 queries.

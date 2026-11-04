# HireSmart AI — REST API Documentation

Base URL: `http://localhost:8000/api`

All protected endpoints require an `Authorization: Bearer <jwt_access_token>` header.

---

## 1. Authentication (`/api/auth/`)

### Login
`POST /api/auth/login/`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "Admin@12345"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access": "<jwt_access_token>",
    "refresh": "<jwt_refresh_token>",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@hiresmart.local",
      "full_name": "System Administrator",
      "role": "ADMIN",
      "role_display": "Administrator"
    }
  }
  ```

### Logout
`POST /api/auth/logout/`
- **Access:** Authenticated
- **Response (200 OK):** `{"message": "Logged out successfully."}`

### Current User Profile
`GET /api/auth/me/`
- **Access:** Authenticated
- **Response (200 OK):** Current User object

`PATCH /api/auth/me/`
- **Access:** Authenticated
- **Request Body:** `{"full_name": "Updated Name", "email": "new@example.com"}`

### Change Password
`POST /api/auth/change-password/`
- **Access:** Authenticated
- **Request Body:** `{"old_password": "...", "new_password": "..."}`

### User Management (Admin Only)
- `GET /api/auth/users/` — List system users
- `POST /api/auth/users/` — Create new recruiter or administrator

---

## 2. Job Management (`/api/jobs/`)

- `GET /api/jobs/?search=<query>&status=<OPEN|DRAFT|...>&page=<num>` — List job openings
- `POST /api/jobs/` — Create job opening
  ```json
  {
    "title": "Senior React Engineer",
    "department": "Engineering",
    "description": "Building modern interfaces...",
    "required_skills": ["React.js", "Tailwind CSS"],
    "preferred_skills": ["TypeScript"],
    "min_experience": 3,
    "max_experience": 6,
    "employment_type": "FULL_TIME",
    "location": "Remote",
    "status": "OPEN"
  }
  ```
- `GET /api/jobs/{id}/` — Retrieve job opening
- `PATCH /api/jobs/{id}/` — Update job attributes
- `DELETE /api/jobs/{id}/` — Delete job opening
- `GET /api/jobs/{id}/applications/` — Retrieve candidates applied to this job

---

## 3. Candidate Management (`/api/candidates/`)

- `GET /api/candidates/?search=<query>&page=<num>` — List candidates
- `POST /api/candidates/` — Create candidate profile
  ```json
  {
    "full_name": "Alex Rivera",
    "email": "alex@example.com",
    "phone": "+1 555-0100",
    "location": "Austin, TX",
    "skills": ["Python", "Django", "React"],
    "experience_summary": "5 years web application engineering."
  }
  ```
- `GET /api/candidates/{id}/` — Retrieve candidate profile
- `PATCH /api/candidates/{id}/` — Update candidate profile
- `DELETE /api/candidates/{id}/` — Delete candidate and remove stored resume
- `POST /api/candidates/{id}/upload-resume/` — Multipart upload (`resume`: PDF or DOCX file, max 5 MB). Extracts text locally.
- `GET /api/candidates/{id}/resume-text/` — Retrieve extracted resume text

---

## 4. Application Pipeline (`/api/applications/`)

- `GET /api/applications/?job=<id>&status=<stage>&search=<query>` — List applications
- `POST /api/applications/` — Assign candidate to job
  ```json
  {
    "job": 1,
    "candidate": 2,
    "status": "NEW",
    "recruiter_notes": "Referred candidate"
  }
  ```
- `GET /api/applications/{id}/` — Retrieve application
- `PATCH /api/applications/{id}/` — Update recruiter notes
- `PATCH /api/applications/{id}/status/` — Update pipeline stage and log to audit trail
  ```json
  {
    "status": "IN_REVIEW",
    "notes": "Resume matches required qualifications."
  }
  ```
- `GET /api/applications/{id}/history/` — Chronological stage transition timeline

---

## 5. Local AI & Resume Screening (`/api/`)

- `GET /api/ai/health/` — Local Ollama availability and model status
- `POST /api/applications/{id}/analyze/` — Triggers local AI resume screening with rule-based fallback
- `GET /api/analyses/` — List all past resume analyses
- `GET /api/analyses/{id}/` — Detailed evidence breakdown
- `POST /api/analyses/{id}/retry/` — Re-runs screening

---

## 6. Interview Question Generator (`/api/interviews/`)

- `POST /api/interviews/generate/` — Generate customized technical interview questions
  ```json
  {
    "job": 1,
    "candidate": 2,
    "topic": "Python",
    "difficulty": "INTERMEDIATE",
    "count": 3
  }
  ```
- `GET /api/interviews/` — List saved question sets
- `GET /api/interviews/{id}/` — Retrieve question set with evaluation rubrics and model answers
- `PATCH /api/interviews/{id}/` — In-place edit of questions and suggested answers
- `DELETE /api/interviews/{id}/` — Delete question set

---

## 7. Dashboard & Reports (`/api/`)

- `GET /api/dashboard/` — Real-time metrics: totals, status distribution, jobs with applicant count, and audit feed
- `GET /api/reports/applications/?export=csv` — Filterable applications report
- `GET /api/reports/jobs/?export=csv` — Job opening demand and conversion rates
- `GET /api/reports/ai-analyses/?export=csv` — AI screening utilization statistics

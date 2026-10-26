# HireSmart AI — Database Architecture & Entity Specifications

## 1. Overview

HireSmart AI uses Django ORM with full dual-mode database support:
1. **Lightweight Mode (`USE_SQLITE=True`):** Zero background daemon overhead, optimal for machines with limited RAM (4 GB).
2. **PostgreSQL Production Mode (`USE_SQLITE=False`):** Uses `psycopg2-binary` connecting to local PostgreSQL on port 5432 (`hiresmart_db`).

## 2. Models & Schema

### `accounts.User` (Custom User Model)
- `id`: AutoField
- `username`: CharField (Unique)
- `full_name`: CharField
- `email`: EmailField (Unique)
- `password`: Hashed via Django PBKDF2
- `role`: `ADMIN` | `RECRUITER`
- `is_active`: Boolean
- `created_at`, `updated_at`: DateTimeField

### `jobs.Job`
- `id`: AutoField
- `title`: CharField (Indexed)
- `department`: CharField (Indexed)
- `description`: TextField
- `required_skills`: JSONField (List of strings)
- `preferred_skills`: JSONField (List of strings)
- `min_experience`: PositiveIntegerField
- `max_experience`: PositiveIntegerField
- `employment_type`: `FULL_TIME` | `PART_TIME` | `CONTRACT` | `INTERNSHIP` | `REMOTE`
- `location`: CharField
- `status`: `DRAFT` | `OPEN` | `ON_HOLD` | `CLOSED` | `ARCHIVED` (Indexed)
- `created_by`: ForeignKey(`accounts.User`)
- `created_at`, `updated_at`: DateTimeField

### `candidates.Candidate`
- `id`: AutoField
- `full_name`: CharField (Indexed)
- `email`: EmailField (Unique, Indexed)
- `phone`: CharField
- `location`: CharField
- `skills`: JSONField
- `experience_summary`: TextField
- `resume_file`: FileField (Private storage in `media/resumes/`)
- `extracted_resume_text`: TextField
- `created_at`, `updated_at`: DateTimeField

### `applications.Application`
- `id`: AutoField
- `job`: ForeignKey(`jobs.Job`)
- `candidate`: ForeignKey(`candidates.Candidate`)
- `status`: `NEW` | `IN_REVIEW` | `SHORTLISTED` | `INTERVIEW` | `OFFER` | `REJECTED` | `WITHDRAWN` (Indexed)
- `applied_date`: DateTimeField
- `recruiter_notes`: TextField
- `created_at`, `updated_at`: DateTimeField
- **Constraint:** `unique_job_candidate_application` (Unique together: `job`, `candidate`)

### `applications.ApplicationStatusHistory`
- `id`: AutoField
- `application`: ForeignKey(`applications.Application`)
- `old_status`: CharField
- `new_status`: CharField
- `changed_by`: ForeignKey(`accounts.User`, Nullable)
- `notes`: TextField
- `created_at`: DateTimeField

### `ai_assistant.ResumeAnalysis`
- `id`: AutoField
- `application`: ForeignKey(`applications.Application`)
- `status`: `PENDING` | `PROCESSING` | `COMPLETED` | `FAILED`
- `summary`: TextField
- `skills_found`: JSONField
- `requirement_evidence`: JSONField
- `requirements_not_evidenced`: JSONField
- `clarification_questions`: JSONField
- `review_required`: BooleanField (Default True)
- `model_name`: CharField
- `prompt_version`: CharField
- `is_rule_based`: BooleanField
- `error_message`: TextField
- `created_at`, `updated_at`: DateTimeField

### `ai_assistant.InterviewQuestionSet`
- `id`: AutoField
- `job`: ForeignKey(`jobs.Job`)
- `candidate`: ForeignKey(`candidates.Candidate`, Nullable)
- `topic`: CharField
- `difficulty`: `BEGINNER` | `INTERMEDIATE` | `ADVANCED`
- `questions`: JSONField
- `is_ai_generated`: BooleanField
- `created_by`: ForeignKey(`accounts.User`)
- `created_at`, `updated_at`: DateTimeField

### `reports.ActivityLog`
- `id`: AutoField
- `user`: ForeignKey(`accounts.User`, Nullable)
- `action`: CharField (Indexed)
- `details`: JSONField
- `ip_address`: CharField
- `created_at`: DateTimeField

## 3. Switching to Local PostgreSQL
To connect to a local PostgreSQL instance:
1. Ensure PostgreSQL is running locally on port `5432`.
2. In `backend/.env`, set:
   ```env
   USE_SQLITE=False
   DB_NAME=hiresmart_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=127.0.0.1
   DB_PORT=5432
   ```
3. Run `python manage.py migrate` in `backend/`.

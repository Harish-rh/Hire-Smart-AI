# HireSmart AI — Local AI & Fallback Service Architecture

## 1. Overview

HireSmart AI provides an intelligent, privacy-first recruitment qualification analysis service engineered specifically for low-resource environments (4 GB RAM) at ₹0 cost.

The system utilizes an abstraction service layer (`backend/ai_assistant/ai_service.py`) supporting two complementary inference strategies:

1. **Local LLM Inference (Ollama - `llama3.2:1b`):**
   - Interacts with local Ollama daemon via REST (`http://127.0.0.1:11434/api/generate`).
   - Configured with strict 30s timeout and low temperature (0.1) for consistent, factual matching.
   - Requires zero cloud APIs or subscription tokens.

2. **Deterministic Rule-Based Fallback Engine (Pure Python):**
   - Automatically activates when Ollama is stopped, unreachable, or under memory pressure.
   - Executes exact keyword and boundary pattern matching between resume text and job requirements.
   - Extracts verbatim sentence evidence snippets from candidate resumes.
   - Clearly flags all output with `is_rule_based: true` to prevent misleading claims about generative AI.

## 2. Safety, Fairness & Security Guardrails

- **Advisory Role Only:** AI output is strictly decision-supportive and never automatically rejects, shortlists, or hires applicants. Human recruiter review is mandatory (`review_required: true`).
- **Input Sanitization & Memory Protection:** All resume text passed to inference is sanitized against prompt injection attempts (e.g., "Ignore all previous instructions") and truncated to a maximum of 4,000 characters to safeguard RAM.
- **Fairness Guarantee:** The service does not attempt to infer age, gender, race, personality, or unstated psychological traits.
- **Missing Evidence Distinction:** When evidence for a skill is absent, it is documented as "not evidenced in resume" with clarification questions, rather than an assertion of candidate incompetence.

## 3. Structured JSON Schema

Every analysis produces a validated schema:

```json
{
  "summary": "Candidate exhibits backend software engineering experience.",
  "skills_found": ["Python", "Django", "PostgreSQL"],
  "requirement_evidence": [
    {
      "requirement": "Python",
      "assessment": "evidenced",
      "evidence": "Built backend microservices with Python and scalable database schemas."
    }
  ],
  "requirements_not_evidenced": ["Docker"],
  "clarification_questions": [
    "Candidate resume does not explicitly document experience with 'Docker'. Can you describe your hands-on experience in this area?"
  ],
  "review_required": true,
  "model_name": "Deterministic Rule-Based Engine (Non-LLM Fallback)",
  "prompt_version": "rule-v1.0",
  "is_rule_based": true
}
```

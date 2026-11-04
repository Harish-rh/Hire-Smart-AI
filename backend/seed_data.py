"""
Seed script to populate HireSmart AI with synthetic, realistic recruitment data.
Enables immediate testing and local demonstration across all features.
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from accounts.models import User
from jobs.models import Job
from candidates.models import Candidate
from applications.models import Application, ApplicationStatusHistory
from ai_assistant.models import ResumeAnalysis, InterviewQuestionSet
from ai_assistant.ai_service import run_resume_analysis
from ai_assistant.interview_service import generate_interview_question_set
from reports.models import ActivityLog

def seed_database():
    print(">>> Seeding HireSmart AI Database with Realistic Test Data...")

    # 1. Create Users
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@hiresmart.local',
            'full_name': 'System Administrator',
            'role': User.Role.ADMIN,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    admin_user.set_password('Admin@12345')
    admin_user.save()

    recruiter_user, _ = User.objects.get_or_create(
        username='recruiter_sarah',
        defaults={
            'email': 'sarah@hiresmart.local',
            'full_name': 'Sarah Connor',
            'role': User.Role.RECRUITER,
        }
    )
    recruiter_user.set_password('Recruiter@12345')
    recruiter_user.save()
    print("  [OK] Verified Users: 'admin' and 'recruiter_sarah'")

    # 2. Create Job Openings
    job1, _ = Job.objects.get_or_create(
        title='Senior Full-Stack Python/React Developer',
        defaults={
            'department': 'Engineering',
            'description': """We are seeking an experienced Full-Stack Developer to design and build mission-critical web applications.
You will be responsible for creating performant REST APIs with Django REST Framework, building responsive UI components in React, and architecting database schemas in PostgreSQL.""",
            'required_skills': ['Python', 'Django REST Framework', 'React.js', 'PostgreSQL'],
            'preferred_skills': ['Docker', 'Tailwind CSS', 'Redis'],
            'min_experience': 3,
            'max_experience': 7,
            'employment_type': Job.EmploymentType.FULL_TIME,
            'location': 'Remote',
            'status': Job.Status.OPEN,
            'created_by': admin_user,
        }
    )

    job2, _ = Job.objects.get_or_create(
        title='Frontend React & UI Engineer',
        defaults={
            'department': 'Product Design',
            'description': """Looking for a Frontend Specialist passionate about clean component architectures, Tailwind CSS, and seamless user experiences.
Responsibilities include building stateful workflows in React 18, optimizing render lifecycles, and integrating with RESTful backend services.""",
            'required_skills': ['React.js', 'JavaScript', 'Tailwind CSS'],
            'preferred_skills': ['TypeScript', 'Vite', 'Figma'],
            'min_experience': 2,
            'max_experience': 5,
            'employment_type': Job.EmploymentType.FULL_TIME,
            'location': 'Austin, TX (Hybrid)',
            'status': Job.Status.OPEN,
            'created_by': recruiter_user,
        }
    )

    job3, _ = Job.objects.get_or_create(
        title='Backend Infrastructure Architect',
        defaults={
            'department': 'Core Systems',
            'description': """Seeking a seasoned Backend Engineer to lead high-throughput data processing and transactional architecture.
Deep knowledge of Python concurrency, PostgreSQL indexing, and API security is mandatory.""",
            'required_skills': ['Python', 'PostgreSQL', 'REST API', 'SQL'],
            'preferred_skills': ['Redis', 'Celery', 'Linux'],
            'min_experience': 5,
            'max_experience': 10,
            'employment_type': Job.EmploymentType.FULL_TIME,
            'location': 'Remote',
            'status': Job.Status.OPEN,
            'created_by': admin_user,
        }
    )
    print(f"  [OK] Verified Jobs: '{job1.title}', '{job2.title}', '{job3.title}'")

    # 3. Create Candidates with Extracted Resume Text
    cand1, _ = Candidate.objects.get_or_create(
        email='alex.rivera@example.com',
        defaults={
            'full_name': 'Alex Rivera',
            'phone': '+1 (555) 234-5678',
            'location': 'Austin, TX',
            'skills': ['Python', 'Django REST Framework', 'React.js', 'PostgreSQL', 'JavaScript'],
            'experience_summary': '5 years of full-stack experience delivering SaaS web platforms.',
            'extracted_resume_text': """Alex Rivera — Full Stack Software Engineer
Austin, TX • alex.rivera@example.com • 555-234-5678

Professional Summary:
Full-stack software developer with 5+ years of experience engineering high-performance web systems using Python, Django REST Framework, and React.js. Experienced in designing robust relational schemas in PostgreSQL and building responsive interfaces with Tailwind CSS.

Technical Skills:
- Languages & Frameworks: Python, Django, Django REST Framework, React.js, JavaScript, HTML5, CSS3
- Databases: PostgreSQL, SQLite, Redis caching
- Tools & Methodologies: Git, REST API architecture, Agile/Scrum

Experience:
Senior Developer — TechFlow Solutions (2021 - Present)
- Engineered scalable microservice APIs with Django REST Framework serving 500,000+ monthly requests.
- Built interactive customer dashboards using React.js and Tailwind CSS.
- Optimized PostgreSQL queries using select_related and B-Tree indexing, decreasing average latency by 35%.

Software Engineer — CloudMatrix (2019 - 2021)
- Developed backend features with Python and Django ORM.
- Collaborated on front-end features in React and state management.""",
        }
    )

    cand2, _ = Candidate.objects.get_or_create(
        email='maya.lin@example.com',
        defaults={
            'full_name': 'Maya Lin',
            'phone': '+1 (555) 987-6543',
            'location': 'San Francisco, CA',
            'skills': ['React.js', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS'],
            'experience_summary': '3 years frontend engineering focusing on accessible user interfaces.',
            'extracted_resume_text': """Maya Lin — Frontend React Developer
San Francisco, CA • maya.lin@example.com

Summary:
Frontend engineer with 3 years of production experience crafting modern, component-driven web applications in React.js and Tailwind CSS.

Skills:
React.js, JavaScript (ES6+), Tailwind CSS, Vite, HTML5, Responsive UI, Git

Work History:
UI Engineer — PixelCraft Studio (2022 - Present)
- Created reusable component libraries in React.js styled with Tailwind CSS.
- Integrated REST APIs with Axios and managed asynchronous state.""",
        }
    )

    cand3, _ = Candidate.objects.get_or_create(
        email='david.kim@example.com',
        defaults={
            'full_name': 'David Kim',
            'phone': '+1 (555) 456-7890',
            'location': 'Seattle, WA',
            'skills': ['Python', 'PostgreSQL', 'SQL', 'REST API', 'Linux'],
            'experience_summary': '6 years backend systems and database engineering.',
            'extracted_resume_text': """David Kim — Senior Backend Engineer
Seattle, WA • david.kim@example.com

Summary:
Backend specialist with 6 years focused on Python data pipelines, PostgreSQL schema design, and transactional REST APIs.

Skills:
Python, PostgreSQL, SQL query optimization, Linux server management, Git

Experience:
Database & Backend Lead — DataMesh Corp (2020 - Present)
- Architected transactional database clusters in PostgreSQL with automated partitioning.
- Developed REST APIs in Python handling structured data pipelines.""",
        }
    )
    print(f"  [OK] Verified Candidates: '{cand1.full_name}', '{cand2.full_name}', '{cand3.full_name}'")

    # 4. Create Applications
    app1, _ = Application.objects.get_or_create(
        job=job1,
        candidate=cand1,
        defaults={
            'status': Application.Status.IN_REVIEW,
            'recruiter_notes': 'Exceptional alignment with full-stack requirements (Django + React).',
        }
    )

    app2, _ = Application.objects.get_or_create(
        job=job2,
        candidate=cand2,
        defaults={
            'status': Application.Status.SHORTLISTED,
            'recruiter_notes': 'Clean portfolio and solid React + Tailwind experience.',
        }
    )

    app3, _ = Application.objects.get_or_create(
        job=job3,
        candidate=cand3,
        defaults={
            'status': Application.Status.INTERVIEW,
            'recruiter_notes': 'Scheduled for technical architecture screening.',
        }
    )
    print(f"  [OK] Verified Applications: #{app1.id}, #{app2.id}, #{app3.id}")

    # 5. Execute Resume Analyses
    analysis1 = run_resume_analysis(app1)
    analysis2 = run_resume_analysis(app2)
    print(f"  [OK] Generated Resume Analyses: App #{app1.id} ({analysis1.model_name}), App #{app2.id} ({analysis2.model_name})")

    # 6. Generate Interview Question Sets
    q_set1_data = generate_interview_question_set(
        job=job1,
        candidate=cand1,
        topic='Python',
        difficulty='INTERMEDIATE',
        count=3,
        user=recruiter_user,
    )
    InterviewQuestionSet.objects.get_or_create(
        job=job1,
        candidate=cand1,
        topic='Python & Architecture',
        defaults={
            'difficulty': 'INTERMEDIATE',
            'questions': q_set1_data['questions'],
            'is_ai_generated': q_set1_data['is_ai_generated'],
            'created_by': recruiter_user,
        }
    )

    q_set2_data = generate_interview_question_set(
        job=job2,
        candidate=cand2,
        topic='React.js',
        difficulty='INTERMEDIATE',
        count=2,
        user=recruiter_user,
    )
    InterviewQuestionSet.objects.get_or_create(
        job=job2,
        candidate=cand2,
        topic='React Component Architecture',
        defaults={
            'difficulty': 'INTERMEDIATE',
            'questions': q_set2_data['questions'],
            'is_ai_generated': q_set2_data['is_ai_generated'],
            'created_by': recruiter_user,
        }
    )
    print("  [OK] Created Interview Question Sets for Python and React")

    # 7. Activity Logs
    ActivityLog.objects.create(
        user=admin_user,
        action='SYSTEM_DATABASE_SEEDED',
        details={'status': 'Complete fictional demonstration dataset loaded'},
        ip_address='127.0.0.1',
    )

    print("\n>>> SUCCESS! HireSmart AI has been populated with full demonstration data.")
    print("    Log in at http://localhost:5173/login with:")
    print("    - Admin:     admin / Admin@12345")
    print("    - Recruiter: recruiter_sarah / Recruiter@12345\n")

if __name__ == '__main__':
    seed_database()

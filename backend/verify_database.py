import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from jobs.models import Job
from candidates.models import Candidate
from applications.models import Application, ApplicationStatusHistory
from ai_assistant.models import ResumeAnalysis, InterviewQuestionSet
from reports.models import ActivityLog

def verify_database_operations():
    print("=== HireSmart AI Database Verification ===")
    
    # 1. Test User Creation
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
    print(f"[OK] Admin User verified: {admin_user} (role={admin_user.role})")

    recruiter_user, _ = User.objects.get_or_create(
        username='recruiter_sarah',
        defaults={
            'email': 'sarah@hiresmart.local',
            'full_name': 'Sarah Recruiter',
            'role': User.Role.RECRUITER,
        }
    )
    recruiter_user.set_password('Recruiter@12345')
    recruiter_user.save()
    print(f"[OK] Recruiter User verified: {recruiter_user} (role={recruiter_user.role})")

    # 2. Test Job Creation
    job, _ = Job.objects.get_or_create(
        title='Senior Full-Stack Python/React Developer',
        defaults={
            'department': 'Engineering',
            'description': 'Building next-generation AI recruitment applications.',
            'required_skills': ['Python', 'Django REST Framework', 'React.js', 'PostgreSQL'],
            'preferred_skills': ['Tailwind CSS', 'Docker', 'Local AI/Ollama'],
            'min_experience': 3,
            'max_experience': 7,
            'employment_type': Job.EmploymentType.FULL_TIME,
            'location': 'Remote',
            'status': Job.Status.OPEN,
            'created_by': admin_user,
        }
    )
    print(f"[OK] Job verified: {job.title} | Status: {job.get_status_display()}")

    # 3. Test Candidate Creation
    candidate, _ = Candidate.objects.get_or_create(
        email='alex.developer@example.com',
        defaults={
            'full_name': 'Alex Rivera',
            'phone': '+1 (555) 234-5678',
            'location': 'Austin, TX',
            'skills': ['Python', 'Django', 'React', 'JavaScript', 'SQL'],
            'experience_summary': '5 years full-stack development experience.',
            'extracted_resume_text': 'Alex Rivera - Full Stack Engineer with 5 years experience in Django and React.',
        }
    )
    print(f"[OK] Candidate verified: {candidate.full_name} ({candidate.email})")

    # 4. Test Application Creation
    application, app_created = Application.objects.get_or_create(
        job=job,
        candidate=candidate,
        defaults={
            'status': Application.Status.NEW,
            'recruiter_notes': 'Strong initial fit for full-stack profile.',
        }
    )
    print(f"[OK] Application verified: ID #{application.id} | Status: {application.get_status_display()}")

    # 5. Test Status History Creation
    history = ApplicationStatusHistory.objects.create(
        application=application,
        old_status=Application.Status.NEW,
        new_status=Application.Status.IN_REVIEW,
        changed_by=recruiter_user,
        notes='Moved to review stage for qualifications screening.',
    )
    print(f"[OK] Status History verified: {history.old_status} -> {history.new_status}")

    # 6. Test Resume Analysis Creation
    analysis = ResumeAnalysis.objects.create(
        application=application,
        status=ResumeAnalysis.Status.COMPLETED,
        summary='Candidate has 5 years of verified Django and React experience.',
        skills_found=['Python', 'Django', 'React', 'JavaScript'],
        requirement_evidence=[
            {'requirement': 'Python', 'assessment': 'evidenced', 'evidence': '5 years full-stack development'},
            {'requirement': 'React.js', 'assessment': 'evidenced', 'evidence': 'React front-end engineering'},
        ],
        requirements_not_evidenced=['PostgreSQL production scaling'],
        clarification_questions=['Can you elaborate on your database query optimization experience?'],
        review_required=True,
        model_name='llama3.2:1b (simulated/rule-based)',
        is_rule_based=True,
    )
    print(f"[OK] Resume Analysis verified: ID #{analysis.id} | Status: {analysis.status}")

    # 7. Test Interview Question Set
    questions = InterviewQuestionSet.objects.create(
        job=job,
        candidate=candidate,
        topic='Python & Django Architecture',
        difficulty=InterviewQuestionSet.Difficulty.INTERMEDIATE,
        questions=[
            {
                'question': 'How does Django ORM handle connection pooling and N+1 query avoidance?',
                'topic': 'Django ORM',
                'difficulty': 'Intermediate',
                'evaluation_points': ['select_related vs prefetch_related', 'lazy evaluation'],
                'suggested_answer': 'Use select_related for 1:1 and ForeignKey; prefetch_related for M2M and reverse relationships.'
            }
        ],
        is_ai_generated=False,
        created_by=recruiter_user,
    )
    print(f"[OK] Interview Questions verified: ID #{questions.id} | Topic: {questions.topic}")

    # 8. Test Activity Log
    activity = ActivityLog.objects.create(
        user=admin_user,
        action='SYSTEM_DATABASE_VERIFICATION',
        details={'event': 'Phase 2 Database verification tests passed successfully'},
        ip_address='127.0.0.1',
    )
    print(f"[OK] Activity Log verified: {activity}")

    print("\n>>> ALL DATABASE MODELS & QUERIES VERIFIED SUCCESSFULLY! <<<")

if __name__ == '__main__':
    verify_database_operations()

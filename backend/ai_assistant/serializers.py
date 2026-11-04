from rest_framework import serializers
from .models import ResumeAnalysis, InterviewQuestionSet

class ResumeAnalysisSerializer(serializers.ModelSerializer):
    candidate_id = serializers.IntegerField(source='application.candidate.id', read_only=True)
    candidate_name = serializers.CharField(source='application.candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='application.candidate.email', read_only=True)
    job_id = serializers.IntegerField(source='application.job.id', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    job_department = serializers.CharField(source='application.job.department', read_only=True)

    class Meta:
        model = ResumeAnalysis
        fields = [
            'id',
            'application',
            'candidate_id',
            'candidate_name',
            'candidate_email',
            'job_id',
            'job_title',
            'job_department',
            'status',
            'summary',
            'skills_found',
            'requirement_evidence',
            'requirements_not_evidenced',
            'clarification_questions',
            'review_required',
            'model_name',
            'prompt_version',
            'is_rule_based',
            'error_message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class InterviewQuestionSetSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    job_title = serializers.CharField(source='job.title', read_only=True)
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)

    class Meta:
        model = InterviewQuestionSet
        fields = [
            'id',
            'job',
            'job_title',
            'candidate',
            'candidate_name',
            'topic',
            'difficulty',
            'questions',
            'is_ai_generated',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name or obj.created_by.username
        return 'System'

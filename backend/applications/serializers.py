from rest_framework import serializers
from .models import Application, ApplicationStatusHistory

class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationStatusHistory
        fields = [
            'id',
            'old_status',
            'new_status',
            'changed_by',
            'changed_by_name',
            'notes',
            'created_at',
        ]
        read_only_fields = fields

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return obj.changed_by.full_name or obj.changed_by.username
        return 'System'


class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_department = serializers.CharField(source='job.department', read_only=True)
    job_status = serializers.CharField(source='job.status', read_only=True)
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    candidate_phone = serializers.CharField(source='candidate.phone', read_only=True)
    candidate_location = serializers.CharField(source='candidate.location', read_only=True)
    candidate_skills = serializers.JSONField(source='candidate.skills', read_only=True)
    has_resume = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    latest_analysis = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'job_title',
            'job_department',
            'job_status',
            'candidate',
            'candidate_name',
            'candidate_email',
            'candidate_phone',
            'candidate_location',
            'candidate_skills',
            'has_resume',
            'status',
            'status_display',
            'applied_date',
            'recruiter_notes',
            'latest_analysis',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'applied_date', 'created_at', 'updated_at', 'latest_analysis']

    def get_has_resume(self, obj):
        return bool(obj.candidate.resume_file)

    def get_latest_analysis(self, obj):
        analysis = obj.resume_analyses.order_by('-created_at').first()
        if analysis:
            return {
                'id': analysis.id,
                'status': analysis.status,
                'model_name': analysis.model_name,
                'is_rule_based': analysis.is_rule_based,
                'created_at': analysis.created_at,
            }
        return None


class CreateApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['id', 'job', 'candidate', 'recruiter_notes', 'status']

    def validate(self, attrs):
        job = attrs.get('job')
        candidate = attrs.get('candidate')

        if Application.objects.filter(job=job, candidate=candidate).exists():
            raise serializers.ValidationError({
                'candidate': f"Candidate '{candidate.full_name}' has already applied for '{job.title}'."
            })
        return attrs


class UpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Application.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

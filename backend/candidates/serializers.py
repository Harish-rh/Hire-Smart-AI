import os
from rest_framework import serializers
from .models import Candidate

class CandidateSerializer(serializers.ModelSerializer):
    has_resume = serializers.SerializerMethodField()
    resume_filename = serializers.SerializerMethodField()
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)

    class Meta:
        model = Candidate
        fields = [
            'id',
            'full_name',
            'email',
            'phone',
            'location',
            'skills',
            'experience_summary',
            'resume_file',
            'has_resume',
            'resume_filename',
            'extracted_resume_text',
            'applications_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'resume_file', 'has_resume', 'resume_filename', 'applications_count', 'created_at', 'updated_at']

    def get_has_resume(self, obj):
        return bool(obj.resume_file)

    def get_resume_filename(self, obj):
        if obj.resume_file:
            return os.path.basename(obj.resume_file.name)
        return None

    def validate_skills(self, value):
        if isinstance(value, str):
            return [s.strip() for s in value.split(',') if s.strip()]
        if not isinstance(value, list):
            return []
        return value


class ResumeUploadSerializer(serializers.Serializer):
    resume = serializers.FileField(required=True)

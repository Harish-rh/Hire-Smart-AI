from rest_framework import serializers
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'department',
            'description',
            'required_skills',
            'preferred_skills',
            'min_experience',
            'max_experience',
            'employment_type',
            'employment_type_display',
            'location',
            'status',
            'status_display',
            'created_by',
            'created_by_name',
            'applications_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'applications_count']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name or obj.created_by.username
        return 'System'

    def validate(self, attrs):
        min_exp = attrs.get('min_experience', getattr(self.instance, 'min_experience', 0))
        max_exp = attrs.get('max_experience', getattr(self.instance, 'max_experience', 0))

        if max_exp > 0 and min_exp > max_exp:
            raise serializers.ValidationError({
                'min_experience': 'Minimum experience cannot exceed maximum experience.'
            })

        # Ensure required_skills is a list
        req_skills = attrs.get('required_skills')
        if req_skills is not None:
            if isinstance(req_skills, str):
                attrs['required_skills'] = [s.strip() for s in req_skills.split(',') if s.strip()]
            elif not isinstance(req_skills, list):
                attrs['required_skills'] = []

        pref_skills = attrs.get('preferred_skills')
        if pref_skills is not None:
            if isinstance(pref_skills, str):
                attrs['preferred_skills'] = [s.strip() for s in pref_skills.split(',') if s.strip()]
            elif not isinstance(pref_skills, list):
                attrs['preferred_skills'] = []

        return attrs

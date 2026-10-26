import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  User,
  Users,
  Edit2,
  Trash2,
  FileCheck2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import JobFormModal from './JobFormModal';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const [jobData, appsData] = await Promise.all([
        jobsAPI.getJob(id),
        jobsAPI.getJobApplications(id),
      ]);
      setJob(jobData);
      setApplications(appsData);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load job details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
  }, [id]);

  const handleUpdateJob = async (formData) => {
    await jobsAPI.updateJob(id, formData);
    setAlert({ type: 'success', message: 'Job details updated successfully!' });
    fetchJobData();
  };

  const handleDeleteJob = async () => {
    if (!window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      return;
    }
    try {
      await jobsAPI.deleteJob(id);
      navigate('/jobs');
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete job opening.' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="success">Open</Badge>;
      case 'DRAFT':
        return <Badge variant="neutral">Draft</Badge>;
      case 'ON_HOLD':
        return <Badge variant="warning">On Hold</Badge>;
      case 'CLOSED':
        return <Badge variant="danger">Closed</Badge>;
      case 'ARCHIVED':
        return <Badge variant="neutral">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getApplicationStatusBadge = (status) => {
    const map = {
      NEW: 'primary',
      IN_REVIEW: 'warning',
      SHORTLISTED: 'purple',
      INTERVIEW: 'primary',
      OFFER: 'success',
      REJECTED: 'danger',
      WITHDRAWN: 'neutral',
    };
    return <Badge variant={map[status] || 'neutral'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner text="Loading job opening..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500 mb-4">Job opening not found.</p>
        <Link to="/jobs">
          <Button variant="outline" icon={ArrowLeft}>
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/jobs"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{job.title}</h1>
              {getStatusBadge(job.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {job.department} &bull; Job ID #{job.id} &bull; Created {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Edit2}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Job
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Trash2}
            onClick={handleDeleteJob}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            Delete
          </Button>
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Employment Type</span>
          </div>
          <div className="font-semibold text-slate-800 text-sm">
            {job.employment_type_display || job.employment_type}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>Location</span>
          </div>
          <div className="font-semibold text-slate-800 text-sm">{job.location}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Experience Range</span>
          </div>
          <div className="font-semibold text-slate-800 text-sm">
            {job.max_experience > 0
              ? `${job.min_experience} - ${job.max_experience} Years`
              : `${job.min_experience}+ Years`}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>Total Applicants</span>
          </div>
          <div className="font-semibold text-blue-600 text-sm">{applications.length} Candidates</div>
        </div>
      </div>

      {/* Skills and Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Job Description" subtitle="Role duties and qualifications">
            <div className="prose prose-sm text-slate-700 whitespace-pre-line text-sm leading-relaxed">
              {job.description}
            </div>
          </Card>

          {/* Associated Applications */}
          <Card
            title={`Applications for this Role (${applications.length})`}
            subtitle="Candidates linked to this job opening"
            bodyClassName="p-0 overflow-hidden"
          >
            {applications.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={FileCheck2}
                  title="No applications yet"
                  description="Assign candidates to this job opening to start review and AI screening."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Candidate</th>
                      <th className="px-6 py-3.5">Contact</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {app.candidate_name}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-600">
                          {app.candidate_email}
                        </td>
                        <td className="px-6 py-4">
                          {getApplicationStatusBadge(app.status)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(app.applied_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Skills Sidebar Card */}
        <div className="space-y-6">
          <Card title="Technical Requirements" subtitle="Skills used for candidate AI screening">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.required_skills?.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {job.preferred_skills?.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Preferred Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {job.preferred_skills?.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <JobFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={handleUpdateJob}
        job={job}
      />
    </div>
  );
}

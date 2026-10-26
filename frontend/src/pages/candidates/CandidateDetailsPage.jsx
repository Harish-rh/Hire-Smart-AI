import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Upload,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { candidatesAPI } from '../../api/candidates';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import CandidateFormModal from './CandidateFormModal';
import ResumeUploadModal from './ResumeUploadModal';

export default function CandidateDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [copied, setCopied] = useState(false);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const data = await candidatesAPI.getCandidate(id);
      setCandidate(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load candidate profile.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, [id]);

  const handleUpdate = async (formData) => {
    await candidatesAPI.updateCandidate(id, formData);
    setAlert({ type: 'success', message: 'Candidate details updated successfully!' });
    fetchCandidateData();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${candidate.full_name}?`)) {
      return;
    }
    try {
      await candidatesAPI.deleteCandidate(id);
      navigate('/candidates');
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete candidate.' });
    }
  };

  const handleCopyText = () => {
    if (candidate?.extracted_resume_text) {
      navigator.clipboard.writeText(candidate.extracted_resume_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner text="Loading candidate details..." />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500 mb-4">Candidate profile not found.</p>
        <Link to="/candidates">
          <Button variant="outline" icon={ArrowLeft}>
            Back to Candidate Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/candidates"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {candidate.full_name}
              </h1>
              {candidate.has_resume ? (
                <Badge variant="success">Resume On File</Badge>
              ) : (
                <Badge variant="warning">Resume Missing</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Candidate #{candidate.id} &bull; Added {new Date(candidate.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => setIsUploadModalOpen(true)}
          >
            {candidate.has_resume ? 'Replace Resume' : 'Upload Resume'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Edit2}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Trash2}
            onClick={handleDelete}
            className="text-rose-600 hover:bg-rose-50"
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

      {/* Grid: Profile info & Resume Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Skills */}
        <div className="space-y-6">
          <Card title="Candidate Overview" subtitle="Contact and location details">
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-xs">{candidate.email}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{candidate.phone || 'No phone provided'}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{candidate.location || 'Location not specified'}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500">
                  Registered: {new Date(candidate.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Skills Card */}
          <Card title="Technical Skills" subtitle="Documented competencies">
            {candidate.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No skills tagged yet.</p>
            )}
          </Card>

          {/* Experience Summary */}
          {candidate.experience_summary && (
            <Card title="Experience Summary" subtitle="Recruiter profile notes">
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {candidate.experience_summary}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Private Resume Extraction & Document Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Resume Document & Local Text Extraction"
            subtitle="Secure offline text parser running locally via pypdf / python-docx"
            action={
              candidate.extracted_resume_text && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={copied ? Check : Copy}
                  onClick={handleCopyText}
                >
                  {copied ? 'Copied' : 'Copy Text'}
                </Button>
              )
            }
          >
            {candidate.has_resume ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-950">
                        {candidate.resume_filename || 'Candidate Resume'}
                      </p>
                      <p className="text-xs text-emerald-700">
                        Stored privately in local file system &bull; Extracted into database
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    Replace
                  </Button>
                </div>

                {/* Extracted Text Viewer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Extracted Text Content ({candidate.extracted_resume_text?.length || 0} characters)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Feeds directly into local AI screening
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-96 overflow-y-auto text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {candidate.extracted_resume_text || 'No text extracted from this document.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">No Resume Uploaded</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Upload a PDF or DOCX resume to automatically extract candidate qualifications and prepare for AI analysis.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Upload}
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  Upload PDF or DOCX
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <CandidateFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={handleUpdate}
        candidate={candidate}
      />

      {/* Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        candidate={candidate}
        onUploaded={(updatedCandidate) => {
          setCandidate(updatedCandidate);
          setAlert({ type: 'success', message: 'Resume uploaded and extracted successfully!' });
        }}
      />
    </div>
  );
}

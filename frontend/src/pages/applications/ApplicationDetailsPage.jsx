import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck2,
  User,
  Briefcase,
  Calendar,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  History,
} from 'lucide-react';
import { applicationsAPI } from '../../api/applications';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Status Update Form State
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Recruiter Notes State
  const [notes, setNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const [appData, historyData] = await Promise.all([
        applicationsAPI.getApplication(id),
        applicationsAPI.getApplicationHistory(id),
      ]);
      setApplication(appData);
      setHistory(historyData);
      setTargetStatus(appData.status);
      setNotes(appData.recruiter_notes || '');
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load application details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationData();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;

    setStatusLoading(true);
    setAlert(null);

    try {
      await applicationsAPI.updateStatus(id, targetStatus, statusNotes);
      setStatusNotes('');
      setAlert({ type: 'success', message: 'Application stage updated successfully!' });
      fetchApplicationData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update application stage.' });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setNotesLoading(true);
    setAlert(null);

    try {
      await applicationsAPI.updateApplication(id, { recruiter_notes: notes });
      setAlert({ type: 'success', message: 'Recruiter notes saved.' });
      fetchApplicationData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to save notes.' });
    } finally {
      setNotesLoading(false);
    }
  };

  const getStatusBadge = (status) => {
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
        <LoadingSpinner text="Loading candidate application..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500 mb-4">Application not found.</p>
        <Link to="/applications">
          <Button variant="outline" icon={ArrowLeft}>
            Back to Pipeline
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/applications"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {application.candidate_name}
              </h1>
              <span className="text-slate-400 font-light">&rarr;</span>
              <span className="text-xl font-semibold text-slate-700">{application.job_title}</span>
              {getStatusBadge(application.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Application #{application.id} &bull; Applied: {new Date(application.applied_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Link to={`/analysis`}>
          <Button variant="outline" size="sm" icon={Sparkles}>
            AI Resume Analysis
          </Button>
        </Link>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Stage Progression Action Bar */}
      <Card bodyClassName="p-4 bg-blue-50/40 border-blue-100">
        <form onSubmit={handleUpdateStatus} className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:w-auto shrink-0 text-xs font-semibold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            Update Pipeline Stage:
          </div>

          <div className="w-full md:w-48 shrink-0">
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg py-2 px-3 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NEW">New</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>

          <div className="w-full flex-1">
            <input
              type="text"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Stage transition notes (e.g. Cleared technical interview round 1)..."
              className="w-full text-xs border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={statusLoading}
            disabled={targetStatus === application.status && !statusNotes.trim()}
          >
            Update Stage
          </Button>
        </form>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Candidate & Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Candidate Card */}
            <Card
              title="Candidate Profile"
              subtitle="Contact details and resume status"
              action={
                <Link
                  to={`/candidates/${application.candidate}`}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  View Profile &rarr;
                </Link>
              }
            >
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-sm text-slate-900">{application.candidate_name}</div>
                <div className="text-slate-600 font-mono">{application.candidate_email}</div>
                <div className="text-slate-500">{application.candidate_phone || 'No phone'}</div>
                <div className="text-slate-500">{application.candidate_location || 'Remote'}</div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Candidate Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {application.candidate_skills?.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Job Opening Card */}
            <Card
              title="Target Job Opening"
              subtitle="Role and department criteria"
              action={
                <Link
                  to={`/jobs/${application.job}`}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  View Job &rarr;
                </Link>
              }
            >
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-sm text-slate-900">{application.job_title}</div>
                <div className="text-slate-600">{application.job_department}</div>
                <div className="text-slate-500">
                  Status: <span className="font-medium">{application.job_status}</span>
                </div>
                <div className="text-slate-500">
                  Applied Date: {new Date(application.applied_date).toLocaleDateString()}
                </div>
              </div>
            </Card>
          </div>

          {/* Recruiter Notes Editor */}
          <Card
            title="Recruiter Notes"
            subtitle="Private screening notes and evaluation feedback"
            action={
              <Button
                variant="outline"
                size="sm"
                icon={Save}
                loading={notesLoading}
                onClick={handleSaveNotes}
              >
                Save Notes
              </Button>
            }
          >
            <textarea
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record interview notes, compensation expectations, or next steps..."
              className="w-full text-sm border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Card>
        </div>

        {/* Right Column: AI Status & Status History Timeline */}
        <div className="space-y-6">
          {/* AI Screening Card */}
          <Card title="AI Screening Status" subtitle="Qualifications matching">
            {application.latest_analysis ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Analysis Completed ({application.latest_analysis.model_name.split(' ')[0]})</span>
                </div>
                <p className="text-xs text-slate-500">
                  Screened on {new Date(application.latest_analysis.created_at).toLocaleDateString()}
                </p>
                <Link to="/analysis" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-600">
                  No AI analysis performed yet for this application.
                </p>
                <Link to="/analysis" className="inline-block mt-2">
                  <Button variant="primary" size="sm" icon={Sparkles}>
                    Screen with AI
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Status Change Audit Trail */}
          <Card
            title="Stage Audit History"
            subtitle="Complete chronological timeline of stage transitions"
          >
            <div className="flow-root">
              <ul className="-mb-8">
                {history.map((entry, idx) => (
                  <li key={entry.id}>
                    <div className="relative pb-8">
                      {idx !== history.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3 items-start">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white text-blue-600">
                          <History className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {entry.old_status === 'NONE'
                                ? `Created in ${entry.new_status}`
                                : `${entry.old_status} → ${entry.new_status}`}
                            </p>
                            {entry.notes && (
                              <p className="text-xs text-slate-500 mt-0.5">{entry.notes}</p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              By {entry.changed_by_name}
                            </p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-slate-400">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

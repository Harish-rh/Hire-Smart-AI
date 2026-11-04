import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, AlertCircle, CheckCircle2, User, Briefcase } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { applicationsAPI } from '../../api/applications';
import { aiAPI } from '../../api/ai';

export default function StartAnalysisModal({ isOpen, onClose, onStarted, initialAppId = null }) {
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [loadingApps, setLoadingApps] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loadApplications = async () => {
        setLoadingApps(true);
        setError('');
        try {
          const data = await applicationsAPI.getApplications({ page_size: 100 });
          const appsList = data.results || data;
          setApplications(appsList);

          if (initialAppId) {
            setSelectedAppId(initialAppId);
          } else if (appsList.length > 0) {
            setSelectedAppId(appsList[0].id);
          }
        } catch (err) {
          setError('Failed to load candidate applications.');
        } finally {
          setLoadingApps(false);
        }
      };

      loadApplications();
    }
  }, [isOpen, initialAppId]);

  const selectedApp = applications.find((a) => a.id === parseInt(selectedAppId, 10));

  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    if (!selectedAppId) {
      setError('Please select an application to screen.');
      return;
    }

    if (selectedApp && !selectedApp.has_resume) {
      setError('Selected candidate does not have a resume file on record. Please upload a resume first.');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const analysis = await aiAPI.analyzeApplication(selectedAppId);
      onStarted(analysis);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to run resume analysis. Ensure backend is running.';
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start AI Resume Analysis"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleStartAnalysis} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Select Candidate Application <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            disabled={loadingApps || analyzing}
            className="block w-full rounded-lg text-sm border border-slate-300 py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.candidate_name} &rarr; {app.job_title} ({app.status})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Application Preview Card */}
        {selectedApp && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {selectedApp.candidate_name}
              </span>
              <span className="text-slate-500 font-mono">{selectedApp.candidate_email}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {selectedApp.job_title}
              </span>
              <span className="text-slate-400">{selectedApp.job_department}</span>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-slate-500">Resume Document:</span>
              {selectedApp.has_resume ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for screening
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> No resume uploaded
                </span>
              )}
            </div>
          </div>
        )}

        {/* Local Processing Advisory */}
        <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Zero-Cost Local Inference
          </p>
          <p>
            The system executes inference via local Ollama (`llama3.2:1b`) or the deterministic rule-based fallback. Analysis results are advisory to aid human decision-making and are stored privately in PostgreSQL.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose} disabled={analyzing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={analyzing}
            disabled={!selectedApp || !selectedApp.has_resume}
            icon={Sparkles}
          >
            {analyzing ? 'Screening Resume...' : 'Start Resume Screening'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

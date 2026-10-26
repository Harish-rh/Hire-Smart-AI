import React, { useState, useEffect } from 'react';
import { FileCheck2, User, Briefcase, Plus } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { jobsAPI } from '../../api/jobs';
import { candidatesAPI } from '../../api/candidates';

export default function CreateApplicationModal({ isOpen, onClose, onCreated }) {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [statusVal, setStatusVal] = useState('NEW');

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loadOptions = async () => {
        setLoadingOptions(true);
        setError('');
        try {
          const [jobsData, candsData] = await Promise.all([
            jobsAPI.getJobs({ page_size: 100 }),
            candidatesAPI.getCandidates({ page_size: 100 }),
          ]);
          setJobs(jobsData.results || jobsData);
          setCandidates(candsData.results || candsData);

          if ((jobsData.results || jobsData).length > 0) {
            setSelectedJob((jobsData.results || jobsData)[0].id);
          }
          if ((candsData.results || candsData).length > 0) {
            setSelectedCandidate((candsData.results || candsData)[0].id);
          }
        } catch (err) {
          setError('Failed to load available jobs and candidates.');
        } finally {
          setLoadingOptions(false);
        }
      };

      loadOptions();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob || !selectedCandidate) {
      setError('Please select both a job opening and a candidate.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onCreated({
        job: selectedJob,
        candidate: selectedCandidate,
        recruiter_notes: recruiterNotes,
        status: statusVal,
      });
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.candidate?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Failed to create application.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Candidate Application"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Job Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Target Job Opening <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            disabled={loadingOptions}
            className="block w-full rounded-lg text-sm border border-slate-300 py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.department} ({job.status})
              </option>
            ))}
          </select>
          {jobs.length === 0 && !loadingOptions && (
            <p className="text-xs text-amber-600">No jobs available. Create a job first.</p>
          )}
        </div>

        {/* Candidate Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Candidate <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            disabled={loadingOptions}
            className="block w-full rounded-lg text-sm border border-slate-300 py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            {candidates.map((cand) => (
              <option key={cand.id} value={cand.id}>
                {cand.full_name} ({cand.email})
              </option>
            ))}
          </select>
          {candidates.length === 0 && !loadingOptions && (
            <p className="text-xs text-amber-600">No candidates found. Add a candidate first.</p>
          )}
        </div>

        {/* Initial Pipeline Stage */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Initial Pipeline Stage
          </label>
          <select
            value={statusVal}
            onChange={(e) => setStatusVal(e.target.value)}
            className="block w-full rounded-lg text-sm border border-slate-300 py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="NEW">New</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
          </select>
        </div>

        {/* Recruiter Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Recruiter Notes (Optional)
          </label>
          <textarea
            rows="3"
            value={recruiterNotes}
            onChange={(e) => setRecruiterNotes(e.target.value)}
            placeholder="Initial thoughts, candidate referral source, or screening notes..."
            className="block w-full rounded-lg text-sm border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={submitting}
            disabled={jobs.length === 0 || candidates.length === 0}
            icon={FileCheck2}
          >
            Create Application
          </Button>
        </div>
      </form>
    </Modal>
  );
}

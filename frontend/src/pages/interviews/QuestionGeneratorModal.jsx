import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, Layers, Briefcase, User, BookOpen } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { jobsAPI } from '../../api/jobs';
import { candidatesAPI } from '../../api/candidates';
import { interviewsAPI } from '../../api/interviews';

export default function QuestionGeneratorModal({ isOpen, onClose, onGenerated, defaultJobId = null, defaultCandidateId = null }) {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [topic, setTopic] = useState('Python');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [count, setCount] = useState(3);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const availableTopics = [
    'Python',
    'Django REST Framework',
    'React.js',
    'PostgreSQL',
    'JavaScript',
    'General Full-Stack Development',
    'Problem Solving',
    'Project-Based Questions',
  ];

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
          const jobsList = jobsData.results || jobsData;
          const candsList = candsData.results || candsData;
          setJobs(jobsList);
          setCandidates(candsList);

          if (defaultJobId) {
            setSelectedJob(defaultJobId);
          } else if (jobsList.length > 0) {
            setSelectedJob(jobsList[0].id);
          }

          if (defaultCandidateId) {
            setSelectedCandidate(defaultCandidateId);
          }
        } catch (err) {
          setError('Failed to load job openings and candidate list.');
        } finally {
          setLoadingOptions(false);
        }
      };

      loadOptions();
    }
  }, [isOpen, defaultJobId, defaultCandidateId]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedJob) {
      setError('Please select a target job opening.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const payload = {
        job: selectedJob,
        candidate: selectedCandidate || null,
        topic,
        difficulty,
        count: parseInt(count, 10),
      };

      const result = await interviewsAPI.generateQuestions(payload);
      onGenerated(result);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.job ||
        err.response?.data?.detail ||
        'Failed to generate interview questions.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Technical Interview Questions"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleGenerate} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Target Job */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Target Job Opening <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            disabled={loadingOptions || generating}
            className="block w-full rounded-lg text-sm border border-slate-300 py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.department}
              </option>
            ))}
          </select>
        </div>

        {/* Candidate (Optional) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Tailor for Candidate (Optional)
          </label>
          <select
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            disabled={loadingOptions || generating}
            className="block w-full rounded-lg text-sm border border-slate-300 py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- General Job Opening Questions (No specific candidate) --</option>
            {candidates.map((cand) => (
              <option key={cand.id} value={cand.id}>
                {cand.full_name} ({cand.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Topic */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Technical Topic / Category
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="block w-full rounded-lg text-sm border border-slate-300 py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {availableTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Evaluation Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="block w-full rounded-lg text-sm border border-slate-300 py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="BEGINNER">Beginner (Foundational)</option>
              <option value="INTERMEDIATE">Intermediate (Practical / Design)</option>
              <option value="ADVANCED">Advanced (Architecture / Internals)</option>
            </select>
          </div>
        </div>

        {/* Number of Questions */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Number of Questions
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="10"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="flex-1 accent-blue-600 cursor-pointer"
            />
            <span className="w-8 text-center text-sm font-bold text-slate-800 bg-slate-100 py-1 rounded">
              {count}
            </span>
          </div>
        </div>

        {/* Quality and Fallback Notice */}
        <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Adaptive Generation Strategy
          </p>
          <p>
            Generates questions via local AI or uses the verified rule-based question bank with expected evaluation criteria and suggested answers.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose} disabled={generating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={generating}
            disabled={!selectedJob}
            icon={HelpCircle}
          >
            {generating ? 'Generating Questions...' : 'Generate Questions'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

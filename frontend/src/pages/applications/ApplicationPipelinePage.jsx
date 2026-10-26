import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Plus,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { applicationsAPI } from '../../api/applications';
import { jobsAPI } from '../../api/jobs';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import CreateApplicationModal from './CreateApplicationModal';

export default function ApplicationPipelinePage() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [stageFilter, setStageFilter] = useState('ALL');
  const [jobFilter, setJobFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Modals & Feedback
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  const stages = [
    { key: 'ALL', label: 'All Applications' },
    { key: 'NEW', label: 'New' },
    { key: 'IN_REVIEW', label: 'In Review' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW', label: 'Interview' },
    { key: 'OFFER', label: 'Offer' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'WITHDRAWN', label: 'Withdrawn' },
  ];

  const fetchJobsList = async () => {
    try {
      const data = await jobsAPI.getJobs({ page_size: 100 });
      setJobs(data.results || data);
    } catch {
      // Ignore
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (stageFilter !== 'ALL') params.status = stageFilter;
      if (jobFilter !== 'ALL') params.job = jobFilter;
      if (search.trim()) params.search = search.trim();

      const data = await applicationsAPI.getApplications(params);
      setApplications(data.results || data);
      setTotalCount(data.count ?? (data.results || data).length);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load applications pipeline.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsList();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [stageFilter, jobFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const handleQuickStatusChange = async (appId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(appId, newStatus, 'Quick status update from pipeline');
      setAlert({ type: 'success', message: 'Candidate application stage updated.' });
      fetchApplications();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update status.' });
    }
  };

  const handleCreateApplication = async (data) => {
    await applicationsAPI.createApplication(data);
    setAlert({ type: 'success', message: 'Application created successfully!' });
    fetchApplications();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Recruitment Pipeline
          </h1>
          <p className="text-sm text-slate-500">
            Track candidate progression across recruitment stages with complete audit history.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          New Application
        </Button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Stage Navigation Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max pb-2">
          {stages.map((stage) => {
            const isActive = stageFilter === stage.key;
            return (
              <button
                key={stage.key}
                onClick={() => {
                  setStageFilter(stage.key);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {stage.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Job Filter */}
      <Card bodyClassName="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, email, or job title..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={jobFilter}
              onChange={(e) => {
                setJobFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm border border-slate-300 rounded-lg py-2 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">All Job Openings</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            <Button type="submit" variant="secondary">
              Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Applications Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Loading pipeline applications..." />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No applications in this stage"
            description="Assign candidates to job openings or select another pipeline stage filter."
            actionLabel="New Application"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Applied Job</th>
                  <th className="px-6 py-3.5">Stage</th>
                  <th className="px-6 py-3.5">AI Screening</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Quick Stage Update</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {app.candidate_name ? app.candidate_name[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <Link
                            to={`/applications/${app.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {app.candidate_name}
                          </Link>
                          <div className="text-xs text-slate-400 font-mono">
                            {app.candidate_email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        to={`/jobs/${app.job}`}
                        className="font-medium text-slate-800 hover:text-blue-600 text-xs"
                      >
                        {app.job_title}
                      </Link>
                      <div className="text-[11px] text-slate-400">
                        {app.job_department}
                      </div>
                    </td>

                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>

                    <td className="px-6 py-4">
                      {app.latest_analysis ? (
                        <Link
                          to={`/analysis`}
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Screened ({app.latest_analysis.model_name.split(' ')[0]})</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/analysis`}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium"
                        >
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>Screen with AI</span>
                        </Link>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(app.applied_date).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleQuickStatusChange(app.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded-md py-1 px-2 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="NEW">New</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="OFFER">Offer</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="WITHDRAWN">Withdrawn</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/applications/${app.id}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md inline-block transition-colors"
                        title="View Application Details & Audit Trail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalCount > 10 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing page {page} &bull; Total {totalCount} applications</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext || loading}
                onClick={() => setPage((p) => p + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Application Modal */}
      <CreateApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreateApplication}
      />
    </div>
  );
}

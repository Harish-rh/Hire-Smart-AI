import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import JobFormModal from './JobFormModal';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const data = await jobsAPI.getJobs(params);
      setJobs(data.results || data);
      setTotalCount(data.count ?? (data.results || data).length);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load job listings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleSaveJob = async (jobData, id = null) => {
    if (id) {
      await jobsAPI.updateJob(id, jobData);
      setAlert({ type: 'success', message: 'Job opening updated successfully!' });
    } else {
      await jobsAPI.createJob(jobData);
      setAlert({ type: 'success', message: 'Job opening created successfully!' });
    }
    fetchJobs();
  };

  const handleDeleteJob = async (job) => {
    if (!window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      return;
    }

    try {
      await jobsAPI.deleteJob(job.id);
      setAlert({ type: 'success', message: `Job "${job.title}" deleted.` });
      fetchJobs();
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Openings</h1>
          <p className="text-sm text-slate-500">
            Create, manage, and monitor recruitment requirements across departments.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
        >
          Create Job Opening
        </Button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filter and Search Bar */}
      <Card bodyClassName="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, department, skills, or location..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="text-sm border border-slate-300 rounded-lg py-2 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="DRAFT">Draft</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <Button type="submit" variant="secondary" size="md">
              Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Job Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Loading job openings..." />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No job openings found"
            description="Create your first job opening to start matching candidates and screening resumes."
            actionLabel="Create Job Opening"
            onAction={() => {
              setEditingJob(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Job Title & Dept</th>
                  <th className="px-6 py-3.5">Type & Location</th>
                  <th className="px-6 py-3.5">Experience</th>
                  <th className="px-6 py-3.5">Key Skills</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Applicants</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {job.title}
                      </Link>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {job.department} &bull; Posted by {job.created_by_name}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-slate-800">
                        {job.employment_type_display || job.employment_type}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {job.max_experience > 0
                        ? `${job.min_experience} - ${job.max_experience} yrs`
                        : `${job.min_experience}+ yrs`}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {job.required_skills?.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.required_skills?.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
                            +{job.required_skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">{getStatusBadge(job.status)}</td>

                    <td className="px-6 py-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applications_count ?? 0}</span>
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingJob(job);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Job"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
            <span>Showing page {page} &bull; Total {totalCount} jobs</span>
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

      {/* Create / Edit Modal */}
      <JobFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaveJob}
        job={editingJob}
      />
    </div>
  );
}

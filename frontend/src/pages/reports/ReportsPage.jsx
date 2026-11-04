import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  FileCheck2,
  Briefcase,
  Sparkles,
  Users,
  TrendingUp,
} from 'lucide-react';
import { reportsAPI } from '../../api/reports';
import { jobsAPI } from '../../api/jobs';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Report Data
  const [appsReport, setAppsReport] = useState(null);
  const [jobsReport, setJobsReport] = useState(null);
  const [aiReport, setAiReport] = useState(null);

  const fetchFilterOptions = async () => {
    try {
      const data = await jobsAPI.getJobs({ page_size: 100 });
      setJobs(data.results || data);
    } catch {
      // Ignore
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedJob !== 'ALL') params.job = selectedJob;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const [appsData, jobsData, aiData] = await Promise.all([
        reportsAPI.getApplicationReports(params),
        reportsAPI.getJobReports(),
        reportsAPI.getAIAnalysisReports(),
      ]);

      setAppsReport(appsData);
      setJobsReport(jobsData);
      setAiReport(aiData);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load report analytics.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedJob, selectedStatus, dateFrom, dateTo]);

  const handleExportCSV = (reportType) => {
    let endpoint = '';
    let filename = '';

    if (reportType === 'applications') {
      endpoint = `/reports/applications/?job=${selectedJob}&status=${selectedStatus}&date_from=${dateFrom}&date_to=${dateTo}`;
      filename = 'hiresmart_applications_report.csv';
    } else if (reportType === 'jobs') {
      endpoint = '/reports/jobs/';
      filename = 'hiresmart_jobs_report.csv';
    } else if (reportType === 'ai') {
      endpoint = '/reports/ai-analyses/';
      filename = 'hiresmart_ai_analyses_report.csv';
    }

    reportsAPI.downloadCSV(endpoint, filename);
  };

  const totalApps = appsReport?.total_count || 0;
  const totalJobs = jobsReport?.total_jobs || 0;
  const totalAi = aiReport?.metrics?.total_analyses || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Recruitment pipeline conversion metrics, job demand summaries, and CSV data export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => handleExportCSV(activeTab)}
          >
            Export Current Table (CSV)
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

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2">
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Candidate Applications ({totalApps})</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Openings Performance ({totalJobs})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Screening Utilization ({totalAi})</span>
          </button>
        </nav>
      </div>

      {/* Filters (Applicable to Applications) */}
      {activeTab === 'applications' && (
        <Card bodyClassName="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Filter by Job
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Job Openings</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Filter by Stage
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Pipeline Stages</option>
                <option value="NEW">New</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Main Table Content */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Compiling report analytics..." />
          </div>
        ) : activeTab === 'applications' ? (
          /* Applications Report Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Candidate Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Job Opening</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Stage</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appsReport?.applications?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      No applications match the specified criteria.
                    </td>
                  </tr>
                ) : (
                  appsReport?.applications?.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        {app.candidate_name}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-500">{app.candidate_email}</td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">{app.job_title}</td>
                      <td className="px-6 py-3.5">{app.job_department}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                          {app.status_display}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">
                        {new Date(app.applied_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'jobs' ? (
          /* Jobs Report Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Job Title</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Total Applicants</th>
                  <th className="px-6 py-3.5">Interviews</th>
                  <th className="px-6 py-3.5">Offers Extended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobsReport?.jobs?.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{job.title}</td>
                    <td className="px-6 py-3.5">{job.department}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">{job.total_applicants}</td>
                    <td className="px-6 py-3.5 text-blue-600 font-medium">{job.interviews}</td>
                    <td className="px-6 py-3.5 text-emerald-600 font-semibold">{job.offers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* AI Screening Reports */
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px] block">Total Analyses</span>
                <span className="text-xl font-bold text-slate-900">
                  {aiReport?.metrics?.total_analyses ?? 0}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px] block">Completed Successfully</span>
                <span className="text-xl font-bold text-emerald-600">
                  {aiReport?.metrics?.completed ?? 0}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px] block">LLM-Assisted</span>
                <span className="text-xl font-bold text-blue-600">
                  {aiReport?.metrics?.llm_assisted ?? 0}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px] block">Deterministic Rule-Based</span>
                <span className="text-xl font-bold text-amber-600">
                  {aiReport?.metrics?.rule_based ?? 0}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Job Opening</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Inference Engine</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {aiReport?.recent_analyses?.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 font-semibold text-slate-900">{a.candidate_name}</td>
                      <td className="px-5 py-3">{a.job_title}</td>
                      <td className="px-5 py-3">
                        <Badge variant={a.status === 'COMPLETED' ? 'success' : 'danger'} size="xs">
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {a.is_rule_based ? 'Deterministic Engine' : a.model_name}
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

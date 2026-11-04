import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  FileCheck2,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { reportsAPI } from '../../api/reports';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await reportsAPI.getDashboard();
      setData(res);
    } catch (err) {
      setError('Unable to load real-time recruitment metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = data?.metrics || {};
  const statusColors = {
    NEW: 'bg-blue-500',
    IN_REVIEW: 'bg-amber-500',
    SHORTLISTED: 'bg-purple-500',
    INTERVIEW: 'bg-indigo-500',
    OFFER: 'bg-emerald-500',
    REJECTED: 'bg-rose-500',
    WITHDRAWN: 'bg-slate-400',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Role: {user?.role_display || user?.role}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="text-sm text-blue-100 max-w-xl">
            Live recruitment operations dashboard. Real-time statistics computed directly from PostgreSQL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <Link to="/jobs">
            <Button variant="secondary" size="md" icon={Plus}>
              Create Job
            </Button>
          </Link>
          <Link to="/analysis">
            <Button
              variant="outline"
              size="md"
              icon={Sparkles}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Start AI Screening
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Real-Time Metrics Cards */}
      {loading ? (
        <div className="py-12">
          <LoadingSpinner text="Computing recruitment metrics..." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Jobs */}
            <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Jobs</span>
                <Briefcase className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{metrics.total_jobs ?? 0}</div>
              <p className="text-[11px] text-emerald-600 font-medium">
                {metrics.open_jobs ?? 0} Open Openings
              </p>
            </div>

            {/* Candidates */}
            <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Candidates</span>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{metrics.total_candidates ?? 0}</div>
              <p className="text-[11px] text-slate-400">Profiles on file</p>
            </div>

            {/* Applications */}
            <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Pipeline</span>
                <FileCheck2 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{metrics.total_applications ?? 0}</div>
              <p className="text-[11px] text-amber-600 font-medium">
                {metrics.apps_in_review ?? 0} Under Review
              </p>
            </div>

            {/* AI Screenings */}
            <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>AI Analyses</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{metrics.completed_analyses ?? 0}</div>
              <p className="text-[11px] text-slate-400">
                {metrics.interviews_scheduled ?? 0} Interviews Scheduled
              </p>
            </div>
          </div>

          {/* Pipeline Distribution & Candidate by Job breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications by Status Breakdown */}
            <Card
              title="Applications by Recruitment Stage"
              subtitle="Current candidate distribution across pipeline stages"
            >
              <div className="space-y-3.5 pt-1">
                {data.applications_by_status?.map((item) => {
                  const total = metrics.total_applications || 1;
                  const pct = Math.round((item.count / total) * 100);

                  return (
                    <div key={item.status} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="text-slate-500">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${statusColors[item.status] || 'bg-blue-500'} transition-all duration-500`}
                          style={{ width: `${Math.max(pct, item.count > 0 ? 3 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Candidates per Job Breakdown */}
            <Card
              title="Applicants per Job Opening"
              subtitle="Demand volume across active job openings"
            >
              <div className="space-y-3 pt-1">
                {data.jobs_by_candidates?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No job openings created yet.</p>
                ) : (
                  data.jobs_by_candidates?.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <Link
                          to={`/jobs/${job.id}`}
                          className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                        >
                          {job.title}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">{job.department}</div>
                      </div>
                      <span className="inline-flex items-center gap-1 font-bold text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                        <Users className="w-3.5 h-3.5" />
                        {job.applicant_count} Applicants
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Recent Applications & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Applications (2 cols) */}
            <div className="lg:col-span-2">
              <Card
                title="Recent Applications"
                subtitle="Latest candidate applications submitted to the platform"
                action={
                  <Link to="/applications" className="text-xs text-blue-600 hover:underline font-medium">
                    View Pipeline &rarr;
                  </Link>
                }
                bodyClassName="p-0 overflow-hidden"
              >
                {data.recent_applications?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No applications recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3">Candidate</th>
                          <th className="px-5 py-3">Job Opening</th>
                          <th className="px-5 py-3">Stage</th>
                          <th className="px-5 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.recent_applications?.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <Link
                                to={`/applications/${app.id}`}
                                className="font-semibold text-slate-900 hover:text-blue-600"
                              >
                                {app.candidate_name}
                              </Link>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {app.candidate_email}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-medium text-slate-800">
                              {app.job_title}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {app.status_display}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-400">
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

            {/* Live Activity Feed (1 col) */}
            <div>
              <Card
                title="Activity Feed"
                subtitle="Audit log of recent system events"
              >
                {data.activity_feed?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No recent activity logs.</p>
                ) : (
                  <div className="space-y-3">
                    {data.activity_feed?.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 tracking-tight">
                            {item.action}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          By <span className="font-medium text-slate-700">{item.user_name}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

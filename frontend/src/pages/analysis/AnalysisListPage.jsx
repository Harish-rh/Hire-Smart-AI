import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  RotateCw,
  Cpu,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { aiAPI } from '../../api/ai';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import StartAnalysisModal from './StartAnalysisModal';

export default function AnalysisListPage() {
  const [analyses, setAnalyses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiHealth, setAiHealth] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Modal & Notifications
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  const fetchAIHealth = async () => {
    try {
      const health = await aiAPI.getHealth();
      setAiHealth(health);
    } catch {
      setAiHealth({ available: false, message: 'Local AI endpoint unreachable' });
    }
  };

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getAnalyses({ page });
      setAnalyses(data.results || data);
      setTotalCount(data.count ?? (data.results || data).length);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load resume analysis records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIHealth();
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [page]);

  const handleRetry = async (analysisId) => {
    setRetryingId(analysisId);
    setAlert(null);
    try {
      await aiAPI.retryAnalysis(analysisId);
      setAlert({ type: 'success', message: 'Analysis re-executed successfully!' });
      fetchAnalyses();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to re-run analysis.' });
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'FAILED':
        return <Badge variant="danger">Failed</Badge>;
      case 'PROCESSING':
        return <Badge variant="warning">Processing</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const completedCount = analyses.filter((a) => a.status === 'COMPLETED').length;
  const ruleBasedCount = analyses.filter((a) => a.is_rule_based).length;
  const llmCount = analyses.filter((a) => !a.is_rule_based && a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            AI Resume Analysis
          </h1>
          <p className="text-sm text-slate-500">
            Objective qualifications screening, resume evidence mapping, and interview guidance.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Sparkles}
          onClick={() => setIsModalOpen(true)}
        >
          Screen Resume
        </Button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* AI Engine Status & Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inference Engine</span>
            <Cpu className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">
              {aiHealth?.available ? 'Ollama Active' : 'Deterministic Engine'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {aiHealth?.available ? aiHealth.configured_model : 'Zero-memory offline fallback'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Analyses</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="font-bold text-slate-800 text-lg">{totalCount}</div>
          <p className="text-[11px] text-slate-400">Completed & Saved</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>LLM-Assisted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-bold text-emerald-600 text-lg">{llmCount}</div>
          <p className="text-[11px] text-slate-400">Generated via local model</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rule-Based Analyses</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-bold text-amber-600 text-lg">{ruleBasedCount}</div>
          <p className="text-[11px] text-slate-400">Pure Python evidence extraction</p>
        </div>
      </div>

      {/* Analysis Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Loading resume screening records..." />
          </div>
        ) : analyses.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No resume analyses conducted yet"
            description="Select any candidate application with an uploaded resume to perform automated qualifications screening."
            actionLabel="Screen Resume Now"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Target Job</th>
                  <th className="px-6 py-3.5">Inference Strategy</th>
                  <th className="px-6 py-3.5">Evidenced Requirements</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Screened Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyses.map((analysis) => {
                  const evidencedCount = analysis.requirement_evidence?.length ?? 0;
                  const missingCount = analysis.requirements_not_evidenced?.length ?? 0;

                  return (
                    <tr key={analysis.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/analysis/${analysis.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {analysis.candidate_name}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono">
                          {analysis.candidate_email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-800">
                          {analysis.job_title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {analysis.job_department}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {analysis.is_rule_based ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium border border-amber-200">
                            Rule-Based Engine
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                            <Sparkles className="w-3 h-3" />
                            {analysis.model_name}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {analysis.status === 'COMPLETED' ? (
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {evidencedCount} Evidenced
                            </span>
                            {missingCount > 0 && (
                              <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {missingCount} Unverified
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-rose-500 font-medium">Failed</span>
                        )}
                      </td>

                      <td className="px-6 py-4">{getStatusBadge(analysis.status)}</td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/analysis/${analysis.id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Inspect Evidence & Clarification Questions"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleRetry(analysis.id)}
                            disabled={retryingId === analysis.id}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
                            title="Re-run Screening"
                          >
                            <RotateCw className={`w-4 h-4 ${retryingId === analysis.id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalCount > 10 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing page {page} &bull; Total {totalCount} analyses</span>
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

      {/* Start Analysis Modal */}
      <StartAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStarted={(newAnalysis) => {
          setAlert({ type: 'success', message: 'Resume screening completed!' });
          fetchAnalyses();
        }}
      />
    </div>
  );
}

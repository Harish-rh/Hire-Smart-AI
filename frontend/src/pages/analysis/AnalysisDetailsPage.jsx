import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCw,
  ShieldCheck,
  User,
  Briefcase,
  FileText,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';
import { aiAPI } from '../../api/ai';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

export default function AnalysisDetailsPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getAnalysis(id);
      setAnalysis(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load analysis results.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const handleRetry = async () => {
    setRetrying(true);
    setAlert(null);
    try {
      const updated = await aiAPI.retryAnalysis(id);
      setAnalysis(updated);
      setAlert({ type: 'success', message: 'Analysis re-executed successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to re-run analysis.' });
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner text="Loading resume screening analysis..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500 mb-4">Analysis record not found.</p>
        <Link to="/analysis">
          <Button variant="outline" icon={ArrowLeft}>
            Back to Analyses
          </Button>
        </Link>
      </div>
    );
  }

  const evidencedCount = analysis.requirement_evidence?.length ?? 0;
  const notEvidencedCount = analysis.requirements_not_evidenced?.length ?? 0;
  const totalCount = evidencedCount + notEvidencedCount;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/analysis"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {analysis.candidate_name}
              </h1>
              <span className="text-slate-400 font-light">&rarr;</span>
              <span className="text-xl font-semibold text-slate-700">{analysis.job_title}</span>
              {analysis.is_rule_based ? (
                <Badge variant="warning">Rule-Based Analysis</Badge>
              ) : (
                <Badge variant="success">LLM-Assisted</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Screening ID #{analysis.id} &bull; Generated {new Date(analysis.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RotateCw}
            loading={retrying}
            onClick={handleRetry}
          >
            Re-run Screening
          </Button>
          <Link to={`/applications/${analysis.application}`}>
            <Button variant="primary" size="sm">
              View Application
            </Button>
          </Link>
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Mandatory AI Safety & Ethics Notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-amber-950">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          AI Advisory & Fairness Notice
        </div>
        <p>
          This automated qualification analysis is designed strictly to assist recruiter review. It does not automatically reject applicants or make hiring decisions. Missing evidence indicates that a requirement was not explicitly documented in the submitted resume text, not proof that the candidate lacks the skill.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-400">Requirements Evidenced</span>
          <div className="text-xl font-bold text-emerald-600">
            {evidencedCount} <span className="text-xs font-normal text-slate-400">/ {totalCount}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-400">Unverified in Resume</span>
          <div className="text-xl font-bold text-amber-600">{notEvidencedCount}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-400">Skills Extracted</span>
          <div className="text-xl font-bold text-blue-600">
            {analysis.skills_found?.length ?? 0}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-400">Inference Engine</span>
          <div className="text-xs font-semibold text-slate-800 truncate" title={analysis.model_name}>
            {analysis.is_rule_based ? 'Deterministic Engine' : analysis.model_name}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{analysis.prompt_version}</span>
        </div>
      </div>

      {/* Main Grid: Summary & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <Card title="Analysis Summary" subtitle="Factual synthesis of documented qualifications">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {analysis.summary || 'No summary available.'}
            </p>
          </Card>

          {/* Supporting Evidence Breakdown */}
          <Card
            title="Documented Evidence by Requirement"
            subtitle="Extracted sentences and factual quotes from candidate resume"
          >
            {analysis.requirement_evidence?.length === 0 ? (
              <p className="text-xs text-slate-400">No direct evidence extracted from resume.</p>
            ) : (
              <div className="space-y-3">
                {analysis.requirement_evidence.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {item.requirement}
                      </span>
                      <Badge variant="success" size="xs">
                        Evidenced
                      </Badge>
                    </div>
                    <blockquote className="text-xs text-slate-600 pl-3 border-l-2 border-emerald-400 italic bg-white p-2 rounded">
                      "{item.evidence}"
                    </blockquote>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Requirements Not Evidenced */}
          {analysis.requirements_not_evidenced?.length > 0 && (
            <Card
              title="Requirements Not Explicitly Evidenced in Resume"
              subtitle="Skills or criteria where no direct sentence matches were identified"
            >
              <div className="space-y-2">
                {analysis.requirements_not_evidenced.map((req, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-amber-50/50 border border-amber-200/80 rounded-lg flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      {req}
                    </span>
                    <Badge variant="warning" size="xs">
                      Clarification Recommended
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Suggested Clarification Questions */}
          {analysis.clarification_questions?.length > 0 && (
            <Card
              title="Suggested Interview Clarification Questions"
              subtitle="Questions for the recruiter to probe unevidenced or ambiguous areas"
            >
              <ul className="space-y-2 text-xs text-slate-700">
                {analysis.clarification_questions.map((q, idx) => (
                  <li
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5"
                  >
                    <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Right Sidebar: Skills Tags & Metadata */}
        <div className="space-y-6">
          <Card title="Skills Found" subtitle="Detected in candidate profile & resume">
            <div className="flex flex-wrap gap-1.5">
              {analysis.skills_found?.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>

          <Card title="Candidate & Job Links" subtitle="Quick navigation">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Candidate</span>
                <Link
                  to={`/candidates/${analysis.candidate_id}`}
                  className="font-semibold text-slate-800 hover:text-blue-600"
                >
                  {analysis.candidate_name} &rarr;
                </Link>
                <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                  {analysis.candidate_email}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block mb-0.5">Job Opening</span>
                <Link
                  to={`/jobs/${analysis.job_id}`}
                  className="font-semibold text-slate-800 hover:text-blue-600"
                >
                  {analysis.job_title} &rarr;
                </Link>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {analysis.job_department}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

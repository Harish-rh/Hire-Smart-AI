import React from 'react';
import {
  Briefcase,
  Users,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const quickActions = [
    {
      title: 'Create Job Opening',
      desc: 'Define requirements, experience ranges, and key skills.',
      icon: Briefcase,
      to: '/jobs',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Add Candidate & Resume',
      desc: 'Upload PDF/DOCX resumes and extract text securely.',
      icon: Users,
      to: '/candidates',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Application Pipeline',
      desc: 'Track candidate progress from New to Interview & Offer.',
      icon: FileCheck2,
      to: '/applications',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'AI Resume Analysis',
      desc: 'Screen qualifications against job requirements with local AI.',
      icon: Sparkles,
      to: '/analysis',
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>Role: {user?.role_display || user?.role}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="text-sm text-blue-100 max-w-xl">
            HireSmart AI is ready. Manage recruitment pipelines, inspect applicant qualifications, and run private AI-assisted resume screening.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <Link to="/jobs">
            <Button variant="secondary" size="md" icon={Briefcase}>
              View Job Openings
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

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Quick Recruitment Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="group block p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <action.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>{action.title}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
              </h3>
              <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* System & Architecture Status Card */}
      <Card
        title="Phase 3 System Architecture Status"
        subtitle="Active components running locally on Windows"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Authentication
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-semibold text-sm text-slate-800">DRF SimpleJWT + Roles</div>
            <p className="text-xs text-slate-500">
              Role-based access enforced on backend APIs & frontend routes.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Database Engine
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-semibold text-sm text-slate-800">Django ORM Data Models</div>
            <p className="text-xs text-slate-500">
              Dual-mode support (SQLite low-memory mode active; PostgreSQL ready).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Local AI Engine
              </span>
              <Cpu className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-semibold text-sm text-slate-800">Ollama + Fallback Layer</div>
            <p className="text-xs text-slate-500">
              Local inference abstraction with deterministic rule-based fallback.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

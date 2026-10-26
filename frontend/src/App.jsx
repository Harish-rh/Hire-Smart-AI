import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Database, Cpu, Sparkles, Layers } from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    healthy: false,
    data: null,
    error: null,
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get(`${apiUrl}/health/`, { timeout: 3000 });
        setBackendStatus({
          loading: false,
          healthy: true,
          data: response.data,
          error: null,
        });
      } catch (err) {
        setBackendStatus({
          loading: false,
          healthy: false,
          data: null,
          error: err.message || 'Could not connect to Django backend',
        });
      }
    };

    checkBackend();
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">HireSmart AI</h1>
            <p className="text-sm text-slate-500">AI-Powered Recruitment Management & Resume Analysis</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            Phase 1 — Environment & Project Setup Verification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">React Frontend</p>
                <p className="text-xs text-slate-500">Vite 5, Tailwind CSS, Lucide Icons</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700 rounded">
                  Operational
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3">
              {backendStatus.loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mt-0.5 shrink-0" />
              ) : backendStatus.healthy ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <Cpu className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-medium text-slate-800">Django Backend</p>
                <p className="text-xs text-slate-500">DRF, SimpleJWT, CORS Headers</p>
                {backendStatus.loading ? (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-700 rounded">
                    Checking {apiUrl}...
                  </span>
                ) : backendStatus.healthy ? (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700 rounded">
                    Connected ({backendStatus.data?.database_engine})
                  </span>
                ) : (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded">
                    Ready (start server to link)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              System Constraint Specifications
            </div>
            <p>Target System: Windows 10 Pro | RAM: ~4 GB (Low memory architecture prioritized)</p>
            <p>Local AI Strategy: Ollama (llama3.2:1b) + Deterministic rule-based fallback</p>
            <p>Zero-cost constraint: 100% Free local dependencies without paid cloud APIs</p>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-400 text-center border-t border-slate-100">
          HireSmart AI &bull; Production Full-Stack Recruitment System &bull; Phase 1 Verified
        </div>
      </div>
    </div>
  );
}

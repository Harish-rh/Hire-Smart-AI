import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  FileText,
  Upload,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { candidatesAPI } from '../../api/candidates';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import CandidateFormModal from './CandidateFormModal';
import ResumeUploadModal from './ResumeUploadModal';

export default function CandidateListPage() {
  const [candidates, setCandidates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [uploadCandidate, setUploadCandidate] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (search.trim()) params.search = search.trim();

      const data = await candidatesAPI.getCandidates(params);
      setCandidates(data.results || data);
      setTotalCount(data.count ?? (data.results || data).length);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load candidates.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  };

  const handleSaveCandidate = async (formData, id = null) => {
    if (id) {
      await candidatesAPI.updateCandidate(id, formData);
      setAlert({ type: 'success', message: 'Candidate profile updated successfully!' });
    } else {
      await candidatesAPI.createCandidate(formData);
      setAlert({ type: 'success', message: 'Candidate added successfully!' });
    }
    fetchCandidates();
  };

  const handleDeleteCandidate = async (candidate) => {
    if (!window.confirm(`Delete profile for ${candidate.full_name}?`)) {
      return;
    }
    try {
      await candidatesAPI.deleteCandidate(candidate.id);
      setAlert({ type: 'success', message: `Candidate ${candidate.full_name} deleted.` });
      fetchCandidates();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete candidate.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Directory</h1>
          <p className="text-sm text-slate-500">
            Maintain applicant profiles, upload resumes, and extract qualifications for AI analysis.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingCandidate(null);
            setIsFormOpen(true);
          }}
        >
          Add Candidate
        </Button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search Input */}
      <Card bodyClassName="p-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, email, skills, or location..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      {/* Candidates Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Loading candidates..." />
          </div>
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No candidates found"
            description="Add candidate profiles or upload resumes to start building your applicant pipeline."
            actionLabel="Add Candidate"
            onAction={() => {
              setEditingCandidate(null);
              setIsFormOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Candidate Details</th>
                  <th className="px-6 py-3.5">Contact & Location</th>
                  <th className="px-6 py-3.5">Key Skills</th>
                  <th className="px-6 py-3.5">Resume File</th>
                  <th className="px-6 py-3.5">Applications</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {cand.full_name ? cand.full_name[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <Link
                            to={`/candidates/${cand.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {cand.full_name}
                          </Link>
                          <div className="text-xs text-slate-400 mt-0.5 font-mono">
                            {cand.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-700 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {cand.location || 'Location Not Specified'}
                      </div>
                      {cand.phone && (
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3" />
                          {cand.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cand.skills?.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium border border-emerald-100"
                          >
                            {skill}
                          </span>
                        ))}
                        {cand.skills?.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
                            +{cand.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {cand.has_resume ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span className="truncate max-w-[120px]" title={cand.resume_filename}>
                            {cand.resume_filename || 'Uploaded'}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setUploadCandidate(cand)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload File</span>
                        </button>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {cand.applications_count ?? 0}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/candidates/${cand.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Profile & Resume"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setUploadCandidate(cand)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Upload/Replace Resume"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCandidate(cand);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Candidate"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCandidate(cand)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Delete Candidate"
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
            <span>Showing page {page} &bull; Total {totalCount} candidates</span>
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

      {/* Add / Edit Modal */}
      <CandidateFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={handleSaveCandidate}
        candidate={editingCandidate}
      />

      {/* Resume Upload Modal */}
      {uploadCandidate && (
        <ResumeUploadModal
          isOpen={!!uploadCandidate}
          onClose={() => setUploadCandidate(null)}
          candidate={uploadCandidate}
          onUploaded={() => {
            fetchCandidates();
          }}
        />
      )}
    </div>
  );
}

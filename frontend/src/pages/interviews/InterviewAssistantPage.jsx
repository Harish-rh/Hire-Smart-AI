import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Search,
  BookOpen,
  Briefcase,
  User,
  Eye,
  Trash2,
  Sparkles,
  Layers,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { interviewsAPI } from '../../api/interviews';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import QuestionGeneratorModal from './QuestionGeneratorModal';

export default function InterviewAssistantPage() {
  const [questionSets, setQuestionSets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Modals & alerts
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (search.trim()) params.search = search.trim();

      const data = await interviewsAPI.getQuestionSets(params);
      setQuestionSets(data.results || data);
      setTotalCount(data.count ?? (data.results || data).length);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load interview question sets.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionSets();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestionSets();
  };

  const handleDelete = async (questionSet) => {
    if (!window.confirm(`Delete question set for "${questionSet.topic}"?`)) {
      return;
    }
    try {
      await interviewsAPI.deleteQuestionSet(questionSet.id);
      setAlert({ type: 'success', message: 'Question set deleted.' });
      fetchQuestionSets();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete question set.' });
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'BEGINNER':
        return <Badge variant="primary">Beginner</Badge>;
      case 'INTERMEDIATE':
        return <Badge variant="warning">Intermediate</Badge>;
      case 'ADVANCED':
        return <Badge variant="danger">Advanced</Badge>;
      default:
        return <Badge variant="neutral">{diff}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Interview Assistant
          </h1>
          <p className="text-sm text-slate-500">
            Generate role-specific technical questions, evaluation points, and interview rubrics.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Generate Questions
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
              placeholder="Search by topic, job title, or candidate name..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      {/* Question Sets Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Loading interview question sets..." />
          </div>
        ) : questionSets.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="No question sets generated yet"
            description="Generate tailored questions for upcoming candidate interviews or job openings."
            actionLabel="Generate Questions Now"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Topic & Focus</th>
                  <th className="px-6 py-3.5">Target Job Opening</th>
                  <th className="px-6 py-3.5">Target Candidate</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5">Questions</th>
                  <th className="px-6 py-3.5">Engine Source</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questionSets.map((qs) => (
                  <tr key={qs.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/interviews/${qs.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {qs.topic}
                      </Link>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Created by {qs.created_by_name} &bull; {new Date(qs.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        to={`/jobs/${qs.job}`}
                        className="text-xs font-medium text-slate-800 hover:text-blue-600"
                      >
                        {qs.job_title}
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      {qs.candidate_name ? (
                        <Link
                          to={`/candidates/${qs.candidate}`}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          {qs.candidate_name}
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 italic">General Question Set</span>
                      )}
                    </td>

                    <td className="px-6 py-4">{getDifficultyBadge(qs.difficulty)}</td>

                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {qs.questions?.length ?? 0} Questions
                    </td>

                    <td className="px-6 py-4">
                      {qs.is_ai_generated ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Sparkles className="w-3 h-3" /> AI Generated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          <BookOpen className="w-3 h-3" /> Question Bank
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/interviews/${qs.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View & Copy Questions"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(qs)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Delete Question Set"
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
            <span>Showing page {page} &bull; Total {totalCount} sets</span>
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

      {/* Generator Modal */}
      <QuestionGeneratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerated={(newSet) => {
          setAlert({ type: 'success', message: 'Technical interview questions generated successfully!' });
          fetchQuestionSets();
        }}
      />
    </div>
  );
}

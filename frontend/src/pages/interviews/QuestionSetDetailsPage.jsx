import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Briefcase,
  User,
  Trash2,
  Edit3,
  Save,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { interviewsAPI } from '../../api/interviews';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

export default function QuestionSetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questionSet, setQuestionSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Edit Mode state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedQuestionText, setEditedQuestionText] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchQuestionSet = async () => {
    try {
      setLoading(true);
      const data = await interviewsAPI.getQuestionSet(id);
      setQuestionSet(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load question set.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionSet();
  }, [id]);

  const handleCopySingle = (q, idx) => {
    const text = `Question: ${q.question}\n\nEvaluation Points:\n${q.evaluation_points?.map((p) => `- ${p}`).join('\n')}\n\nSuggested Answer:\n${q.suggested_answer}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    if (!questionSet?.questions) return;
    const fullText = questionSet.questions
      .map(
        (q, i) =>
          `Q${i + 1}: ${q.question}\nEvaluation Points:\n${q.evaluation_points?.map((p) => ` - ${p}`).join('\n')}\nSuggested Answer:\n${q.suggested_answer}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this question set?')) return;
    try {
      await interviewsAPI.deleteQuestionSet(id);
      navigate('/interviews');
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete question set.' });
    }
  };

  const startEditQuestion = (idx, q) => {
    setEditingIndex(idx);
    setEditedQuestionText(q.question);
    setEditedAnswer(q.suggested_answer || '');
  };

  const handleSaveQuestionEdit = async (idx) => {
    if (!editedQuestionText.trim()) return;

    setSaving(true);
    try {
      const updatedQuestions = [...questionSet.questions];
      updatedQuestions[idx] = {
        ...updatedQuestions[idx],
        question: editedQuestionText.trim(),
        suggested_answer: editedAnswer.trim(),
      };

      const updated = await interviewsAPI.updateQuestionSet(id, {
        questions: updatedQuestions,
      });
      setQuestionSet(updated);
      setEditingIndex(null);
      setAlert({ type: 'success', message: 'Question updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to save question edit.' });
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner text="Loading interview question set..." />
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500 mb-4">Question set not found.</p>
        <Link to="/interviews">
          <Button variant="outline" icon={ArrowLeft}>
            Back to Assistant
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/interviews"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {questionSet.topic} Questions
              </h1>
              {getDifficultyBadge(questionSet.difficulty)}
              {questionSet.is_ai_generated ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Sparkles className="w-3 h-3" /> AI Generated
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  <BookOpen className="w-3 h-3" /> Question Bank
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Set #{questionSet.id} &bull; Generated by {questionSet.created_by_name} &bull; {new Date(questionSet.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={copiedAll ? Check : Copy}
            onClick={handleCopyAll}
          >
            {copiedAll ? 'All Copied!' : 'Copy All Questions'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Trash2}
            onClick={handleDelete}
            className="text-rose-600 hover:bg-rose-50"
          >
            Delete Set
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

      {/* Target Role & Candidate Info Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-700">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <span>Target Role:</span>
            <Link to={`/jobs/${questionSet.job}`} className="font-semibold text-blue-600 hover:underline">
              {questionSet.job_title}
            </Link>
          </div>

          {questionSet.candidate_name && (
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-slate-400" />
              <span>Tailored for:</span>
              <Link to={`/candidates/${questionSet.candidate}`} className="font-semibold text-blue-600 hover:underline">
                {questionSet.candidate_name}
              </Link>
            </div>
          )}
        </div>

        <span className="font-medium text-slate-500">
          Total: {questionSet.questions?.length ?? 0} Questions
        </span>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questionSet.questions?.map((q, idx) => {
          const isEditing = editingIndex === idx;

          return (
            <Card key={idx} bodyClassName="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    {isEditing ? (
                      <textarea
                        rows="2"
                        value={editedQuestionText}
                        onChange={(e) => setEditedQuestionText(e.target.value)}
                        className="w-full text-sm font-semibold border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <h3 className="text-base font-semibold text-slate-900 leading-snug">
                        {q.question}
                      </h3>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopySingle(q, idx)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="Copy Question & Rubric"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {isEditing ? (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={saving}
                      icon={Save}
                      onClick={() => handleSaveQuestionEdit(idx)}
                    >
                      Save
                    </Button>
                  ) : (
                    <button
                      onClick={() => startEditQuestion(idx, q)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Question"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Evaluation Points */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Expected Candidate Evaluation Rubric:
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {q.evaluation_points?.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">&bull;</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Model / Suggested Answer */}
              <div className="p-3.5 bg-blue-50/40 border border-blue-100 rounded-xl space-y-1.5">
                <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider block">
                  Suggested Model Answer:
                </span>
                {isEditing ? (
                  <textarea
                    rows="3"
                    value={editedAnswer}
                    onChange={(e) => setEditedAnswer(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{q.suggested_answer}"
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

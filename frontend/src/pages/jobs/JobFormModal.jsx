import React, { useState, useEffect } from 'react';
import { Briefcase, X, Plus, AlertCircle } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function JobFormModal({ isOpen, onClose, onSaved, job = null }) {
  const isEditing = !!job;

  const initialForm = {
    title: '',
    department: '',
    employment_type: 'FULL_TIME',
    location: 'Remote',
    status: 'OPEN',
    min_experience: 0,
    max_experience: 0,
    required_skills: [],
    preferred_skills: [],
    description: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        department: job.department || '',
        employment_type: job.employment_type || 'FULL_TIME',
        location: job.location || 'Remote',
        status: job.status || 'OPEN',
        min_experience: job.min_experience ?? 0,
        max_experience: job.max_experience ?? 0,
        required_skills: Array.isArray(job.required_skills) ? [...job.required_skills] : [],
        preferred_skills: Array.isArray(job.preferred_skills) ? [...job.preferred_skills] : [],
        description: job.description || '',
      });
    } else {
      setFormData(initialForm);
    }
    setError('');
  }, [job, isOpen]);

  const handleAddReqSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = reqSkillInput.trim();
      if (val && !formData.required_skills.includes(val)) {
        setFormData((prev) => ({
          ...prev,
          required_skills: [...prev.required_skills, val],
        }));
      }
      setReqSkillInput('');
    }
  };

  const handleRemoveReqSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddPrefSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = prefSkillInput.trim();
      if (val && !formData.preferred_skills.includes(val)) {
        setFormData((prev) => ({
          ...prev,
          preferred_skills: [...prev.preferred_skills, val],
        }));
      }
      setPrefSkillInput('');
    }
  };

  const handleRemovePrefSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      preferred_skills: prev.preferred_skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const minExp = parseInt(formData.min_experience, 10) || 0;
    const maxExp = parseInt(formData.max_experience, 10) || 0;

    if (maxExp > 0 && minExp > maxExp) {
      setError('Minimum experience cannot exceed maximum experience.');
      return;
    }

    if (formData.required_skills.length === 0 && !reqSkillInput.trim()) {
      setError('Please add at least one required technical skill.');
      return;
    }

    // Auto-commit pending tag input if any
    let finalReqSkills = [...formData.required_skills];
    if (reqSkillInput.trim() && !finalReqSkills.includes(reqSkillInput.trim())) {
      finalReqSkills.push(reqSkillInput.trim());
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        min_experience: minExp,
        max_experience: maxExp,
        required_skills: finalReqSkills,
      };

      await onSaved(payload, job?.id);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.min_experience?.[0] ||
        err.response?.data?.title?.[0] ||
        err.response?.data?.department?.[0] ||
        err.response?.data?.detail ||
        'Failed to save job opening.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Job Opening' : 'Create New Job Opening'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Senior Full-Stack Engineer"
            required
          />

          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="e.g. Engineering or Product"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Employment Type
            </label>
            <select
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
              className="block w-full rounded-lg text-sm border border-slate-300 py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Remote or New York, NY"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Job Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="block w-full rounded-lg text-sm border border-slate-300 py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPEN">Open</option>
              <option value="DRAFT">Draft</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Experience Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Min Experience (Years)"
            type="number"
            min="0"
            max="40"
            value={formData.min_experience}
            onChange={(e) => setFormData({ ...formData, min_experience: e.target.value })}
            helper="0 for entry level"
          />

          <Input
            label="Max Experience (Years)"
            type="number"
            min="0"
            max="40"
            value={formData.max_experience}
            onChange={(e) => setFormData({ ...formData, max_experience: e.target.value })}
            helper="0 for no upper limit"
          />
        </div>

        {/* Required Skills Tag Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Required Technical Skills <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-300 rounded-lg min-h-[42px] items-center">
            {formData.required_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveReqSkill(skill)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={reqSkillInput}
              onChange={(e) => setReqSkillInput(e.target.value)}
              onKeyDown={handleAddReqSkill}
              placeholder={formData.required_skills.length === 0 ? "Type skill and press Enter..." : "Add another..."}
              className="bg-transparent text-sm focus:outline-none flex-1 min-w-[140px] px-1"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Type skill and press <kbd className="px-1 py-0.5 bg-slate-200 rounded text-[10px]">Enter</kbd> or comma
          </p>
        </div>

        {/* Preferred Skills Tag Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Preferred Qualifications (Optional)
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-300 rounded-lg min-h-[42px] items-center">
            {formData.preferred_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-200 text-slate-800 text-xs font-medium rounded-md"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemovePrefSkill(skill)}
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={prefSkillInput}
              onChange={(e) => setPrefSkillInput(e.target.value)}
              onKeyDown={handleAddPrefSkill}
              placeholder="Type preferred skill and press Enter..."
              className="bg-transparent text-sm focus:outline-none flex-1 min-w-[140px] px-1"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Job Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe role responsibilities, team structure, and impact..."
            required
            className="block w-full rounded-lg text-sm border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} icon={Briefcase}>
            {isEditing ? 'Save Changes' : 'Create Job Opening'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

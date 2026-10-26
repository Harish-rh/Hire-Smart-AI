import React, { useState, useEffect } from 'react';
import { User, X, Plus } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function CandidateFormModal({ isOpen, onClose, onSaved, candidate = null }) {
  const isEditing = !!candidate;

  const initialForm = {
    full_name: '',
    email: '',
    phone: '',
    location: '',
    skills: [],
    experience_summary: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (candidate) {
      setFormData({
        full_name: candidate.full_name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        location: candidate.location || '',
        skills: Array.isArray(candidate.skills) ? [...candidate.skills] : [],
        experience_summary: candidate.experience_summary || '',
      });
    } else {
      setFormData(initialForm);
    }
    setError('');
  }, [candidate, isOpen]);

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !formData.skills.includes(val)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, val],
        }));
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let finalSkills = [...formData.skills];
    if (skillInput.trim() && !finalSkills.includes(skillInput.trim())) {
      finalSkills.push(skillInput.trim());
    }

    setLoading(true);

    try {
      await onSaved({ ...formData, skills: finalSkills }, candidate?.id);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.full_name?.[0] ||
        err.response?.data?.detail ||
        'Failed to save candidate.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Candidate Profile' : 'Add New Candidate'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="e.g. Alex Rivera"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. alex@example.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="e.g. +1 (555) 000-0000"
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Austin, TX or Remote"
          />
        </div>

        {/* Skills Tag Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Skills & Competencies
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-300 rounded-lg min-h-[42px] items-center">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-md"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-emerald-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder={formData.skills.length === 0 ? "Type skill and press Enter..." : "Add skill..."}
              className="bg-transparent text-sm focus:outline-none flex-1 min-w-[130px] px-1"
            />
          </div>
        </div>

        {/* Experience Summary */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Experience Summary
          </label>
          <textarea
            rows="3"
            value={formData.experience_summary}
            onChange={(e) => setFormData({ ...formData, experience_summary: e.target.value })}
            placeholder="Brief professional background, years in industry, key projects..."
            className="block w-full rounded-lg text-sm border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} icon={User}>
            {isEditing ? 'Save Changes' : 'Create Candidate'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

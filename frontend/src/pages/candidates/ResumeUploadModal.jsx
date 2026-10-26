import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { candidatesAPI } from '../../api/candidates';

export default function ResumeUploadModal({ isOpen, onClose, candidate, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successSnippet, setSuccessSnippet] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError('');
    setSuccessSnippet('');
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Only PDF (.pdf) and Word (.docx) documents are supported.');
      setFile(null);
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5 MB limit.');
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or DOCX resume file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await candidatesAPI.uploadResume(candidate.id, file);
      setSuccessSnippet(response.extracted_text_snippet || 'Text extracted successfully.');
      onUploaded(response.candidate);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to upload resume.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    setSuccessSnippet('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Upload Resume — ${candidate?.full_name || 'Candidate'}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleUpload} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {successSnippet ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Resume Processed & Extracted</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  The document has been securely stored and text extracted locally for AI screening.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Extracted Text Preview:
              </span>
              <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {successSnippet}...
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* File drop area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                file ? 'border-blue-400 bg-blue-50/40' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>

              {file ? (
                <div>
                  <p className="font-semibold text-sm text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for extraction
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Click to select or drag and drop resume
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supported formats: PDF or Word DOCX (Max 5 MB)
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-slate-600 space-y-1">
              <p className="font-medium text-blue-900">Privacy & Processing Guarantee</p>
              <p>
                Text extraction runs 100% locally via pure-Python parsers (`pypdf` and `python-docx`). Resumes remain private on localhost and are never uploaded to third-party cloud services.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={loading}
                disabled={!file}
                icon={Upload}
              >
                Upload & Extract Text
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

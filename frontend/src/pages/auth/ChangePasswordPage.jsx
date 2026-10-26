import React, { useState } from 'react';
import { Lock, Check, ShieldCheck } from 'lucide-react';
import { authAPI } from '../../api/auth';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(oldPassword, newPassword);
      setSuccess('Your password has been changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg =
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.detail ||
        'Failed to change password. Please verify your current password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Change Password</h1>
        <p className="text-sm text-slate-500">Ensure your account remains protected with a strong password.</p>
      </div>

      {success && (
        <Alert type="success" title="Success" message={success} onClose={() => setSuccess('')} />
      )}
      {error && (
        <Alert type="error" title="Password Update Failed" message={error} onClose={() => setError('')} />
      )}

      <Card
        title="Update Password"
        subtitle="Passwords must be at least 8 characters long"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            icon={Lock}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter your current password"
            required
          />

          <Input
            label="New Password"
            type="password"
            icon={Lock}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter minimum 8 characters"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            required
          />

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={ShieldCheck}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

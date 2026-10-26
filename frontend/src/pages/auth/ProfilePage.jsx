import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Check, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const updated = await authAPI.updateProfile({
        full_name: fullName,
        email: email,
      });
      updateUser(updated);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || 'Failed to update profile.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500">Manage your recruitment account information and settings.</p>
      </div>

      {success && (
        <Alert type="success" title="Success" message={success} onClose={() => setSuccess('')} />
      )}
      {error && (
        <Alert type="error" title="Update Failed" message={error} onClose={() => setError('')} />
      )}

      {/* Account Overview Card */}
      <Card title="Account Overview" subtitle="Basic details and role assignment">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
            {user?.full_name ? user.full_name[0].toUpperCase() : user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">{user?.full_name || user?.username}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            <div className="pt-1 flex items-center gap-2">
              <Badge variant={user?.role === 'ADMIN' ? 'purple' : 'primary'}>
                {user?.role_display || user?.role}
              </Badge>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined: {new Date(user?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleUpdate} className="pt-6 space-y-4">
          <Input
            label="Username (Read-Only)"
            value={user?.username || ''}
            disabled
            helper="Username cannot be modified after creation."
          />

          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. John Doe"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john@hiresmart.local"
            required
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={Save}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

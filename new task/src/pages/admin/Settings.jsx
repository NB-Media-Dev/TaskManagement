import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, Button, Input } from '../../components/ui';
import { changePassword as apiChangePassword } from '../../services';

import { validatePassword } from '../../utils/helpers';

export default function Settings() {
  const { user } = useAuth();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if ( !newPassword || !confirmPassword) {
      toast.warning('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) {
      toast.warning(passCheck.message);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiChangePassword({
        email: user?.email,
        // currentPassword,
        newPassword,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Password updated successfully');
        // setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="settings-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '48rem' }}>
      <div>
        <h1 className="dashboard-header-title">Admin Settings</h1>
        <p className="dashboard-header-sub">Manage your account and change password.</p>
      </div>

      <Card className="ui-card-p6">
        <h3 className="dashboard-card-title" style={{ marginBottom: '0.25rem' }}>Account Details</h3>
        <p className="dashboard-header-sub" style={{ marginBottom: '1rem' }}>Signed in as {user?.email}</p>
        <div className="employee-form-grid">
          <Input label="Email address" value={user?.email || ''} disabled />
          <Input label="Role" value={user?.role || ''} disabled />
        </div>
      </Card>

      <Card className="ui-card-p6">
        <div className="reports-header-icon" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="dashboard-card-title" style={{ margin: 0 }}>Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          /> */}

          <div className="employee-form-grid">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <Button type="submit" loading={submitting}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

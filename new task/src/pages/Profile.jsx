import { useState, useEffect } from 'react';
import { Mail, Shield, Lock, ShieldCheckIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, Avatar, Badge, Button, Input } from '../components/ui';
import { changePassword as apiChangePassword, getEmployees } from '../services';
import { validatePassword } from '../utils/helpers';

export default function Profile() {
  const { user, employee } = useAuth();
  const toast = useToast();

  const [empDetails, setEmpDetails] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email) {
      getEmployees(user.email)
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
            const found = res.data.data.find(e => e.emp_email === user.email) || res.data.data[0];
            setEmpDetails(found);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const getDisplayRole = () => {
    if (user?.role === 'Admin') return 'Admin';
    const deptRole = empDetails?.emp_role || user?.emp_role || employee?.emp_role;
    const isTL = user?.role === 'TL' || user?.position === 'TL' || empDetails?.position === 'TL';
    
    if (deptRole && deptRole !== 'Employee' && deptRole !== 'TL') {
      return isTL ? `${deptRole} (TL)` : deptRole;
    }
    return isTL ? 'Team Lead (TL)' : 'Employee';
  };

  const displayRoleLabel = getDisplayRole();

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
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
        newPassword,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Password updated successfully');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error updating password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '48rem' }}>
      <div>
        <h1 className="dashboard-header-title">My Profile</h1>
        <p className="dashboard-header-sub">View account information and manage your password.</p>
      </div>

      <Card className="ui-card-p6">
        <div className="profile-user-row">
          <Avatar name={user?.email} size="lg" />
          <div>
            <h2 className="dashboard-card-title">{user?.name || user?.email?.split('@')[0] || 'Employee'}</h2>
            {/* <Badge variant={user?.role === 'Admin' ? 'primary' : 'secondary'} className="mt-1"> */}
              {/* <h5>{displayRoleLabel}</h5> */}
            {/* </Badge> */}
          </div>
        </div>

        <div className="profile-info-list" style={{ marginTop: '1.25rem' }}>
          <div className="profile-info-item">
            <Mail className="w-4 h-4 text-primary" />
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user?.email || '—'}</span>
          </div>
          <div className="profile-info-item">
            <Shield className="w-4 h-4 text-primary" />
            <span className="profile-info-label">Role</span>
            <span className="profile-info-value">{displayRoleLabel}</span>
          </div>
        </div>
      </Card>

      <Card className="ui-card-p6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="dashboard-card-title" style={{ margin: 0 }}>Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
          /> */}

          <div className="employee-form-grid">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <Button type="submit" loading={submitting}>
              <ShieldCheckIcon className="w-4 h-4" /> Save New Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Mail, Shield, Lock, ShieldCheckIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, Avatar, PasswordChangeFormSection } from '../components/ui';
import { changePassword as apiChangePassword, getEmployees } from '../services';
import { executePasswordChange } from '../utils/helpers';

export default function Profile() {
  const { user, employee } = useAuth();
  const toast = useToast();

  const [empDetails, setEmpDetails] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.email) {
        try {
          const res = await getEmployees();
          if (res.data?.success && Array.isArray(res.data.data)) {
            const found = res.data.data.find(
              (e) => e.emp_email?.toLowerCase() === user.email.toLowerCase()
            );
            if (found) setEmpDetails(found);
          }
        } catch (err) {
          console.error('Failed to fetch profile info', err);
        }
      }
    };
    fetchProfile();
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

  const handlePasswordChange = (e) => {
    e.preventDefault();
    executePasswordChange({
      email: user?.email,
      newPassword,
      confirmPassword,
      toast,
      setSubmitting,
      apiChangePassword,
      onSuccess: () => {
        setNewPassword('');
        setConfirmPassword('');
      },
    });
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

        <PasswordChangeFormSection
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          onSubmit={handlePasswordChange}
          submitting={submitting}
          submitIcon={ShieldCheckIcon}
        />
      </Card>
    </div>
  );
}

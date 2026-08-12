import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Briefcase } from 'lucide-react';
import { resetPassword } from '../services';
import { useToast } from '../context/ToastContext';
import { Button, Input } from '../components/ui';
import { validatePassword, validateEmail } from '../utils/helpers';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [cpasswordError, setCpasswordError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');
    setCpasswordError('');

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setEmailError(emailCheck.message);
      toast.warning(emailCheck.message);
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setPasswordError(passCheck.message);
      toast.warning(passCheck.message);
      return;
    }

    if (password !== cpassword) {
      setCpasswordError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email: emailCheck.value, password });
      if (res.data.success) {
        toast.success(res.data.message || 'Password updated! Please sign in.');
        navigate('/');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-brand-panel">
        <div>
          <div className="auth-brand-glow-1" />
          <div className="auth-brand-glow-2" />
        </div>
        <div className="auth-brand-header">
          <div className="auth-brand-icon">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="auth-brand-title">Task Management</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="auth-brand-content"
        >
          <p className="auth-brand-subtitle">Account recovery</p>
          <h1 className="auth-brand-heading">Let's get you back in.</h1>
          <p className="auth-brand-description">
            Set a new password for your account and you'll be right back to your dashboard.
          </p>
        </motion.div>
        <div className="auth-brand-footer">© {new Date().getFullYear()} Task Management System</div>
      </aside>

      <div className="auth-form-panel">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="auth-card"
        >
          <p className="auth-tag">Reset password</p>
          <h2 className="auth-heading">Create new password</h2>
          <p className="auth-subheading">Enter your email and choose a new password.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input label="Email address" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} required />
            <Input label="New password" type="password" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} error={passwordError} required />
            <Input label="Confirm password" type="password" icon={Lock} value={cpassword} onChange={(e) => setCpassword(e.target.value)} error={cpasswordError} required />

            <Button type="submit" className="btn-full" size="lg" loading={loading}>
              Create password
            </Button>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-light)', margin: 0 }}>
              Remembered it?{' '}
              <Link to="/" className="auth-link">
                Back to sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

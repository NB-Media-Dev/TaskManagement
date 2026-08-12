import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Briefcase, Info } from 'lucide-react';
import { createAccount } from '../services';
import { useToast } from '../context/ToastContext';
import { Button, Input } from '../components/ui';
import { validatePassword, validateName, validateEmail } from '../utils/helpers';

export default function CreateAccount() {
  const navigate = useNavigate();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    setUsernameError('');
    setEmailError('');
    setPasswordError('');

    const nameCheck = validateName(username, 'User name');
    if (!nameCheck.valid) {
      setUsernameError(nameCheck.message);
      toast.warning(nameCheck.message);
      return;
    }

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

    if (!role) {
      toast.warning('Please select a role');
      return;
    }

    setLoading(true);
    try {
      const res = await createAccount({
        username: nameCheck.value,
        email: emailCheck.value,
        password,
        role
      });
      if (res.data.success) {
        toast.success('Account created successfully');
        navigate('/');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error');
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
          <p className="auth-brand-subtitle">Get started</p>
          <h1 className="auth-brand-heading">Set up your account.</h1>
          <p className="auth-brand-description">
            Create your login once, and your admin or employee dashboard is one sign-in away.
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
          <p className="auth-tag">Sign up</p>
          <h2 className="auth-heading">Create account</h2>
          <p className="auth-subheading">Fill in your details to get started.</p>

          <form onSubmit={handleRegister} className="auth-form">
            <Input label="User name" icon={User} value={username} onChange={(e) => setUsername(e.target.value)} error={usernameError} required />
            <Input label="Email address" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} required />
            <Input label="Password" type="password" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} error={passwordError} required />

            <div>
              <span className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Role</span>
              <div className="radio-grid">
                {['Admin', 'Employee', 'TL'].map((r) => (
                  <label
                    key={r}
                    className={`radio-label ${role === r ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={(e) => setRole(e.target.value)}
                      className="sr-only"
                      required
                    />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            {role === 'Employee' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                }}
              >
                <Info className="w-4 h-4 text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Employee Requirement:</strong> You must use the exact email pre-added by your Admin. Unregistered emails cannot sign up.
                </div>
              </div>
            )}

            <Button type="submit" className="btn-full" size="lg" loading={loading}>
              Create account
            </Button>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-light)', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/" className="auth-link">
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ClipboardCheck } from 'lucide-react';
import { login } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input } from '../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [roleError, setRoleError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    let valid = true;
    setEmailError('');
    setPasswordError('');
    setRoleError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email address is required.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    }

    if (!role) {
      setRoleError('Please select a role.');
      toast.warning('Please select a role');
      valid = false;
    }

    if (!valid) return;

    setLoading(true);

    try {
      const res = await login({
        email: trimmedEmail,
        password,
        role
      });

      if (res.data.success) {
        loginUser(res.data.user);
        if (res.data.user.role === "Admin") {
          navigate("/admin");
        } else if (res.data.user.role === "Employee") {
          navigate("/employee");
        } else if (res.data.user.role === "TL") {
          navigate("/TL");
        }
      } else {
        toast.error(res.data.message || "Invalid login");
      }
    } catch(err) {
      toast.error(
        err.response?.data?.message ||
        "Something went wrong"
      );
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
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <span className="auth-brand-title">Task Management</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="auth-brand-content"
        >
          <p className="auth-brand-subtitle">Team Access</p>
          <h1 className="auth-brand-heading">Everyone, in one place.</h1>
          <p className="auth-brand-description">
            Sign in to track attendance, manage your team, and keep work moving — whether you're an admin or on the floor.
          </p>
        </motion.div>
        <div></div>
        <div></div>
        {/* <div className="auth-brand-footer">© {new Date().getFullYear()} Task Management System</div> */}
      </aside>

     
      <div className="auth-form-panel">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="auth-card"
        >
          <p className="auth-tag">Sign in</p>
          <h2 className="auth-heading">Welcome back</h2>
          <p className="auth-subheading">Enter your details to access your dashboard.</p>

          <form onSubmit={handleLogin} className="auth-form">
            <div>
              <span className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Role</span>
              <div className="radio-grid">
                {['Admin', 'Employee','TL'].map((r) => (
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

            <Input
              label="Email address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              required
            />

            <div className="flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <label className="checkbox-label">
                <input type="checkbox" style={{ borderRadius: '4px', borderColor: 'var(--border)' }} />
                <span>Remember me</span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.25rem' }}>
              <Button type="submit" className="btn-full" size="lg" loading={loading}>
                Sign in
              </Button>
              <Button
                type="button"
                variant="outline"
                className="btn-full"
                onClick={() => {
                  setEmail('');
                  setPassword('');
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}


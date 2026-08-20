import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ClipboardCheck } from 'lucide-react';
import { login } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input, AuthBrandPanel, RoleRadioSelector } from '../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email address is required.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    }

    if (!role) {
      toast.warning('Please select a role');
      valid = false;
    }

    return valid ? trimmedEmail : null;
  };

  const redirectUserByRole = (userRole) => {
    if (userRole === "Cto") {
      navigate("/admin");
    }  else if (userRole === "Admin") {
      navigate("/admin2/employees");
    } else if (userRole === "Employee") {
      navigate("/employee");
    } else if (userRole === "TL") {
      navigate("/TL");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmedEmail = validateForm();
    if (!trimmedEmail) return;

    setLoading(true);

    try {
      const res = await login({
        email: trimmedEmail,
        password,
        role
      });

      if (res.data.success) {
        loginUser(res.data.user);
        redirectUserByRole(res.data.user.role);
      } else {
        toast.error(res.data.message || "Invalid login");
      }
    } catch(err) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <AuthBrandPanel
        icon={ClipboardCheck}
        subtitle="Team Access"
        heading="Everyone, in one place."
        description="Sign in to track attendance, manage your team, and keep work moving — whether you're an admin or on the floor."
      />

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
            <RoleRadioSelector role={role} onChange={(e) => setRole(e.target.value)} />

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


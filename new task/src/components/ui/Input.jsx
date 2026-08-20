import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { classNames } from '../../utils/helpers';

const Input = forwardRef(function Input(
  { label, error, className = '', containerClassName = '', icon: Icon, type, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  let currentType = type;
  if (isPassword) {
    if (showPassword) {
      currentType = 'text';
    } else {
      currentType = 'password';
    }
  }

  return (
    <div className={classNames('form-group', containerClassName)}>
      {label && (
        <label className="form-label">{label}</label>
      )}
      <div className="input-relative" style={{ position: 'relative' }}>
        {Icon && (
          <Icon className="input-icon" />
        )}
        <input
          ref={ref}
          type={currentType}
          className={classNames(
            'form-input',
            Icon ? 'has-icon' : '',
            isPassword ? 'pr-10' : '',
            error ? 'has-error' : '',
            className
          )}
          style={isPassword ? { paddingRight: '2.5rem' } : {}}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPassword((prev) => !prev);
            }}
            className="password-toggle-btn"
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #64748b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem',
              zIndex: 5,
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" style={{ width: '1rem', height: '1rem' }} />
            ) : (
              <Eye className="w-4 h-4" style={{ width: '1rem', height: '1rem' }} />
            )}
          </button>
        )}
      </div>
      {error && <span className="form-error" style={{ color: 'var(--danger, #ef4444)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
    </div>
  );
});

export default Input;

export function AuthBrandPanel({ icon: Icon, subtitle, heading, description }) {
  return (
    <aside className="auth-brand-panel">
      <div>
        <div className="auth-brand-glow-1" />
        <div className="auth-brand-glow-2" />
      </div>
      <div className="auth-brand-header">
        <div className="auth-brand-icon">
          <Icon className="w-5 h-5" />
        </div>
        <span className="auth-brand-title">Task Management</span>
      </div>
      <div className="auth-brand-content">
        <p className="auth-brand-subtitle">{subtitle}</p>
        <h1 className="auth-brand-heading">{heading}</h1>
        <p className="auth-brand-description">{description}</p>
      </div>
      <div className="auth-brand-footer">© {new Date().getFullYear()} Task Management System</div>
    </aside>
  );
}

export function RoleRadioSelector({ role, onChange, roles = ['Admin','Cto', 'Employee', 'TL'] }) {
  return (
    <div>
      <span className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Role</span>
      <div className="radio-grid">
        {roles.map((r) => (
          <label key={r} className={`radio-label ${role === r ? 'selected' : ''}`}>
            <input
              type="radio"
              name="role"
              value={r}
              checked={role === r}
              onChange={onChange}
              className="sr-only"
              required
            />
            {r}
          </label>
        ))}
      </div>
    </div>
  );
}



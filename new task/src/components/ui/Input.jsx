import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { classNames } from '../../utils/helpers';

const Input = forwardRef(function Input(
  { label, error, className = '', containerClassName = '', icon: Icon, type, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

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



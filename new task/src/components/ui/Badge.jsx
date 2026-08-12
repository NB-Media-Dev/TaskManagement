import { classNames } from '../../utils/helpers';

const variantStyles = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  neutral: 'badge-neutral',
};

export function statusVariant(status) {
  if (!status) return 'neutral';
  const s = String(status).toLowerCase();
  if (['present', 'active', 'completed', 'complete', 'admin'].includes(s)) return 'success';
  if (['absent', 'inactive', 'overdue'].includes(s)) return 'danger';
  if (['in progress', 'inprogress', 'incomplete'].includes(s) || s.includes('progress')) return 'primary';
  if (['pending', 'employee'].includes(s)) return 'warning';
  return 'neutral';
}

export default function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span
      className={classNames(
        'badge',
        variantStyles[variant],
        className
      )}
    >
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}


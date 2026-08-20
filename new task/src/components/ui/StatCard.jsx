import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { classNames } from '../../utils/helpers';

const variants = {
  primary: 'variant-primary',
  secondary: 'variant-secondary',
  success: 'variant-success',
  warning: 'variant-warning',
  danger: 'variant-danger',
  neutral: 'variant-neutral',
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = 'primary',
  onClick,
  className,
  style,
  isActive
}) {
  return (
    <motion.div
      whileHover={{ y: onClick ? -4 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={classNames('stat-card', isActive && 'active', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...(isActive ? {
          // borderColor: 'var(--primary, #6366f1)',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
          transform: 'translateY(-2px)'
        } : {}),
        ...style
      }}
    >
      <div className="stat-card-header">
        <div>
          <p className="stat-card-label">{label}</p>
          <p className="stat-card-value">{value ?? '0'}</p>
          {trend && (
            <div
              className={classNames(
                'stat-card-trend',
                trend === 'up' ? 'up' : 'down'
              )}
            >
              {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trendValue}
            </div>
          )}
        </div>
        {Icon && (
          <div className={classNames('stat-card-icon-badge', variants[variant])}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
}


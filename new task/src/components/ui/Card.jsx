import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { classNames, formatDate, getDueSoonTasks } from '../../utils/helpers';

export default function Card({ children, className = '', hover = false, onClick, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={classNames('ui-card', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function TaskDueReminderAlert({ tasks = [] }) {
  const dueSoonTasks = getDueSoonTasks(tasks);
  if (dueSoonTasks.length === 0) return null;

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  return (
    <div
      style={{
        backgroundColor: '#fefce8',
        border: '1px solid #fef08a',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        color: '#854d0e',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <AlertTriangle className="w-5 h-5" style={{ color: '#ca8a04', marginTop: '2px', flexShrink: 0 }} />
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#a16207' }}>
          Task Due Date Reminder Alert
        </h4>
        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.4' }}>
          You have <strong>{dueSoonTasks.length}</strong> task(s) with upcoming deadlines:
        </p>
        <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0, fontSize: '0.85rem' }}>
          {dueSoonTasks.map((t, idx) => {
            const deadlineVal = t.deadline || t.dline;
            const dDate = new Date(deadlineVal);
            dDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((dDate.getTime() - todayMidnight.getTime()) / (1000 * 3600 * 24));

            let dueLabel = `Due on ${formatDate(deadlineVal)}`;
            if (diffDays === 0) {
              dueLabel = <strong style={{ color: '#dc2626' }}>Today is the last date for this task</strong>;
            } else if (diffDays === 1) {
              dueLabel = 'Due tomorrow (1 day left)';
            } else if (diffDays > 1) {
              dueLabel = `Due on ${formatDate(deadlineVal)} (${diffDays} days left)`;
            }

            return (
              <li key={t.assign_id || t.id || idx} style={{ marginBottom: '0.2rem' }}>
                <strong>{t.task_name}</strong> — {dueLabel}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function PasswordChangeFormSection({ newPassword, setNewPassword, confirmPassword, setConfirmPassword, onSubmit, submitting, submitIcon: SubmitIcon }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
          {SubmitIcon && <SubmitIcon className="w-4 h-4" />} Save Password
        </Button>
      </div>
    </form>
  );
}


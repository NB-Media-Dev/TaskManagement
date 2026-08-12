import { useEffect, useState } from 'react';
import { ClipboardCheck, ClipboardList, Edit3, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, StatCard, EmptyState, Badge, TableSkeleton, Button } from '../../components/ui';
import { statusVariant } from '../../components/ui/Badge';
import { getTasks, getAttendance } from '../../services';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const userQuery = user?.email || user?.u_name || user?.email?.split('@')[0] || '';
      try {
        const [taskRes, attRes] = await Promise.all([
          getTasks({ id: userQuery }),
          getAttendance({ id: userQuery }),
        ]);

        if (taskRes.data.success) setTasks(taskRes.data.data);
        if (attRes.data.success) setAttendance(attRes.data.data);
      } catch (err) {
        console.error('Error fetching employee dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const totalHours = attendance.reduce((acc, curr) => {
    const hrs = Number.parseFloat(curr.workhours) || 0;
    return acc + hrs;
  }, 0);

  const completedTasksCount = tasks.filter((t) => (t.status || '').toLowerCase().includes('complete')).length;
  const inProgressTasksCount = tasks.filter((t) => {
    const s = (t.status || '').toLowerCase();
    return s.includes('progress') || s.includes('inprogress') || s.includes('incomplete');
  }).length;
  const pendingTasksCount = tasks.filter((t) => !t.status || t.status.toLowerCase().includes('pending')).length;

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const dueSoonTasks = tasks.filter((t) => {
    const isCompleted = (t.status || '').toLowerCase().includes('complete');
    if (isCompleted) return false;
    const deadlineVal = t.deadline || t.dline;
    if (!deadlineVal) return false;
    const dDate = new Date(deadlineVal);
    if (isNaN(dDate.getTime())) return false;
    dDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dDate.getTime() - todayMidnight.getTime()) / (1000 * 3600 * 24));
    // Include active tasks that have not crossed the due date (diffDays >= 0) and are due today or soon
    return diffDays >= 0 && diffDays <= 2;
  });

  const renderTasksGrid = () => {
    if (loading) return <TableSkeleton rows={3} cols={4} />;
    if (tasks.length === 0) {
      return (
        <EmptyState
          icon={ClipboardList}
          title="No tasks to show yet"
          description="Assigned tasks from your manager will appear here."
        />
      );
    }
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);

    return (
      <div className="task-grid">
        {tasks.map((t, i) => {
          const st = t.status || 'Pending';
          const cardKey = t.assign_id || t.id || `${t.task_name}-${i}`;
          const isCompleted = st.toLowerCase().includes('complete');
          const isOverdue = !isCompleted && t.deadline && (new Date(t.deadline).getTime() < todayTimestamp);

          return (
            <div key={cardKey} className="task-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
               <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', display: 'block' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="task-card-role">{t.roles || 'General'}</span>
                  <Badge variant={statusVariant(st)}>{st}</Badge>
                </div>
                <h4 className="task-card-title">{t.task_name}</h4>
                <p className="task-card-desc">{t.descriptions}</p>
                {t.remarks && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong> Your Remark:</strong> {t.remarks}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <div className="task-card-footer" style={{ marginBottom: '0.5rem' }}>
                  <span>Assigned {formatDate(t.assign_date)}</span>
                  <span style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
                    Due {formatDate(t.deadline)}
                  </span>
                </div>

                <Link to="/employee/tasks" style={{ textDecoration: 'none' }}>
                  <Button variant={isCompleted ? "success" : "outline"} size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    {isCompleted ? "Completed Task" : "Update Status Form"}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dashboard-space-y">
      <div>
        <h1 className="dashboard-header-title">Welcome back</h1>
        <p className="dashboard-header-sub">
          {user?.email ? `${user.email.split('@')[0]}, here's` : "Here's"} what's on your plate today.
        </p>
      </div>

      {dueSoonTasks.length > 0 && (
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
                  dueLabel = `Due tomorrow (1 day left)`;
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
      )}

      <div className="dashboard-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <StatCard
          label="Tasks Assigned"
          value={loading ? '...' : tasks.length.toString()}
          icon={ClipboardList}
          variant="secondary"
        />
        <StatCard
          label="Completed Tasks"
          value={loading ? '...' : completedTasksCount.toString()}
          icon={ClipboardCheck}
          variant="success"
        />
        <StatCard
          label="In Progress Tasks"
          value={loading ? '...' : inProgressTasksCount.toString()}
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          label="Pending Tasks"
          value={loading ? '...' : pendingTasksCount.toString()}
          icon={ClipboardList}
          variant="warning"
        />
      </div>

      <Card className="ui-card-p6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 className="dashboard-card-title">Your Assigned Tasks</h3>
          <Link to="/employee/tasks" className="auth-link" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Go to My Tasks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {renderTasksGrid()}
      </Card>
    </div>
  );
}

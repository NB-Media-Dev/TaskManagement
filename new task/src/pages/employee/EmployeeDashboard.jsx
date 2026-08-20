import { useEffect, useState } from 'react';
import { ClipboardCheck, ClipboardList, Edit3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, StatCard, EmptyState, Badge, TableSkeleton, Button, TaskDueReminderAlert } from '../../components/ui';
import { statusVariant } from '../../components/ui/Badge';
import { getTasks } from '../../services';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const userQuery = user?.email || user?.u_name || user?.email?.split('@')[0] || '';
      try {
        const taskRes = await getTasks({ id: userQuery });

        if (taskRes.data.success) setTasks(taskRes.data.data);
      } catch (err) {
        console.error('Error fetching employee dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const completedTasksCount = tasks.filter((t) => (t.status || '').toLowerCase().includes('complete')).length;
  const inProgressTasksCount = tasks.filter((t) => {
    const s = (t.status || '').toLowerCase();
    return s.includes('progress') || s.includes('inprogress') || s.includes('incomplete');
  }).length;
  const pendingTasksCount = tasks.filter((t) => !t.status || t.status.toLowerCase().includes('pending')).length;

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
                <p className="task-card-desc"><strong style={{color:'black',fontWeight:'600'}}>Description - </strong>{t.descriptions}</p> 
                {t.remarks && (
                  <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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

      <TaskDueReminderAlert tasks={tasks} />

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

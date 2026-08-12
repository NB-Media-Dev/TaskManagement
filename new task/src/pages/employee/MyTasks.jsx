import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ClipboardList, Edit3, CheckCircle2, Clock, LoaderCircleIcon, AlertTriangle } from 'lucide-react';
import { getTasks, updateTaskStatus } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, EmptyState, ErrorState, TableSkeleton, Badge, Button, Modal, Select } from '../../components/ui';
import { statusVariant } from '../../components/ui/Badge';

import { formatDate } from '../../utils/helpers';

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
  { value: 'In Progress', label: 'In Progress' },
];

export default function MyTasks() {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('Pending');
  const [updateDailyUpdate, setUpdateDailyUpdate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMine = async () => {
    setLoading(true);
    setError(false);
    try {
      const userSearchTerm = user?.email || user?.u_name || user?.username || '';
      const res = await getTasks({ id: userSearchTerm });
      
      if (res.data.success) {
        setTasks(res.data.data || []);
      } else {
        toast.error(res.data.message || 'Failed to load tasks');
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (tasks.length > 0) {
      const highlightId = location.state?.highlightTaskId;
      if (highlightId) {
        const found = tasks.find(t => String(t.assign_id || t.id) === String(highlightId));
        if (found) {
          handleOpenUpdateModal(found);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, location.state]);

  const handleOpenUpdateModal = (task) => {
    setSelectedTask(task);
    setUpdateStatus(task.status || 'Pending');
    setUpdateDailyUpdate(task.daily_update || task.remarks || '');
    setModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmitting(true);
    try {
      const res = await updateTaskStatus({
        assign_id: selectedTask.assign_id || selectedTask.id,
        task_name: selectedTask.task_name,
        assign_to: selectedTask.assign_to,
        status: updateStatus,
        remarks: updateDailyUpdate,
        daily_update: updateDailyUpdate,
        tl_reply: selectedTask.tl_reply || '',
      });

      if (res.data.success) {
        toast.success(`Task status updated to "${updateStatus}"`);
        setModalOpen(false);
        fetchMine();
      } else {
        toast.error(res.data.message || 'Failed to update task');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error updating task');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (st) => {
    const s = String(st || '').toLowerCase();
    if (s.includes('completed') || s.includes('complete')) return <CheckCircle2 className="w-4 h-4 text-success" />;
    if (s.includes('in progress')) return <LoaderCircleIcon className="w-4 h-4 text-primary" />;
    return <Clock className="w-4 h-4 text-warning" />;
  };

  const todayStr = new Date().toISOString().split('T')[0];
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
    return diffDays === 1;
  });

  return (
    <div className="dashboard-space-y">
      <div>
        <h1 className="dashboard-header-title">My Tasks</h1>
        <p className="dashboard-header-sub">Submit daily task updates, change task status, and view replies from your Team Lead.</p>
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
              You have <strong>{dueSoonTasks.length}</strong> task(s) approaching the due date (1 day left):
            </p>
            <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0, fontSize: '0.85rem' }}>
              {dueSoonTasks.map((t, idx) => (
                <li key={t.assign_id || t.id || idx}>
                  <strong>{t.task_name}</strong> — Due on {formatDate(t.deadline || t.dline)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Card className="ui-card-p6">
        {(() => {
          if (loading) return <TableSkeleton rows={4} cols={4} />;
          if (error) return <ErrorState onRetry={fetchMine} />;
          if (tasks.length === 0) return <EmptyState icon={ClipboardList} title="No tasks assigned yet" description="Tasks assigned to you will show up here." />;
          return (
            <div className="task-grid">
              {tasks.map((t, i) => {
                const currentStatus = t.status || 'Pending';
                const cardKey = t.assign_id || t.id || `${t.task_name}-${i}`;
                const isCompleted = currentStatus.toLowerCase().includes('complete');
                const isOverdue = !isCompleted && t.deadline && (String(t.deadline).split('T')[0] < todayStr);

                return (
                  <div key={cardKey} className="task-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', display: 'block' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="task-card-role">{t.roles || t.team_name || 'General'}</span>
                        <Badge variant={statusVariant(currentStatus)}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            {getStatusIcon(currentStatus)}
                            {currentStatus}
                          </span>
                        </Badge>
                      </div>

                      <h4 className="task-card-title">{t.task_name}</h4>
                      <p className="task-card-desc">{t.descriptions || 'No description provided.'}</p>

                      {isOverdue && (
                        <div style={{
                          background: '#fef2f2',
                          border: '1px solid #fca5a5',
                          color: '#dc2626',
                          padding: '0.4rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          marginTop: '0.5rem'
                        }}>
                          <AlertTriangle className="w-4 h-4" />
                          <span>Overdue Alert: Due date has passed!</span>
                        </div>
                      )}

                      {(t.daily_update || t.remarks) && (
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Your Update: </span>
                          <span>{t.daily_update || t.remarks}</span>
                        </div>
                      )}

                      {t.tl_reply && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600,  display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.2rem' }}>
                            TL Reply:
                          </span>
                           <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', display: 'block' }}>
                          <span >{t.tl_reply}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                      <div className="task-card-footer" style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned: {formatDate(t.assign_date)}</span>
                        {isCompleted ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                            Completed: {formatDate(t.completed_date || t.updated_at || t.assign_date)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 500 }}>
                            Due: {formatDate(t.deadline)}
                          </span>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleOpenUpdateModal(t)}
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Submit Daily Task Update
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Update Daily Task & Status" size="md">
        {selectedTask && (
          <form onSubmit={handleSaveStatus} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Task Name</div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{selectedTask.task_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Role: <strong>{selectedTask.roles}</strong> | Deadline: <strong>{formatDate(selectedTask.deadline)}</strong>
              </div>
            </div>

            {/* <Select
              label="Select Task Status"
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              options={STATUS_OPTIONS}
              required
            /> */}

            <div>
              <label htmlFor="daily-task-update" className="form-label" style={{ display: 'block', marginBottom: '0.375rem' }}>
                 Work Update
              </label>
              <textarea
                id="daily-task-update"
                value={updateDailyUpdate}
                onChange={(e) => setUpdateDailyUpdate(e.target.value)}
                placeholder="Describe what you accomplished today on this task (e.g., Finished module API endpoint, tested edge cases, pending design review)..."
                rows={4}
                className="form-textarea"
                required
              />
            </div>

            {selectedTask.tl_reply && (
              <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.08)', fontSize: '0.85rem' }}>
                <strong>Previous TL Reply:</strong> {selectedTask.tl_reply}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                <CheckCircle2 className="w-4 h-4" /> Save & Update
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}


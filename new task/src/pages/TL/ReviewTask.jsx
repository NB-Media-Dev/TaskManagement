import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, MessageSquare } from 'lucide-react';
import { getTasks, updateTaskStatus } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Button, Select } from '../../components/ui';
import { formatDate } from '../../utils/helpers';

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

export default function ReviewTask({ task: propTask, open: propOpen, onClose: propOnClose, onSaveSuccess: propOnSaveSuccess }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [task, setTask] = useState(propTask || null);
  const [loading, setLoading] = useState(!propTask && !!id);
  const [status, setStatus] = useState('Pending');
  const [tlReply, setTlReply] = useState('');
  const [performance, setPerformance] = useState('');
  const [submitting, setSubmitting] = useState(false);

 
  const isRoute = !!id && !propTask;

  useEffect(() => {
    if (propTask) {
      setTask(propTask);
      setStatus(propTask.status || 'Pending');
      setTlReply(propTask.tl_reply || '');
      setPerformance(propTask.performance || '');
    } else if (id) {
      fetchTaskDetails();
    }
  }, [id, propTask]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      if (res.data?.success && Array.isArray(res.data.data)) {
        const found = res.data.data.find(
          (t) => String(t.assign_id) === String(id) || String(t.id) === String(id)
        );
        if (found) {
          setTask(found);
          setStatus(found.status || 'Pending');
          setTlReply(found.tl_reply || '');
          setPerformance(found.performance || '');
        } else {
          toast.warning('Task not found or has been removed');
          navigate('/TL/AdminTasks');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else if (isRoute) {
      navigate('/TL/AdminTasks');
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
  };

  const handleReplyChange = (e) => {
    const val = e.target.value;
    if (val.length <= 200) {
      setTlReply(val);
    }
  };

  const isCompleted = status === 'Completed';

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!task) return;

    if (!status) {
      toast.warning('Task status is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateTaskStatus({
        assign_id: task.assign_id || task.id,
        task_name: task.task_name,
        assign_to: task.assign_to,
        status: status,
        remarks: task.remarks,
        daily_update: task.daily_update,
        tl_reply: status === 'Completed' && !tlReply ? (task.tl_reply || '') : tlReply,
        performance: performance,
      });

      if (res.data?.success) {
        toast.success(`Task review saved successfully! Status: "${status}"`);
        if (propOnSaveSuccess) {
          propOnSaveSuccess();
        }
        handleClose();
      } else {
        toast.error(res.data?.message || 'Failed to save review');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving task review');
    } finally {
      setSubmitting(false);
    }
  };

  const isModalVisible = isRoute ? true : propOpen;

  if (!isModalVisible) return null;

  return (
    <div 
      className="modal-fixed-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="modal-container review-task-modal"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'var(--card, #ffffff)',
          borderRadius: 'var(--radius-md, 12px)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
       
        <div 
          className="modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--card, #ffffff)',
          }}
        >
          <h2 
            className="modal-title"
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text, #0f172a)',
              margin: 0
            }}
          >
            Review Task & Reply to Employee
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="modal-close-btn"
            style={{
              background: 'none',
              border: 'none',
              padding: '0.35rem',
              cursor: 'pointer',
              color: 'var(--text-light, #64748b)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      
        <div 
          className="modal-body"
          style={{
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {loading ? (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-light)' }}>
              Loading task details...
            </div>
          ) : !task ? (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-light)' }}>
              Task details not available.
            </div>
          ) : (
            <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
         
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light, #64748b)', fontWeight: 500, display: 'block', marginBottom: '0.2rem' }}>
                  Assigned Employee
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text, #0f172a)' }}>
                  {task.assign_to}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text, #334155)', fontWeight: 600 }}>
                  Task: {task.task_name} | Deadline: {task.deadline ? formatDate(task.deadline) : 'N/A'}
                </div>
                {task.descriptions && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light, #475569)', margin: '1rem 0 0 0', whiteSpace: 'pre-wrap' }}>
                    <label htmlFor="" style={{color:'black',fontWeight:'500'}}>Description - </label>{task.descriptions}
                  </p>
                )}
              </div>

              
              <div 
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-sm, 8px)',
                  border: '1px solid var(--border, #e2e8f0)',
                  backgroundColor: 'var(--surface, #f8fafc)',
                }}
              >
                <div 
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--primary, #6366f1)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Employee Daily Report Update:
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text, #334155)', whiteSpace: 'pre-wrap', lineHeight: '1.45' }}>
                  {task.daily_update || task.remarks || 'Employee has not added a detailed update yet.'}
                </div>
              </div>
                   <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <label htmlFor="tl-reply-textarea" className="form-label" style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>
                    TL Reply to Employee
                  </label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light, #64748b)' }}>
                    {tlReply.length}/200
                  </span>
                </div>

                <textarea
                  id="tl-reply-textarea"
                  value={tlReply}
                  onChange={handleReplyChange}
                  maxLength={200}
                  disabled={isCompleted}
                  placeholder="Write feedback, instructions, or response for the employee..."
                  rows={4}
                  className="form-textarea"
                  style={{
                    width: '100%',
                    backgroundColor: isCompleted ? 'var(--bg-secondary, #f1f5f9)' : 'var(--card, #ffffff)',
                    cursor: isCompleted ? 'not-allowed' : 'text',
                    opacity: isCompleted ? 0.75 : 1,
                    borderColor: 'var(--border, #cbd5e1)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    color: 'var(--text, #0f172a)',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <label htmlFor="tl-performance-textarea" className="form-label" style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>
                    Performance Evaluation (Visible in Admin Reports Only)
                  </label>
                </div>
                <textarea
                  id="tl-performance-textarea"
                  value={performance}
                  onChange={(e) => setPerformance(e.target.value)}
                  placeholder="Write performance feedback for admin report (e.g. Excellent efficiency, completed accurately, needs improvement)..."
                  rows={3}
                  className="form-textarea"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--card, #ffffff)',
                    borderColor: 'var(--border, #cbd5e1)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    color: 'var(--text, #0f172a)',
                  }}
                />
              </div>
          
              <Select
                label="Update Task Status (TL Decision)"
                value={status}
                onChange={handleStatusChange}
                options={STATUS_OPTIONS}
                required
              />

          
             

    
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  paddingTop: '0.5rem',
                  marginTop: '0.25rem',
                  borderTop: '1px solid var(--border, #f1f5f9)'
                }}
              >
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  <MessageSquare className="w-4 h-4" /> Save Status & Reply
                </Button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}


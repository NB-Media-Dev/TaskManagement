import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar as CalendarIcon } from 'lucide-react';
import { assignTask, getEmployees } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, Button, Input, Select } from '../../components/ui';
import { formatEmpId, formatDate } from '../../utils/helpers';

export default function AssignTask() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [task, setTask] = useState('');
  const [assign, setAssign] = useState('');
  const [dline, setDline] = useState('');
  const [descrip, setDescrip] = useState('');
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const dateInputRef = useRef(null);

  const userName = user?.name || user?.email?.split('@')[0] || '';

  useEffect(() => {
    const fetchEmployeesList = async () => {
      try {
        const res = await getEmployees();
        if (res.data.success) {
          setAllEmployees(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };
    fetchEmployeesList();
  }, []);

  const tlRecord = allEmployees.find(
    (e) => e.emp_email === user?.email || e.emp_name === userName
  );
  const tlDept = tlRecord?.emp_role || user?.emp_role || 'General';

  const teamMembers = allEmployees.filter((emp) => {
    if (emp.emp_email === user?.email || emp.emp_name === userName) return false;
    if (emp.team_lead && (emp.team_lead === userName || emp.team_lead === user?.email)) return true;
    if (tlDept && tlDept !== 'General') {
      return emp.emp_role?.toLowerCase() === tlDept.toLowerCase();
    }
    return true;
  });

  const assignOptions = teamMembers.map((emp) => ({
    value: emp.emp_name,
    label: `${emp.emp_name} (${formatEmpId(emp.emp_id)} - ${emp.emp_role || 'Employee'})`,
  }));

  const getAssignPlaceholder = () => {
    if (assignOptions.length === 0) {
      return `No team members found for ${tlDept}`;
    }
    return `Select Team Member (${tlDept})`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!assign) {
      toast.warning('Please select a team member to assign');
      return;
    }
    if (!dline) {
      toast.warning('Please select a deadline date');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (dline < todayStr) {
      toast.warning('Deadline cannot be a past date. Please select today or a future date.');
      return;
    }
    setLoading(true);
    try {
      const res = await assignTask({
        task,
        role: tlDept,
        assign,
        dline,
        descrip,
        team_name: tlDept
      });
      if (res.data.success) {
        toast.success('Task assigned successfully');
        navigate('/TL');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const todayMinDate = new Date().toISOString().split('T')[0];

  return (
    <div className="dashboard-space-y" style={{ maxWidth: '48rem' }}>
      <div>
        <h1 className="dashboard-header-title">Assign Task</h1>
        <p className="dashboard-header-sub">
          Assign a new task to members of your <strong>{tlDept}</strong> team.
        </p>
      </div>

      <Card className="ui-card-p6">
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="employee-form-grid">
            <Input label="Task Name" value={task} onChange={(e) => setTask(e.target.value)} required />
            <Select
              label="Assigned To (Team Member)"
              value={assign}
              onChange={(e) => setAssign(e.target.value)}
              options={assignOptions}
              placeholder={getAssignPlaceholder()}
              disabled={assignOptions.length === 0}
              required
            />
            
            
            <div style={{ position: 'relative' }}>
              <Input
                label="Deadline Date "
                type="text"
                value={dline ? formatDate(dline) : ''}
                placeholder="DD/MM/YYYY"
                readOnly
                required
                onClick={() => dateInputRef.current?.showPicker?.()}
                style={{ cursor: 'pointer', paddingRight: '2.5rem' }}
              />
              <CalendarIcon 
                style={{ position: 'absolute', right: '0.75rem', top: '2.25rem', width: '1.2rem', height: '1.2rem', color: 'var(--text-secondary, #6b7280)', pointerEvents: 'none' }} 
              />
              
             
              <input
                ref={dateInputRef}
                type="date"
                min={todayMinDate}
                value={dline}
                onChange={(e) => setDline(e.target.value)}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '1px'
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-description" className="form-label" style={{ display: 'block', marginBottom: '0.375rem' }}>Description</label>
            <textarea
              id="task-description"
              value={descrip}
              onChange={(e) => setDescrip(e.target.value)}
              rows={4}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={() => navigate('/TL')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={assignOptions.length === 0}>
              <FileText className="w-4 h-4" /> Assign Task
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
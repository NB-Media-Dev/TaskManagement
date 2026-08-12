import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { assignTask, getEmployees } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Card, Button, Input, Select } from '../../components/ui';
import { ROLE_OPTIONS, formatEmpId, formatDate } from '../../utils/helpers';

export default function AssignTask() {
  const navigate = useNavigate();
  const toast = useToast();

  const [task, setTask] = useState('');
  const [role, setRole] = useState('');
  const [assign, setAssign] = useState('');
  const [dline, setDline] = useState('');
  const [descrip, setDescrip] = useState('');
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployeesList = async () => {
      try {
        const res = await getEmployees();
        if (res.data?.success && Array.isArray(res.data.data)) {
          setAllEmployees(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching employees list:', err);
      }
    };
    fetchEmployeesList();
  }, []);

  const roleEmployees = allEmployees.filter((emp) =>
    role ? emp.emp_role?.toLowerCase() === role.toLowerCase() : true
  );

  const assignOptions = roleEmployees.map((emp) => ({
    value: emp.emp_name,
    label: `${emp.emp_name} (${formatEmpId(emp.emp_id)})`,
  }));

  const getAssignPlaceholder = () => {
    if (!role) {
      return 'Select role first';
    }
    if (assignOptions.length === 0) {
      return `No employees registered as ${role}`;
    }
    return `Select ${role}`;
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setAssign('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!role) {
      toast.warning('Please select a role');
      return;
    }
    if (!assign) {
      toast.warning('Please select an employee to assign');
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
      const res = await assignTask({ task, role, assign, dline, descrip });
      if (res.data.success) {
        toast.success('Task assigned successfully');
        navigate('/admin/tasks');
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
        <p className="dashboard-header-sub">Create and assign a new task to your team.</p>
      </div>

      <Card className="ui-card-p6">
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="employee-form-grid">
            <Input label="Task Name" value={task} onChange={(e) => setTask(e.target.value)} required />
            <Select
              label="Role"
              value={role}
              onChange={handleRoleChange}
              options={ROLE_OPTIONS}
              placeholder="Select role"
              required
            />
            <Select
              label="Assigned To"
              value={assign}
              onChange={(e) => setAssign(e.target.value)}
              options={assignOptions}
              placeholder={getAssignPlaceholder()}
              disabled={!role || assignOptions.length === 0}
              required
            />
            <div>
              <Input
                label="Deadline Date (DD/MM/YYYY)"
                type="date"
                min={todayMinDate}
                value={dline}
                onChange={(e) => setDline(e.target.value)}
                placeholder="dd/mm/yyyy"
                required
              />
              {dline && (
                <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600, marginTop: "0.25rem", display: "inline-block" }}>
                  Selected Deadline: {formatDate(dline)} (DD/MM/YYYY)
                </span>
              )}
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
            <Button type="button" variant="outline" onClick={() => navigate('/admin/tasks')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <FileText className="w-4 h-4" /> Assign Task
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}



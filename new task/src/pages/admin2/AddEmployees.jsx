import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { addEmployee, getNextEmpId, getEmployees } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Card, Button, Input, Select } from '../../components/ui';
import { ROLE_OPTIONS, validateName, validateEmail, formatEmpId, validateEmployeeRoleAndPassword } from '../../utils/helpers';

export function AddEmployeeForm({ isModal = false, onClose, onSuccess }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [existingEmployees, setExistingEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const computeFallbackId = (empList) => {
    let maxNum = 100;
    empList.forEach((emp) => {
      const empIdStr = String(emp.emp_id || emp.id || '');
      const match = /\d+/.exec(empIdStr);
      if (match) {
        const num = Number.parseInt(match[0], 10);
        if (!Number.isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    return formatEmpId(maxNum + 1);
  };

  const fetchNextId = async () => {
    let generatedId = '';
    try {
      const res = await getNextEmpId();
      if (res?.data?.success && res.data.nextId) {
        generatedId = formatEmpId(res.data.nextId);
        setId(generatedId);
      }
    } catch (err) {
      console.warn('Endpoint /next-emp-id unavailable:', err);
    }

    try {
      const res = await getEmployees();
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setExistingEmployees(res.data.data);
        if (!generatedId) {
          setId(computeFallbackId(res.data.data));
        }
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    setName('');
    setEmail('');
    setRole('');
    setPassword('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    fetchNextId();
  }, []);

  const runRegistrationChecks = () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');

    const nameCheck = validateName(name, 'Employee Name');
    if (!nameCheck.valid) {
      setNameError(nameCheck.message);
      toast.warning(nameCheck.message);
      return { valid: false };
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setEmailError(emailCheck.message);
      toast.warning(emailCheck.message);
      return { valid: false };
    }

    const normalizedEmail = emailCheck.value;
    const isDuplicate = existingEmployees.some(
      (emp) => emp.emp_email?.trim().toLowerCase() === normalizedEmail
    );
    if (isDuplicate) {
      const msg = 'An employee with this email address already exists.';
      setEmailError(msg);
      toast.error(msg);
      return { valid: false };
    }

    const rolePassCheck = validateEmployeeRoleAndPassword(role, password);
    if (!rolePassCheck.valid) {
      if (rolePassCheck.field === 'password') setPasswordError(rolePassCheck.message);
      toast.warning(rolePassCheck.message);
      return { valid: false };
    }

    return {
      valid: true,
      data: {
        id: formatEmpId(id),
        name: nameCheck.value,
        email: normalizedEmail,
        phone,
        gender,
        role,
        password,
      },
    };
  };

  const handlePostSubmitSuccess = (employeeName) => {
    toast.success(`Employee ${employeeName} added successfully`);
    if (isModal) {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setGender('');
      setRole('');
      setPassword('');
      fetchNextId();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const check = runRegistrationChecks();
    if (!check.valid) return;

    setLoading(true);
    try {
      const res = await addEmployee(check.data);
      if (res.data?.success) {
        handlePostSubmitSuccess(check.data.name);
      } else {
        const errorMsgStr = res.data?.message || res.data?.error || '';
        if (errorMsgStr.toLowerCase().includes('already exists')) {
          setEmailError(errorMsgStr);
        }
        toast.error(errorMsgStr || 'An error Occurred');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error adding employee');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) setEmailError('');
    if (!val.trim()) return;

    const norm = val.trim().toLowerCase();
    const exists = existingEmployees.some(
      (emp) => emp.emp_email?.trim().toLowerCase() === norm
    );
    if (exists) {
      setEmailError('An employee with this email address already exists.');
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="employee-form-grid">
        <Input label="Employee ID" value={id} readOnly disabled required />
        <Input label="Employee Name" value={name} onChange={(e) => setName(e.target.value)} error={nameError} required />
        <Input label="Employee Email" type="email" value={email} onChange={handleEmailChange} error={emailError} required />
        <Select label="Employee Role" value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} placeholder="Select role" required />
        <div style={isModal ? { gridColumn: '1/-1' } : undefined}>
          <Input
            label="Employee Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isModal ? "Set initial password" : "Set password"}
            error={passwordError}
            required
          />
        </div>
      </div>

      <div className={isModal ? "modal-footer" : undefined} style={!isModal ? { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' } : undefined}>
        <Button
          type="button"
          variant="outline"
          onClick={isModal ? onClose : () => navigate('/admin/employees')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          <UserPlus className="w-4 h-4" /> Save Employee
        </Button>
      </div>
    </form>
  );
}

export default function AddEmployees() {
  return (
    <div className="dashboard-space-y" style={{ maxWidth: '48rem' }}>
      <div>
        <h1 className="dashboard-header-title">Add Employee</h1>
        <p className="dashboard-header-sub">Fill in the details to add a new team member and set their password.</p>
      </div>

      <Card className="ui-card-p6">
        <AddEmployeeForm />
      </Card>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { addEmployee, getNextEmpId, getEmployees } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Card, Button, Input, Select } from '../../components/ui';
import { ROLE_OPTIONS, validateName, validateEmail, validatePassword, formatEmpId } from '../../utils/helpers';

export default function AddEmployee() {
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

  const fetchNextId = async () => {
    let generatedId = '';
    try {
      const res = await getNextEmpId();
      if (res.data && res.data.success && res.data.nextId) {
        generatedId = formatEmpId(res.data.nextId);
        setId(generatedId);
      }
    } catch (err) {
      console.warn('Endpoint /next-emp-id unavailable:', err);
    }

    try {
      const res = await getEmployees();
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setExistingEmployees(res.data.data);
        if (!generatedId) {
          let maxNum = 100;
          res.data.data.forEach((emp) => {
            const empIdStr = String(emp.emp_id || emp.id || '');
            const match = empIdStr.match(/\d+/);
            if (match) {
              const num = parseInt(match[0], 10);
              if (!isNaN(num) && num > maxNum) {
                maxNum = num;
              }
            }
          });
          setId(formatEmpId(maxNum + 1));
        }
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchNextId();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    setNameError('');
    setEmailError('');
    setPasswordError('');

    const nameCheck = validateName(name, 'Employee Name');
    if (!nameCheck.valid) {
      setNameError(nameCheck.message);
      toast.warning(nameCheck.message);
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setEmailError(emailCheck.message);
      toast.warning(emailCheck.message);
      return;
    }

    
    const normalizedEmail = emailCheck.value;
    const isDuplicate = existingEmployees.some(
      (emp) => emp.emp_email && emp.emp_email.trim().toLowerCase() === normalizedEmail
    );
    if (isDuplicate) {
      const msg = 'An employee with this email address already exists.';
      setEmailError(msg);
      toast.error(msg);
      return;
    }

    if (!role) {
      toast.warning('Please select an Employee Role');
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setPasswordError(passCheck.message);
      toast.warning(passCheck.message);
      return;
    }

    setLoading(true);
    try {
      const res = await addEmployee({
        id: formatEmpId(id),
        name: nameCheck.value,
        email: normalizedEmail,
        phone,
        gender,
        role,
        password
      });
      if (res.data.success) {
        toast.success(`Employee ${nameCheck.value} added successfully`);
        setName('');
        setEmail('');
        setPhone('');
        setGender('');
        setRole('');
        setPassword('');
        fetchNextId();
      } else {
        if (res.data.message?.toLowerCase().includes('already exists')) {
          setEmailError(res.data.message);
        }
        toast.error(res.data.message);
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
    if (val.trim()) {
      const norm = val.trim().toLowerCase();
      const exists = existingEmployees.some(
        (emp) => emp.emp_email && emp.emp_email.trim().toLowerCase() === norm
      );
      if (exists) {
        setEmailError('An employee with this email address already exists.');
      }
    }
  };

  const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="dashboard-space-y" style={{ maxWidth: '48rem' }}>
      <div>
        <h1 className="dashboard-header-title">Add Employee</h1>
        <p className="dashboard-header-sub">Fill in the details to add a new team member and set their password.</p>
      </div>

      <Card className="ui-card-p6">
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="employee-form-grid">
            <Input label="Employee ID" value={id} readOnly disabled required />
            <Input label="Employee Name" value={name} onChange={(e) => setName(e.target.value)} error={nameError} required />
            <Input label="Employee Email" type="email" value={email} onChange={handleEmailChange} error={emailError} required />
            {/* <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" /> */}
            {/* <Select label="Gender" value={gender} onChange={(e) => setGender(e.target.value)} options={GENDER_OPTIONS} placeholder="Select gender" /> */}
            <Select label="Employee Role" value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} placeholder="Select role" required />
              
            <Input
              label="Employee Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set password"
              error={passwordError}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/employees')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <UserPlus className="w-4 h-4" /> Save Employee
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

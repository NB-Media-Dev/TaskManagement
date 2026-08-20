import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getEmployees, getTasks } from '../services';

export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

export function getInitial(name) {
  return (name || 'U').trim().charAt(0).toUpperCase();
}

export function formatCurrency(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function validateName(name, fieldName = 'Name') {
  if (!name || String(name).trim() === '') {
    return { valid: false, message: `${fieldName} is required and cannot be empty or only spaces.` };
  }
  const trimmed = String(name).trim();
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { valid: false, message: `${fieldName} should contain only letters and spaces.` };
  }
  return { valid: true, value: trimmed, message: '' };
}

export function validateEmail(email) {
  if (!email || String(email).trim() === '') {
    return { valid: false, message: 'Email address is required.' };
  }
  const trimmed = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return { valid: true, value: trimmed, message: '' };
}

export function validatePassword(password) {
  if (!password || String(password).trim() === '') {
    return { valid: false, message: 'Password is required' };
  }
  const str = String(password);
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  
  if (!passRegex.test(str)) {
    return {
      valid: false,
      message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
    };
  }
  return { valid: true, message: '' };
}

export function formatDate(dateString) {
  if (!dateString || dateString === '-' || dateString === 'N/A') return '-';
  const str = String(dateString).trim();
  
  // Handle YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [year, month, day] = str.split('T')[0].split(' ')[0].split('-');
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Handle MM/DD/YYYY or DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [p1, p2, year] = str.split('/');
    // If the first part is > 12, it's already in DD/MM format
    if (Number.parseInt(p1, 10) > 12) {
      return `${p1.padStart(2, '0')}/${p2.padStart(2, '0')}/${year}`;
    }
    // Otherwise, convert MM/DD/YYYY to DD/MM/YYYY
    return `${p2.padStart(2, '0')}/${p1.padStart(2, '0')}/${year}`;
  }

  // Fallback for other parseable date strings
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) {
    return str;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export const ROLE_OPTIONS = [
  { value: 'Developer', label: 'Developer' },
  { value: 'Tester', label: 'Tester' },
  { value: 'Designer', label: 'Designer' },
  { value: 'Content Writer', label: 'Content Writer' },
  { value: 'Devops', label: 'Devops' },
];

export function formatEmpId(val) {
  if (!val) return 'EMP-101';
  const str = String(val).trim();
  const upper = str.toUpperCase();
  if (upper.startsWith('EMP')) {
    const numPart = upper.replace(/^EMP-?/, '');
    const num = Number.parseInt(numPart, 10);
    if (!Number.isNaN(num)) {
      const finalNum = num < 100 ? num + 100 : num;
      return `EMP-${String(finalNum).padStart(3, '0')}`;
    }
    return str;
  }
  const match = /\d+/.exec(str);
  if (match) {
    const num = Number.parseInt(match[0], 10);
    const finalNum = num < 100 ? num + 100 : num;
    return `EMP-${String(finalNum).padStart(3, '0')}`;
  }
  return `EMP-${str}`;
}

export function filterTeamMembers(employees = [], user = {}) {
  const userName = user?.name || user?.email?.split('@')[0] || '';
  const tlRecord = employees.find(
    (e) => e.emp_email === user?.email || e.emp_name === userName
  );
  const tlDept = tlRecord?.emp_role || user?.emp_role || '';

  return employees.filter((emp) => {
    if (emp.emp_email === user?.email || emp.emp_name === userName) return false;
    if (emp.team_lead && (emp.team_lead === userName || emp.team_lead === user?.email)) return true;
    if (tlDept && tlDept !== 'General' && emp.emp_role?.toLowerCase() === tlDept.toLowerCase()) return true;
    if (!emp.team_lead && (!tlDept || tlDept === 'General')) return true;
    return false;
  });
}

export function filterTeamTasks(tasks = [], teamMembers = []) {
  return tasks.filter((task) =>
    teamMembers.some(
      (m) => m.emp_name === task.assign_to || String(m.emp_id) === String(task.assign_to)
    )
  );
}

export function validatePasswordForm(newPassword, confirmPassword) {
  if (!newPassword || !confirmPassword) {
    return { valid: false, message: 'Please fill in all password fields', type: 'warning' };
  }
  if (newPassword !== confirmPassword) {
    return { valid: false, message: 'New password and confirm password do not match', type: 'error' };
  }
  const passCheck = validatePassword(newPassword);
  if (!passCheck.valid) {
    return { valid: false, message: passCheck.message, type: 'warning' };
  }
  return { valid: true };
}

export function validateEmployeeRoleAndPassword(role, password) {
  if (!role) {
    return { valid: false, message: 'Please select an Employee Role', field: 'role' };
  }
  const passCheck = validatePassword(password);
  if (!passCheck.valid) {
    return { valid: false, message: passCheck.message, field: 'password' };
  }
  return { valid: true };
}

export async function executePasswordChange({ email, newPassword, confirmPassword, toast, setSubmitting, apiChangePassword, onSuccess }) {
  const passCheck = validatePasswordForm(newPassword, confirmPassword);
  if (!passCheck.valid) {
    if (passCheck.type === 'error') toast.error(passCheck.message);
    else toast.warning(passCheck.message);
    return false;
  }

  setSubmitting(true);
  try {
    const res = await apiChangePassword({
      email,
      newPassword,
    });

    if (res.data.success) {
      toast.success(res.data.message || 'Password updated successfully');
      if (onSuccess) onSuccess();
      return true;
    }
    toast.error(res.data.message || 'Failed to update password');
    return false;
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Server error');
    return false;
  } finally {
    setSubmitting(false);
  }
}

export function getDueSoonTasks(tasks = []) {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  return tasks.filter((t) => {
    const isCompleted = (t.status || '').toLowerCase().includes('complete');
    if (isCompleted) return false;
    const deadlineVal = t.deadline || t.dline;
    if (!deadlineVal) return false;
    const dDate = new Date(deadlineVal);
    if (Number.isNaN(dDate.getTime())) return false;
    dDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dDate.getTime() - todayMidnight.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 2;
  });
}

export function matchesTaskStatus(task, statusFilter) {
  if (statusFilter === 'All') return true;
  if (statusFilter === 'Pending') return !task.status || task.status.toLowerCase().includes('pending');
  if (statusFilter === 'In Progress' || statusFilter === 'Incomplete') {
    const s = task.status?.toLowerCase() || '';
    return s.includes('progress') || s.includes('inprogress') || s.includes('incomplete');
  }
  if (statusFilter === 'Completed') return task.status?.toLowerCase().includes('complete');
  return true;
}

export function filterTlTeamTasks(tasks = [], teamMembers = [], tlDept = '') {
  return tasks.filter((task) => {
    const isTeamMemberTask = teamMembers.some(
      (m) => m.emp_name === task.assign_to || String(m.emp_id) === String(task.assign_to)
    );
    if (isTeamMemberTask) return true;

    if (tlDept && tlDept !== 'General') {
      if (task.roles?.toLowerCase() === tlDept.toLowerCase()) return true;
      if (task.team_name?.toLowerCase() === tlDept.toLowerCase()) return true;
    }

    return false;
  });
}

export function matchesPeriod(task, periodFilter, today = new Date()) {
  if (periodFilter === "All") return true;
  const taskDate = new Date(task.assign_date || task.created_at || today);
  if (periodFilter === "Daily") return taskDate.toDateString() === today.toDateString();
  if (periodFilter === "Weekly") {
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return taskDate >= weekAgo;
  }
  if (periodFilter === "Monthly") {
    return taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear();
  }
  return true;
}

export function useTLData() {
  const { user } = useAuth();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTLData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, taskRes] = await Promise.all([
        getEmployees().catch(() => ({ data: { success: false } })),
        getTasks().catch(() => ({ data: { success: false } }))
      ]);

      if (empRes.data?.success) setEmployees(empRes.data.data);
      if (taskRes.data?.success) setTasks(taskRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTLData();
  }, [fetchTLData]);

  const userName = user?.name || user?.email?.split("@")[0] || "";
  const tlRecord = employees.find(
    (e) => e.emp_email === user?.email || e.emp_name === userName
  );
  const tlDept = tlRecord?.emp_role || user?.emp_role || "";

  const teamMembers = filterTeamMembers(employees, user);
  const teamTasks = filterTlTeamTasks(tasks, teamMembers, tlDept);

  return {
    employees,
    tasks,
    loading,
    teamMembers,
    teamTasks,
    fetchTLData
  };
}
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  
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
    if (parseInt(p1, 10) > 12) {
      return `${p1.padStart(2, '0')}/${p2.padStart(2, '0')}/${year}`;
    }
    // Otherwise, convert MM/DD/YYYY to DD/MM/YYYY
    return `${p2.padStart(2, '0')}/${p1.padStart(2, '0')}/${year}`;
  }

  // Fallback for other parseable date strings
  const d = new Date(str);
  if (isNaN(d.getTime())) {
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
    const num = parseInt(numPart, 10);
    if (!isNaN(num)) {
      const finalNum = num < 100 ? num + 100 : num;
      return `EMP-${String(finalNum).padStart(3, '0')}`;
    }
    return str;
  }
  const match = str.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    const finalNum = num < 100 ? num + 100 : num;
    return `EMP-${String(finalNum).padStart(3, '0')}`;
  }
  return `EMP-${str}`;
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Pencil, Users, LucideWorkflow } from 'lucide-react';
import { getEmployees, deleteEmployee, updateEmployee, makeTL, undoTL } from '../../services';

import { useToast } from '../../context/ToastContext';
import {
  Card,
  Button,
  SearchBar,
  Badge,
  EmptyState,
  ErrorState,
  TableSkeleton,
  ConfirmDialog,
  StatCard,
} from '../../components/ui';
import EditEmployeeModal from './EditEmployeeModal';
import AddEmployeeModal from './AddEmployeeModal';
import { formatCurrency, formatEmpId } from '../../utils/helpers';

export default function AdminEmployees() {
  const navigate = useNavigate();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedId, setSelectedId] = useState('');
  const [searchId, setSearchId] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [salary, setSalary] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [Position, setPosition] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previousRoles, setPreviousRoles] = useState({});
  
  const [view, setView] = useState("Choose");

  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [selectedTeam, setSelectedTeam] = useState("");

  const fetchEmployees = async (id) => {
    setLoading(true);
    setError(false);
    try {
      const res = await getEmployees(id);
      if (res.data.success) {
        setEmployees(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(true);
      toast.error('Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchEmployee = async () => {
    try {
      const res = await getEmployees(searchId);
      if (res.data.success) setEmployees(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Search error');
    }
  };

   const handleDelete = async (targetId) => {
    const idToDelete = (typeof targetId === 'string' || typeof targetId === 'number') ? targetId : selectedId;
    if (!idToDelete) {
      toast.warning('No employee selected');
      return;
    }
    setDeleting(true);
    try {
      const res = await deleteEmployee(idToDelete);
      if (res.data.success) {
        toast.success(res.data.message);
        setEmployees((prev) => prev.filter((emp) => String(emp.emp_id || emp.id) !== String(idToDelete)));
        if (idToDelete === selectedId) {
          setSelectedId('');
        }
      } else {
        toast.error(res.data.message || 'Failed to delete employee');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Server error');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };
const openEditModal = (emp) => {
  const empId = emp.emp_id || emp.id;
  setSelectedId(empId);

  setName(emp.emp_name || '');
  setEmail(emp.emp_email || '');
  setPhone(emp.emp_phone || '');
  setGender(emp.emp_gender || '');
  setSalary(emp.emp_salary || '');
  setRole(emp.emp_role || 'Employee');
  setPosition(emp.position || 'Employee');
  setPassword("");

  setShowEdit(true);
};
  const handleUpdate = async () => {
    if (!selectedId) {
      toast.warning('No employee selected for update');
      return;
    }
    if (password && password.trim() !== "") {
      const passCheck = validatePassword(password);
      if (!passCheck.valid) {
        toast.warning(passCheck.message);
        return;
      }
    }
    setSaving(true);
    try {
      const res = await updateEmployee(selectedId, { name, email, phone, gender, salary, role, position: Position, password: password.trim() === "" ? "" : password });
      if (res.data.success) {
        toast.success(res.data.message);
        const updated = await getEmployees();
        if (updated.data && updated.data.data) {
          setEmployees(updated.data.data);
        }
        setShowEdit(false);
      } else {
        toast.error(res.data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Server error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTL = async (emp) => {
    setSaving(true);
    try {
      const res = emp.position === "TL" ? await undoTL(emp.emp_id) : await makeTL(emp.emp_id);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchEmployees();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Position update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePromoteToTL = handleToggleTL;

  const totalEmployees = employees.length;
  const uniqueRolesCount = new Set(employees.map((e) => e.emp_role).filter(Boolean)).size;
  const totalSalary = employees.reduce((acc, curr) => acc + (Number.parseFloat(curr.emp_salary) || 0), 0);

const teams = [...new Set(employees.map(emp => emp.emp_role).filter(Boolean))];

const sortedEmployees = [...employees].sort((a, b) => {
  const numA = parseInt(String(a.emp_id || '').replace(/\D/g, ''), 10) || 0;
  const numB = parseInt(String(b.emp_id || '').replace(/\D/g, ''), 10) || 0;
  return numA - numB;
});

const filteredEmployees = sortedEmployees.filter((emp) => {
  if (view === "Employee" && selectedEmployee) {
    return emp.emp_name === selectedEmployee;
  }

  if (view === "Team" && selectedTeam) {
    return emp.emp_role === selectedTeam;
  }

  return true;
});
  return (
    <div className="dashboard-space-y">
      <div className="employee-action-row">
        <div>
          <h1 className="dashboard-header-title">Employees</h1>
          <p className="dashboard-header-sub">Manage employees and account passwords</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      <div className="dashboard-grid-3">
        <StatCard
          label="Total Employees"
          value={loading ? '...' : totalEmployees.toString()}
          icon={Users}
          variant="primary"
          // trend="up"
          // trendValue={`${totalEmployees} in system`}
        />
        <StatCard
          label="Active Roles"
          value={loading ? '...' : `${uniqueRolesCount} Roles`}
          icon={LucideWorkflow}
          variant="secondary"
          // trend="up"
          // trendValue="Departments"
        />
        
      </div>

      {/* <div className="employee-action-buttons">
        <Button onClick={() => navigate('/admin/add-employee')}>
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (!selectedId) {
              toast.warning('Please select an employee');
              return;
            }
            setConfirmDelete(true);
          }}
        >
          <Trash2 className="w-4 h-4" /> Delete Employee
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (!selectedId) {
              toast.warning('Select employee first');
              return;
            }
            setShowEdit(true);
          }}
        >
          <Pencil className="w-4 h-4" /> Edit 
        </Button>
      </div> */}

      <Card className="ui-card-p6">
        <div className="employee-filter-bar">
          <h3 className="dashboard-card-title">Records</h3>
          <SearchBar
            value={searchId}
            onChange={setSearchId}
            onSubmit={searchEmployee}
            placeholder="Search the employee"
          />
            <select
              value={view}
              onChange={(e) => {
                setView(e.target.value);
                setSelectedEmployee("");
                setSelectedTeam("");
              }}
              className="form-input"
              style={{
                flex: "1 1 150px",
                minWidth: "130px",
                maxWidth: "100%",
                padding: "8px",
                borderRadius: "6px",
              }}
            >
              <option value="">Choose Type</option>
              <option value="Employee">Employee Wise</option>
              <option value="Team">Team Wise</option>
            </select>
            {view === "Employee" && (
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="form-input"
                style={{
                  flex: "1 1 150px",
                  minWidth: "130px",
                  maxWidth: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                }}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.emp_id} value={emp.emp_name}>
                    {emp.emp_name}
                  </option>
                ))}
              </select>
            )}
            {view === "Team" && (
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="form-input"
                style={{
                  flex: "1 1 150px",
                  minWidth: "130px",
                  maxWidth: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                }}
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            )}

        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={9} />
        ) : error ? (
          <ErrorState onRetry={() => fetchEmployees()} />
        ) : employees.length === 0 ? (
          <EmptyState icon={Users} title="No employee records found" description="Try adding a new employee or adjusting your search." />
        ) : (
          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr className="table-header">
                  <th className="table-cell">ID</th>
                  <th className="table-cell">Name</th>
                  <th className="table-cell">Email</th>
                  {/* <th className="table-cell">Phone</th>
                  <th className="table-cell">Gender</th> */}
                  {/* <th className="table-cell">Salary</th> */}
                  <th className="table-cell">Role</th>
                  <th className="table-cell">Position</th>
                  <th className="table-cell">Password</th>
                  <th className="table-cell">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, index) => (
                  <tr key={emp.emp_id ? `${emp.emp_id}-${index}` : index} className="table-row">
                    <td className="table-cell font-medium">{formatEmpId(emp.emp_id)}</td>
                    <td className="table-cell">{emp.emp_name}</td>
                    <td className="table-cell text-muted">{emp.emp_email}</td>
                    {/* <td className="table-cell text-muted">{emp.emp_phone}</td>
                    <td className="table-cell">{emp.emp_gender}</td> */}
                    {/* <td className="table-cell">{formatCurrency(emp.emp_salary)}</td> */}
                    <td className="table-cell">
                      <Badge variant="primary">{emp.emp_role}</Badge>
                    </td>
                    <td className="table-cell text-muted">{emp.position}</td>
                    <td className="table-cell font-mono text-muted" style={{ fontWeight: 600 }}>
                      { '******'}
                    </td>
                    <td className="table-cell">
                      <div className="table-actions">
                        <Button
                          variant="danger"
                          onClick={() => {
                            setSelectedId(emp.emp_id);
                            setConfirmDelete(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" style={{ width: '0.875rem', height: '0.875rem' }} /> 
                        </Button> 
                        <Button
                          variant="outline"
                          onClick={() => openEditModal(emp)}
                        >
                          <Pencil className="w-4 h-4" style={{ width: '0.875rem', height: '0.875rem' }} /> 
                        </Button>
                        <Button
                          variant={emp.position === "TL" ? "warning" : "success"}
                          onClick={() => handleToggleTL(emp)}
                          disabled={saving}
                          style={{ minWidth: "105px" }}
                        >
                          {emp.position === "TL" ? "Make EMP" : "Make TL"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <EditEmployeeModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        name={name}
        email={email}
        phone={phone}
        gender={gender}
        salary={salary}
        role={role}
        position={Position}
        password={password}
        setName={setName}
        setEmail={setEmail}
        setPhone={setPhone}
        setGender={setGender}
        setSalary={setSalary}
        setRole={setRole}
        setPosition={setPosition}
        setPassword={setPassword}
        onSave={handleUpdate}
        saving={saving}
      />

      <AddEmployeeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchEmployees}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this employee?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}



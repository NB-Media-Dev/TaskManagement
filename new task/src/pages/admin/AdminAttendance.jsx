import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Filter,
  XCircle,
  RotateCcw,
  Calendar,
  LogIn,
  LogOut,
  CheckSquare,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getAttendance,
  getWeeklyAttendance,
  getTodayEmployeeAttendance,
  markBatchAttendance,
} from '../../services';
import { useToast } from '../../context/ToastContext';
import {
  Card,
  Button,
  Badge,
  statusVariant,
  SearchBar,
  StatCard,
  EmptyState,
  ErrorState,
} from '../../components/ui';
import { formatEmpId } from '../../utils/helpers';

export default function AdminAttendance() {
  const toast = useToast();

 
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chartData, setChartData] = useState([]);

  const [selectedId, setSelectedId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');


  const [empList, setEmpList] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getAttendance();
      if (res.data.success) {
        setRecords(res.data.data);
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

  const fetchChart = async () => {
    try {
      const res = await getWeeklyAttendance();
      if (res.data.success) setChartData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodayEmployees = async () => {
    setEmpLoading(true);
    try {
      const res = await getTodayEmployeeAttendance();
      if (res.data.success) {
        setEmpList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching today employees:', err);
    } finally {
      setEmpLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchChart();
    fetchTodayEmployees();
  }, []);

  const applyFilter = async () => {
    try {
      const res = await getAttendance({ id: searchId, from: fromDate, to: toDate });
      if (res.data.success) setRecords(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Filter failed');
    }
  };


  const toggleSelectAll = () => {
    if (empList.length === 0) return;
    if (selectedEmpIds.length === empList.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(empList.map((e) => e.emp_id));
    }
  };

  const toggleSelectEmp = (empId) => {
    if (selectedEmpIds.includes(empId)) {
      setSelectedEmpIds(selectedEmpIds.filter((id) => id !== empId));
    } else {
      setSelectedEmpIds([...selectedEmpIds, empId]);
    }
  };

  const handleAttendanceAction = async (action, singleEmp = null) => {
    let itemsToProcess = [];

    if (singleEmp) {
      itemsToProcess = [{ emp_id: singleEmp.emp_id, name: singleEmp.emp_name }];
    } else {
      if (selectedEmpIds.length === 0) {
        toast.error('Please select at least one employee from the side checkboxes');
        return;
      }
      itemsToProcess = empList
        .filter((e) => selectedEmpIds.includes(e.emp_id))
        .map((e) => ({ emp_id: e.emp_id, name: e.emp_name }));
    }

    setSubmitting(true);
    try {
      const res = await markBatchAttendance({ items: itemsToProcess, action });
      if (res.data.success) {
        toast.success(res.data.message || `Attendance updated (${action})`);
        await fetchTodayEmployees();
        await fetchAll();
        await fetchChart();
        if (!singleEmp) {
          setSelectedEmpIds([]);
        }
      } else {
        toast.error(res.data.message || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit attendance update');
    } finally {
      setSubmitting(false);
    }
  };

  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  const isAllSelected = empList.length > 0 && selectedEmpIds.length === empList.length;

  return (
    <div className="dashboard-space-y">
      <div>
        <h1 className="dashboard-header-title">Attendance Management</h1>
        <p className="dashboard-header-sub">Select employees to put Check In, Check Out, Absent, or Undo attendance</p>
      </div>

      <div className="dashboard-grid-3">
        <StatCard label="Total Attendance Logs" value={loading ? '...' : totalRecords.toString()} icon={Users} variant="primary" />
        <StatCard label="Present Employees" value={loading ? '...' : presentCount.toString()} icon={UserCheck} variant="success" />
        <StatCard label="Absent Employees" value={loading ? '...' : absentCount.toString()} icon={UserX} variant="danger" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.25rem', alignItems: 'start' }}>
        <Card className="ui-card-p6" style={{ border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="dashboard-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Calendar className="w-5 h-5 text-primary" style={{color:'blue'}} /> Employees Overall Attendance Table
              </h3>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.625rem', borderRadius: '6px' }}>
              {empList.length} Total Employees
            </div>
          </div>

          {(() => {
            if (empLoading) return <TableSkeleton rows={4} cols={7} />;
            if (empList.length === 0) return <EmptyState icon={Users} title="No employees found" description="Add employees to start marking daily attendance." />;
            return (
              <div className="table-responsive-wrapper">
                <table className="data-table">
                  <thead>
                    <tr className="table-header">
                      <th className="table-cell" style={{ width: '45px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                          title="Select All Employees"
                        />
                      </th>
                      <th className="table-cell">Emp ID</th>
                      <th className="table-cell">Name</th>
                      <th className="table-cell">Role / Email</th>
                      <th className="table-cell">Today Status</th>
                      <th className="table-cell">Check-in Time</th>
                      <th className="table-cell">Check-out Time</th>
                      <th className="table-cell">Work Hours</th>
                      <th className="table-cell" style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empList.map((emp) => {
                      const isSelected = selectedEmpIds.includes(emp.emp_id);
                      return (
                        <tr
                          key={emp.emp_id}
                          className="table-row"
                          style={{
                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : undefined,
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          <td className="table-cell" style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectEmp(emp.emp_id)}
                              style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                          </td>
                          <td className="table-cell font-medium">{formatEmpId(emp.emp_id)}</td>
                          <td className="table-cell" style={{ fontWeight: 600 }}>{emp.emp_name}</td>
                          <td className="table-cell text-muted">
                            <div>{emp.emp_email}</div>
                            <small style={{ color: 'var(--text-muted)' }}>{emp.emp_role || 'Employee'}</small>
                          </td>
                          <td className="table-cell">
                            <Badge variant={statusVariant(emp.status)} dot>
                              {emp.status}
                            </Badge>
                          </td>
                          <td className="table-cell text-muted">{emp.checkin || '-'}</td>
                          <td className="table-cell text-muted">{emp.checkout || '-'}</td>
                          <td className="table-cell font-medium">{emp.workhours || '00:00:00'}</td>
                          <td className="table-cell" style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.25rem', justifyContent: 'center' }}>
                              <Button
                                variant="success"
                                className="btn-sm"
                                title="Check In"
                                onClick={() => handleAttendanceAction('checkin', emp)}
                                disabled={submitting}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <LogIn className="w-3 h-3" /> In
                              </Button>

                              <Button
                                variant="primary"
                                className="btn-sm"
                                title="Check Out"
                                onClick={() => handleAttendanceAction('checkout', emp)}
                                disabled={submitting}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <LogOut className="w-3 h-3" /> Out
                              </Button>

                              <Button
                                variant="danger"
                                className="btn-sm"
                                title="Mark Absent"
                                onClick={() => handleAttendanceAction('absent', emp)}
                                disabled={submitting}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <XCircle className="w-3 h-3" /> Absent
                              </Button>

                              <Button
                                variant="outline"
                                className="btn-sm"
                                title="Undo Status"
                                onClick={() => handleAttendanceAction('undo', emp)}
                                disabled={submitting}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <RotateCcw className="w-3 h-3" /> Undo
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </Card>

        
        <Card
          className="ui-card-p6"
          style={{
            border: '1px solid var(--border)',
            borderRadius: '12px',
            position: 'sticky',
            top: '1rem',
            boxShadow: 'var(--shadow-sm)',
            background: 'var(--card)'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.875rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <CheckSquare className="w-5 h-5 text-primary" style={{color:'red'}}/> Attendance Action Box
            </h3>
           
          </div>

          <div style={{ marginBottom: '1.25rem', backgroundColor: 'var(--surface-50, #f8fafc)', padding: '0.75rem', borderRadius: '8px', border: '1px dashed var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Selected:</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                {selectedEmpIds.length} / {empList.length}
              </span>
            </div>

            <Button
              variant="outline"
              className="btn-sm"
              onClick={toggleSelectAll}
              style={{ width: '100%', fontSize: '0.8rem', marginTop: '0.25rem' }}
            >
              {isAllSelected ? 'Deselect All Employees' : 'Select All Employees'}
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Button
              variant="success"
              onClick={() => handleAttendanceAction('checkin')}
              disabled={submitting || selectedEmpIds.length === 0}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.625rem 0.875rem' }}
            >
              <LogIn className="w-4 h-4" /> Check In (Present)
            </Button>

            <Button
              variant="primary"
              onClick={() => handleAttendanceAction('checkout')}
              disabled={submitting || selectedEmpIds.length === 0}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.625rem 0.875rem' }}
            >
              <LogOut className="w-4 h-4" />  Check Out
            </Button>

            <Button
              variant="danger"
              onClick={() => handleAttendanceAction('absent')}
              disabled={submitting || selectedEmpIds.length === 0}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.625rem 0.875rem' }}
            >
              <XCircle className="w-4 h-4" /> Put Absent
            </Button>

            <Button
              variant="outline"
              onClick={() => handleAttendanceAction('undo')}
              disabled={submitting || selectedEmpIds.length === 0}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.625rem 0.875rem' }}
            >
              <RotateCcw className="w-4 h-4" /> Undo Attendance
            </Button>
          </div>

          {selectedEmpIds.length === 0 && (
            <p className="text-muted" style={{ fontSize: '0.775rem', marginTop: '1rem', fontStyle: 'italic', textAlign: 'center' }}>
              {/* Tip: Tick the small box on the left side of any employee row to select them. */}
            </p>
          )}
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="ui-card-p6">
          <h3 className="dashboard-card-title" style={{ marginBottom: '1rem' }}>Daily Attendance Breakdown (Day-wise Report)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10B981" name="Present %" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="#EF4444" name="Absent %" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      
      <Card className="ui-card-p6">
        <div className="task-filter-group" style={{ marginBottom: '1.25rem' }}>
          <div className="task-filter-dates">
            <div>
              <label htmlFor="attn-filter-from" className="form-label" style={{ display: 'block', marginBottom: '0.375rem' }}>From Date</label>
              <input
              id="attn-filter-from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="attn-filter-to" className="form-label" style={{ display: 'block', marginBottom: '0.375rem' }}>To Date</label>
              <input
                id="attn-filter-to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          <div className="task-filter-actions">
            <SearchBar value={searchId} onChange={setSearchId} onSubmit={applyFilter} placeholder="Search employee name" />
            <Button onClick={applyFilter}>
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        <h3 className="dashboard-card-title" style={{ marginBottom: '1rem' }}>Attendance History & Records</h3>

        {(() => {
          if (loading) return <TableSkeleton rows={5} cols={8} />;
          if (error) return <ErrorState onRetry={() => window.location.reload()} />;
          if (records.length === 0) return <EmptyState icon={Users} title="No attendance records found" description="Try adjusting your filters." />;
          return (
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell">ID</th>
                    <th className="table-cell">Name</th>
                    <th className="table-cell">Date</th>
                    <th className="table-cell">Check-in</th>
                    <th className="table-cell">Check-out</th>
                    <th className="table-cell">Work Hours</th>
                    <th className="table-cell">Status</th>
                    <th className="table-cell">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => (
                    <tr key={rec.attendance_id} className="table-row">
                      <td className="table-cell font-medium">{rec.attendance_id}</td>
                      <td className="table-cell">{rec.name}</td>
                      <td className="table-cell text-muted">{formatDate(rec.dates)}</td>
                      <td className="table-cell text-muted">{rec.checkin}</td>
                      <td className="table-cell text-muted">{rec.checkout}</td>
                      <td className="table-cell">{rec.workhours}</td>
                      <td className="table-cell">
                        <Badge variant={statusVariant(rec.status)} dot>
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="table-cell">
                        <input
                          type="radio"
                          name="attendance"
                          value={rec.attendance_id}
                          checked={selectedId === rec.attendance_id}
                          onChange={() => setSelectedId(rec.attendance_id)}
                          style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary)' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </Card>
    </div>
  );
}

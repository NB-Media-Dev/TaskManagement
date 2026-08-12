import { useEffect, useState } from 'react';
import { Users, ClipboardList, Clock, CheckCheck, LoaderCircleIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, StatCard, EmptyState, Badge, TableSkeleton } from '../../components/ui';
import { statusVariant } from '../../components/ui/Badge';
import { getEmployees, getAttendance, getTasks } from '../../services';
import { formatDate } from '../../utils/helpers';
const TEAMS_LIST = [
  "All",
  "Developer",
  "Designer",
  "Tester",
  "Content Writer",
  "Devops"
];

export default function AdminDashboard() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState("All");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [empRes, attRes, taskRes] = await Promise.all([
          getEmployees().catch(() => null),
          getAttendance().catch(() => null),
          getTasks().catch(() => null)
        ]);

        if (empRes?.data?.success) setEmployees(empRes.data.data);
        if (attRes?.data?.success) setAttendance(attRes.data.data);
        if (taskRes?.data?.success) setTasks(taskRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  const getTaskTeam = (task) => {
    if (task.team_name && task.team_name !== 'General') return task.team_name;
    if (task.roles) return task.roles;
    const matchedEmp = employees.find((emp) => emp.emp_name === task.assign_to);
    return matchedEmp?.emp_role || "Unassigned Team";
  };

  const totalEmployees = employees.length;
  const presentToday = attendance.filter((a) => a.status?.toString().toLowerCase() === "present").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status?.toLowerCase().includes("complete")).length;
  const inprogressTasks = tasks.filter((t) => {
    const s = t.status?.toLowerCase() || '';
    return s.includes("progress") || s.includes("inprogress") || s.includes("incomplete");
  }).length;
  const pendingTasks = tasks.filter((t) => !t.status || t.status?.toLowerCase().includes("pending")).length;

 
  const teamGroupedMap = {};
  TEAMS_LIST.filter(t => t !== "All").forEach(tName => {
    teamGroupedMap[tName] = [];
  });

  tasks.forEach((t) => {
    const team = getTaskTeam(t);
    if (!teamGroupedMap[team]) teamGroupedMap[team] = [];
    teamGroupedMap[team].push(t);
  });

  const teamSummaries = Object.keys(teamGroupedMap).map((tName) => {
    const tList = teamGroupedMap[tName];
    const comp = tList.filter((t) => t.status?.toLowerCase().includes("complete")).length;
    const incomp = tList.filter((t) => {
      const s = t.status?.toLowerCase() || '';
      return s.includes("progress") || s.includes("inprogress") || s.includes("incomplete");
    }).length;
    const pend = tList.filter((t) => !t.status || t.status?.toLowerCase().includes("pending")).length;
    const pct = tList.length > 0 ? Math.round((comp / tList.length) * 100) : 0;
    return {
      teamName: tName,
      total: tList.length,
      completed: comp,
      inprogress: incomp,
      pending: pend,
      percentage: pct,
      tasks: tList,
    };
  });

  const displayedTasks = selectedTeam === "All"
    ? tasks
    : tasks.filter((t) => getTaskTeam(t) === selectedTeam);

  return (
    <div className="dashboard-space-y">
      <div>
        <h1 className="dashboard-header-title">Admin Dashboard</h1>
        <p className="dashboard-header-sub">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}.
          Here's how your teams and tasks are performing today.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem"
        }}
      >
        <StatCard
          label="Total Employees"
          value={loading ? "..." : totalEmployees.toString()}
          icon={Users}
          variant="primary"
          // trend="up"
          // trendValue={`${presentToday} Present Today`}
        />
        <StatCard
          label="Completed Tasks"
          value={loading ? "..." : completedTasks.toString()}
          icon={CheckCheck}
          variant="success"
          // trend="up"
          // trendValue={`${completedTasks}/${totalTasks} Finished`}
        />
        <StatCard
          label="In Progress Tasks"
          value={loading ? "..." : inprogressTasks.toString()}
          icon={LoaderCircleIcon}
          variant="primary"
          // trend="down"
          // trendValue={`${incompleteTasks} Incomplete`}
        />
        <StatCard
          label="Pending Tasks"
          value={loading ? "..." : pendingTasks.toString()}
          icon={Clock}
          variant="warning"
          // trend="down"
          // trendValue={`${pendingTasks} Pending`}
        />
      </div>

     
      <Card className="ui-card-p6">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "0.75rem"
          }}
        >
          <div>
            <h3 className="dashboard-card-title">Teamwise Task History</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 5 }}>
              Grouped task updates, employee daily reports, and TL replies for {selectedTeam === "All" ? "All Teams" : `${selectedTeam} Team`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label htmlFor="admin-team-select" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Select Team:</label>
            <select
              id="admin-team-select"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="form-input"
              style={{ width: "180px", padding: "6px 10px" }}
            >
              {TEAMS_LIST.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "All" ? "All Teams" : `${dept} Team`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(() => {
          if (loading) return <TableSkeleton rows={5} cols={7} />;
          if (displayedTasks.length === 0) {
            return (
              <EmptyState
                icon={ClipboardList}
                title="No tasks found for this team"
                description="Select another team or assign new tasks."
              />
            );
          }

          return (
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell">Team</th>
                    <th className="table-cell">Employee</th>
                    <th className="table-cell">Task Name</th>
                    <th className="table-cell">Dates</th>
                    <th className="table-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTasks.map((t, index) => {
                    const st = t.status || "Pending";
                    const teamName = getTaskTeam(t);
                    const isCompleted = st.toLowerCase().includes("complete");
                    return (
                      <tr key={t.assign_id ? `${t.assign_id}-${index}` : index} className="table-row">
                        <td className="table-cell">
                          <Badge variant="primary">{teamName}</Badge>
                        </td>
                        <td className="table-cell font-medium">{t.assign_to}</td>
                        <td className="table-cell font-medium" style={{width:'25%'}}>{t.task_name}</td>
                        <td className="table-cell" style={{ minWidth: "190px" }}>
                          <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: "0.825rem", lineHeight: "1.5" }}>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <span style={{ color: "#eab308", fontSize: "1rem" }}>●</span>
                              <span><strong>Assign:</strong> {formatDate(t.assign_date)}</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <span style={{ color: "#ef4444", fontSize: "1rem" }}>●</span>
                              <span><strong>Due:</strong> {formatDate(t.deadline || t.dline)}</span>
                            </li>
                            
                            {isCompleted && (
                              <li style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <span style={{ color: "#22c55e", fontSize: "1rem" }}>●</span>
                                <span><strong>Completed:</strong> {formatDate(t.completed_date || t.updated_at || t.assign_date)}</span>
                              </li>
                            )}
                          </ul>
                        </td>
                        <td className="table-cell">
                          <Badge variant={statusVariant(st)}>{st}</Badge>
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
    </div>
  );
}
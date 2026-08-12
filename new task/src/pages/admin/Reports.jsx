import { useEffect, useState } from "react";
import { ClipboardList, Users, CalendarDays } from "lucide-react";

import { getTasks, getEmployees } from "../../services";
import { formatDate } from "../../utils/helpers";

import {
  Card,
  Badge,
  EmptyState,
  TableSkeleton,
  StatCard,
} from '../../components/ui';

import { statusVariant } from "../../components/ui/Badge";

export default function Reports() {

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState("All");

  const [view, setView] = useState("Choose");

  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [selectedTeam, setSelectedTeam] = useState("");

  useEffect(() => {

    const load = async () => {

      try {
        const [taskRes, empRes] = await Promise.all([
          getTasks(),
          getEmployees()
        ]);

        if (taskRes.data.success) {
          setTasks(taskRes.data.data);
        }
        if (empRes.data.success) {
          setEmployees(empRes.data.data);
        }

      }
      catch (err) {

        console.log(err);

      }
      finally {

        setLoading(false);

      }

    };

    load();


  }, []);

  const [statusCardFilter, setStatusCardFilter] = useState("All");

  const getEmployee = (name) => {
    return employees.find(
      e => e.emp_name === name
    );
  };

  const teams = [
    ...new Set(
      employees
        .map(e => e.emp_role)
        .filter(Boolean)
    )
  ];

  const today = new Date();

  const finalTasks = tasks.filter(task => {
    if (statusCardFilter !== "All") {
      const st = task.status || "Pending";
      if (statusCardFilter === "Completed" && !st.toLowerCase().includes("complete")) return false;
      if (statusCardFilter === "In Progress" && !(st.toLowerCase().includes("progress") || st.toLowerCase().includes("incomplete"))) return false;
      if (statusCardFilter === "Pending" && !st.toLowerCase().includes("pending")) return false;
    }

    if (period !== "All") {
      const taskDate = new Date(task.assign_date);

      if (period === "Daily") {
        if (taskDate.toDateString() !== today.toDateString()) return false;
      }

      if (period === "Weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        if (taskDate < weekAgo) return false;
      }

      if (period === "Monthly") {
        if (taskDate.getMonth() !== today.getMonth() || taskDate.getFullYear() !== today.getFullYear()) return false;
      }
    }

    if (view === "Employee" && selectedEmployee) {
      return task.assign_to === selectedEmployee;
    }

    if (view === "Team" && selectedTeam) {
      const emp = getEmployee(task.assign_to);
      return emp?.emp_role === selectedTeam;
    }

    return true;
  });

  const completedCount = tasks.filter(t => t.status?.toLowerCase().includes("complete")).length;
  const inProgressCount = tasks.filter(t => {
    const s = t.status?.toLowerCase() || '';
    return s.includes("progress") || s.includes("inprogress") || s.includes("incomplete");
  }).length;
  const pendingCount = tasks.filter(t => !t.status || t.status.toLowerCase().includes("pending")).length;

  return (
    <div className="dashboard-space-y">
      <div>
        <h1 className="dashboard-header-title">
          Task Progress Reports
        </h1>
        <p className="dashboard-header-sub">
          Daily, Weekly and Monthly Task Tracking
        </p>
      </div>

      <div className="dashboard-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem"}}>
        
        <div onClick={() => setStatusCardFilter("All")} style={{ cursor: "pointer", borderRadius: "12px" }}>
          <StatCard
            label="Total Tasks"
            value={tasks.length}
            icon={ClipboardList}
            variant="primary"
          />
        </div>
{/* outline: statusCardFilter === "Completed" ? "2px solid var(--success)" : "none", */}
        <div onClick={() => setStatusCardFilter("Completed")} style={{ cursor: "pointer",  borderRadius: "12px" }}>
          <StatCard
            label="Completed"
            value={completedCount}
            icon={CalendarDays}
            variant="success"
          />
        </div>
 {/* outline: statusCardFilter === "In Progress" ? "2px solid var(--primary)" : "none", */}
        <div onClick={() => setStatusCardFilter("In Progress")} style={{ cursor: "pointer", borderRadius: "12px" }}>
          <StatCard
            label="In Progress"
            value={inProgressCount}
            icon={ClipboardList}
            variant="primary"
          />
        </div>
 {/* outline: statusCardFilter === "Pending" ? "2px solid var(--warning)" : "none", */}
        <div onClick={() => setStatusCardFilter("Pending")} style={{ cursor: "pointer", borderRadius: "12px" }}>
          <StatCard
            label="Pending"
            value={pendingCount}
            icon={Users}
          
            variant="warning"
          />
        </div>
      </div>
      <Card className="ui-card-p6">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <h3 className="dashboard-card-title">
            Task History
          </h3>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="form-input"
              style={{
                flex: "1 1 140px",
                minWidth: "120px",
                maxWidth: "100%",
                padding: "8px",
                borderRadius: "6px"
              }}
            >
              <option value="All">All Period</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <select
              value={view}
              onChange={e => {
                setView(e.target.value);
                setSelectedEmployee("");
                setSelectedTeam("");
              }}
              className="form-input"
              style={{
                flex: "1 1 140px",
                minWidth: "120px",
                maxWidth: "100%",
                padding: "8px",
                borderRadius: "6px"
              }}
            >
              <option value="view">Choose Type</option>
              <option value="Employee">Employee Wise</option>
              <option value="Team">Team Wise</option>
            </select>
            {view === "Employee" && (
              <select
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
                className="form-input"
                style={{
                  flex: "1 1 140px",
                  minWidth: "120px",
                  maxWidth: "100%",
                  padding: "8px",
                  borderRadius: "6px"
                }}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.emp_id} value={emp.emp_name}>
                    {emp.emp_name}
                  </option>
                ))}
              </select>
            )}
            {view === "Team" && (
              <select
                value={selectedTeam}
                onChange={e => setSelectedTeam(e.target.value)}
                className="form-input"
                style={{
                  flex: "1 1 140px",
                  minWidth: "120px",
                  maxWidth: "100%",
                  padding: "8px",
                  borderRadius: "6px"
                }}
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        {
          loading ?

            <TableSkeleton
              rows={5}
              cols={8}
            />
            : finalTasks.length === 0 ?
              <EmptyState
                icon={ClipboardList}
                title="No task report found"
              />
              :
              <div className="table-responsive-wrapper">

                <table className="data-table">

                  <thead>
                    <tr className="table-header">

                      <th className="table-cell">
                        {
                          view === "Employee"
                            ?
                            "Employee"
                            :
                            "Team Member"
                        }
                      </th>

                      <th className="table-cell">
                        Task
                      </th>

                      <th className="table-cell">
                        Dates
                      </th>
                      <th className="table-cell">
                        Status
                      </th>
                      <th className="table-cell">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      finalTasks.map((task, index) => {
                        const emp = getEmployee(task.assign_to);
                        const isCompleted = task.status?.toLowerCase().includes("complete");

                        return (
                          <tr
                            key={task.assign_id ? `${task.assign_id}-${index}` : index}
                            className="table-row"
                          >
                            <td className="table-cell">
                              {
                                view === "Employee"
                                  ? task.assign_to
                                  : `${task.assign_to} (${emp?.emp_role || "-"})`
                              }
                            </td>
                            <td className="table-cell font-medium" style={{width:'25%'}}>
                              {task.task_name}
                            </td>
                            <td className="table-cell" style={{ minWidth: "190px" }}>
                              <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: "0.825rem", lineHeight: "1.5" }}>
                                <li style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                  <span style={{ color: "#eab308", fontSize: "1rem" }}>●</span>
                                  <span><strong>Assign:</strong> {formatDate(task.assign_date)}</span>
                                </li>
                                <li style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                  <span style={{ color: "#ef4444", fontSize: "1rem" }}>●</span>
                                  <span><strong>Due:</strong> {formatDate(task.deadline || task.dline)}</span>
                                </li>
                                {isCompleted && (
                                  <li style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                    <span style={{ color: "#22c55e", fontSize: "1rem" }}>●</span>
                                    <span><strong>Completed:</strong> {formatDate(task.completed_date || task.updated_at || task.assign_date)}</span>
                                  </li>
                                )}
                              </ul>
                            </td>
                            <td className="table-cell">
                              <Badge
                                variant={
                                  statusVariant(
                                    task.status || "Pending"
                                  )
                                }
                              >
                                {task.status || "Pending"}
                              </Badge>
                            </td>
                            <td className="table-cell text-muted" style={{ maxWidth: "14rem" }}>
                              {task.performance ? (
                                <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{task.performance}</span>
                              ) : (
                                <span style={{ opacity: 0.5 }}>-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    }

                  </tbody>
                </table>
              </div>
        }
      </Card>

    </div>
  );
}
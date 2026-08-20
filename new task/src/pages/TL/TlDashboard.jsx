import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardList,
  Clock,
  CheckCheck,
  Edit3,
  LoaderCircleIcon
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  Button,
  Card,
  StatCard,
  EmptyState,
  Badge,
  TableSkeleton,
  StatusSelectFilter
} from "../../components/ui";

import { statusVariant } from "../../components/ui/Badge";
import { formatEmpId, matchesTaskStatus, useTLData } from "../../utils/helpers";

export default function TLDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { loading, teamMembers, teamTasks } = useTLData();

  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedEmp, setSelectedEmp] = useState("");

  const filteredTeamTasks = selectedEmp
    ? teamTasks.filter((t) => t.assign_to === selectedEmp || String(t.assign_to) === String(selectedEmp))
    : teamTasks;

  const completedCount = filteredTeamTasks.filter((t) =>
    t.status?.toLowerCase().includes("complete")
  ).length;

  const incompleteCount = filteredTeamTasks.filter((t) => {
    const s = t.status?.toLowerCase() || '';
    return s.includes("progress") || s.includes("inprogress") || s.includes("incomplete");
  }).length;

  const pendingCount = filteredTeamTasks.filter(
    (t) => !t.status || t.status.toLowerCase().includes("pending")
  ).length;

  const displayedTasks = filteredTeamTasks.filter((t) => matchesTaskStatus(t, statusFilter));

  return (
    <div className="dashboard-space-y">
      <div className="employee-action-row">
        <div>
          <h1 className="dashboard-header-title">Team Lead Dashboard</h1>
          <p className="dashboard-header-sub">
            {user?.email ? `${user.email.split('@')[0]}, here's` : "Here's"} Assign tasks, review daily employee updates, and reply with feedback.
          </p>
        </div>
      </div>

      <div className="dashboard-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        <StatCard
          label="Team Members"
          value={loading ? "..." : teamMembers.length.toString()}
          icon={Users}
          variant="primary"
          onClick={() => {
            setSelectedEmp("");
            setStatusFilter("All");
          }}
          isActive={selectedEmp === "" && statusFilter === "All"}
        />
        <StatCard
          label={selectedEmp ? `${selectedEmp}'s Tasks` : "Total Team Tasks"}
          value={loading ? "..." : filteredTeamTasks.length.toString()}
          icon={ClipboardList}
          variant="secondary"
          onClick={() => setStatusFilter("All")}
          isActive={statusFilter === "All" && selectedEmp !== ""}
        />
        <StatCard
          label="Completed"
          value={loading ? "..." : completedCount.toString()}
          icon={CheckCheck}
          variant="success"
          onClick={() => setStatusFilter(prev => prev === "Completed" ? "All" : "Completed")}
          isActive={statusFilter === "Completed"}
        />
        <StatCard
          label="In Progress"
          value={loading ? "..." : incompleteCount.toString()}
          icon={LoaderCircleIcon}
          variant="primary"
          onClick={() => setStatusFilter(prev => (prev === "Incomplete" || prev === "In Progress") ? "All" : "Incomplete")}
          isActive={statusFilter === "Incomplete" || statusFilter === "In Progress"}
        />
        <StatCard
          label="Pending"
          value={loading ? "..." : pendingCount.toString()}
          icon={Clock}
          variant="warning"
          onClick={() => setStatusFilter(prev => prev === "Pending" ? "All" : "Pending")}
          isActive={statusFilter === "Pending"}
        />
      </div>

      <Card className="ui-card-p6">
        <div style={{
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}>
          <h3 className="dashboard-card-title">
            Team Members
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Filter Employee:</span>
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="form-input"
              style={{ width: "200px", padding: "6px 10px" }}
            >
              <option value="">All Employees</option>
              {teamMembers.map((emp) => (
                <option key={emp.emp_id} value={emp.emp_name}>
                  {emp.emp_name} ({formatEmpId(emp.emp_id)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {(() => {
          if (loading) return <TableSkeleton rows={5} cols={2} />;
          if (teamMembers.length === 0) {
            return (
              <EmptyState
                icon={Users}
                title="No team members found"
                description="No employees are assigned under this team lead."
              />
            );
          }
          return (
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell">Employee Id</th>
                    <th className="table-cell">Employee Name</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((emp, index) => {
                    const isSelected = selectedEmp === emp.emp_name;
                    return (
                      <tr
                        key={emp.emp_id ? `${emp.emp_id}-${index}` : index}
                        className="table-row"
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "rgba(59, 130, 246, 0.1)" : undefined
                        }}
                        onClick={() => setSelectedEmp(isSelected ? "" : emp.emp_name)}
                      >
                        <td className="table-cell font-medium">
                          {formatEmpId(emp.emp_id)}
                        </td>
                        <td className="table-cell font-medium">
                          {emp.emp_name}
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

      <Card className="ui-card-p6">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 className="dashboard-card-title">
              {selectedEmp ? `${selectedEmp}'s Tasks` : "Team Tasks Overview"}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 5 }}>
              Task details  for {selectedEmp || "all team members"}.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Status:</span>
            <StatusSelectFilter value={statusFilter} onChange={setStatusFilter} width="160px" />
          </div>
        </div>

        {(() => {
          if (loading) return <TableSkeleton rows={4} cols={5} />;
          if (displayedTasks.length === 0) {
            return (
              <EmptyState
                icon={ClipboardList}
                title="No tasks found"
                description={selectedEmp ? `No tasks found for ${selectedEmp}.` : "No tasks assigned under this team lead."}
              />
            );
          }

          return (
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell">Employee</th>
                    <th className="table-cell">Task Name</th>
                    <th className="table-cell">Status</th>
                    <th className="table-cell">Employee Daily Report</th>
                    <th className="table-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTasks.map((task, index) => {
                    const st = task.status || "Pending";
                    const taskId = task.assign_id || task.id;
                    return (
                      <tr key={taskId ? `${taskId}-${index}` : index} className="table-row">
                        <td className="table-cell font-medium">{task.assign_to}</td>
                        <td className="table-cell font-medium" style={{width:'25%'}}>{task.task_name}</td>
                        <td className="table-cell">
                          <Badge variant={statusVariant(st)}>{st}</Badge>
                        </td>
                        <td className="table-cell text-muted" style={{ maxWidth: "16rem" }}>
                          {task.daily_update || task.remarks || <span style={{ opacity: 0.5 }}>No daily report</span>}
                        </td>
                        <td className="table-cell">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (taskId) {
                                navigate(`/TL/review-task/${taskId}`);
                              }
                            }}
                          >
                            <Edit3 className="w-3.5 h-3.5" /> View & Reply
                          </Button>
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
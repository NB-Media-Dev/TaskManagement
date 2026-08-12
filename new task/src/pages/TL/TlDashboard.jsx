import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardList,
  Clock,
  CheckCheck,
  FileText,
  MessageSquare,
  Edit3,
  Filter,
  LoaderCircleIcon
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import {
  Card,
  StatCard,
  EmptyState,
  Badge,
  TableSkeleton,
  Button,
  Modal,
  Select
} from "../../components/ui";

import { statusVariant } from "../../components/ui/Badge";
import { getEmployees, getTasks, updateTaskStatus } from "../../services";
import { formatEmpId } from "../../utils/helpers";

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Incomplete", label: "Incomplete" },
  { value: "Completed", label: "Completed" },
];

export default function TLDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("Pending");
  const [tlReplyText, setTlReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTLData = async () => {
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
  };

  useEffect(() => {
    fetchTLData();
    
  }, []);

  const userName = user?.name || user?.email?.split("@")[0] || "";

  
  const tlRecord = employees.find(
    (e) => e.emp_email === user?.email || e.emp_name === userName
  );
  const tlDept = tlRecord?.emp_role || user?.emp_role || "";

  
  const teamMembers = employees.filter((emp) => {
   
    if (emp.emp_email === user?.email || emp.emp_name === userName) return false;

   
    if (emp.team_lead && (emp.team_lead === userName || emp.team_lead === user?.email)) return true;

    
    if (tlDept && tlDept !== "General" && emp.emp_role?.toLowerCase() === tlDept.toLowerCase()) return true;

   
    if (!emp.team_lead && (!tlDept || tlDept === "General")) return true;

    return false;
  });

 
  const teamTasks = tasks.filter((task) => {
   
    const isTeamMemberTask = teamMembers.some(
      (m) => m.emp_name === task.assign_to || String(m.emp_id) === String(task.assign_to)
    );
    if (isTeamMemberTask) return true;

   
    if (tlDept && tlDept !== "General") {
      if (task.roles?.toLowerCase() === tlDept.toLowerCase()) return true;
      if (task.team_name?.toLowerCase() === tlDept.toLowerCase()) return true;
    }

    return false;
  });

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

  const displayedTasks = filteredTeamTasks.filter((t) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Pending") return !t.status || t.status.toLowerCase().includes("pending");
    if (statusFilter === "Incomplete" || statusFilter === "In Progress") {
      const s = t.status?.toLowerCase() || '';
      return s.includes("progress") || s.includes("inprogress") || s.includes("incomplete");
    }
    if (statusFilter === "Completed") return t.status?.toLowerCase().includes("complete");
    return true;
  });

  const handleOpenReviewModal = (task) => {
    setSelectedTask(task);
    setReviewStatus(task.status || "Pending");
    setTlReplyText(task.tl_reply || "");
    setModalOpen(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmitting(true);
    try {
      const res = await updateTaskStatus({
        assign_id: selectedTask.assign_id || selectedTask.id,
        task_name: selectedTask.task_name,
        assign_to: selectedTask.assign_to,
        status: reviewStatus,
        remarks: selectedTask.remarks,
        daily_update: selectedTask.daily_update,
        tl_reply: tlReplyText,
      });

      if (res.data.success) {
        toast.success(`Task status updated to "${reviewStatus}" and reply saved.`);
        setModalOpen(false);
        fetchTLData();
      } else {
        toast.error(res.data.message || "Failed to update task");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-space-y">
      <div className="employee-action-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="dashboard-header-title">Team Lead Dashboard</h1>
          <p className="dashboard-header-sub">
            Assign tasks, review daily employee updates, and reply with feedback.
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
            {selectedEmp && (
              <Button size="sm" variant="outline" onClick={() => setSelectedEmp("")}>
                Reset Filter
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={2} />
        ) : teamMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members found"
            description="No employees are assigned under this team lead."
          />
        ) : (
          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr className="table-header">
                  <th className="table-cell">Employee Id</th>
                  <th className="table-cell">Employee Name</th>
                  {/* <th className="table-cell">Action</th> */}
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
                      {/* <td className="table-cell">
                        <Button
                          variant={isSelected ? "primary" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmp(isSelected ? "" : emp.emp_name);
                          }}
                        >
                          {isSelected ? "Showing Tasks" : "View Tasks"}
                        </Button>
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ width: "160px", padding: "6px 10px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Incomplete">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
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
             <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', display: 'block' }}>

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
            </div>
          );
        })()}
      </Card>

      {/* <Card className="ui-card-p6">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 className="dashboard-card-title">Employee Daily Task Reports</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              Review daily task progress reported by employees and reply directly.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter className="w-4 h-4 text-muted" />
            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ width: "160px", padding: "6px 10px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Incomplete">Incomplete</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {(() => {
          if (loading) return <TableSkeleton rows={5} cols={6} />;
          if (displayedTasks.length === 0) {
            return (
              <EmptyState
                icon={ClipboardList}
                title="No tasks found"
                description="Assign tasks to team members to see their daily reports here."
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
                    <th className="table-cell">TL Reply</th>
                    <th className="table-cell">Deadline</th>
                    <th className="table-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTasks.map((task, index) => {
                    const st = task.status || "Pending";
                    return (
                      <tr key={task.assign_id || index} className="table-row">
                        <td className="table-cell font-medium">{task.assign_to}</td>
                        <td className="table-cell font-medium">{task.task_name}</td>
                        <td className="table-cell">
                          <Badge variant={statusVariant(st)}>{st}</Badge>
                        </td>
                        <td className="table-cell text-muted" style={{ maxWidth: "16rem" }}>
                          {task.daily_update ? (
                            <span>{task.daily_update}</span>
                          ) : task.remarks ? (
                            <span>{task.remarks}</span>
                          ) : (
                            <span style={{ opacity: 0.5 }}>No daily report submitted</span>
                          )}
                        </td>
                        <td className="table-cell text-muted" style={{ maxWidth: "14rem" }}>
                          {task.tl_reply ? (
                            <span style={{ color: "var(--primary)", fontWeight: 500 }}>
                              <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                              {task.tl_reply}
                            </span>
                          ) : (
                            <span style={{ opacity: 0.5 }}>No reply yet</span>
                          )}
                        </td>
                        <td className="table-cell text-muted">{task.deadline || "-"}</td>
                        <td className="table-cell">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReviewModal(task)}
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
      </Card> */}

      
      {/* <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Review Task & Reply to Employee" size="md">
        {selectedTask && (
          <form onSubmit={handleSaveReview} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ background: "var(--bg-secondary)", padding: "0.85rem 1rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Assigned Employee</div>
              <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>{selectedTask.assign_to}</div>
              <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                <strong>Task:</strong> {selectedTask.task_name} | <strong>Deadline:</strong> {selectedTask.deadline}
              </div>
              <div style={{ marginTop: "0.35rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {selectedTask.descriptions}
              </div>
            </div>

           
            <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "rgba(59, 130, 246, 0.05)" }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--primary)", marginBottom: "0.35rem" }}>
                Employee Daily Report / Update:
              </div>
              <div style={{ fontSize: "0.9rem" }}>
                {selectedTask.daily_update || selectedTask.remarks || "Employee has not added a detailed update yet."}
              </div>
            </div>

            
            <Select
              label="Update Task Status (TL Decision)"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              options={STATUS_OPTIONS}
              required
            />

            
            <div>
              <label htmlFor="tl-reply-input" className="form-label" style={{ display: "block", marginBottom: "0.375rem" }}>
                TL Reply to Employee
              </label>
              <textarea
                id="tl-reply-input"
                value={tlReplyText}
                onChange={(e) => setTlReplyText(e.target.value)}
                placeholder="Write feedback, instructions, or response for the employee..."
                rows={3}
                className="form-textarea"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.5rem" }}>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                <MessageSquare className="w-4 h-4" /> Save Status & Reply
              </Button>
            </div>
          </form>
        )}
      </Modal> */}
    </div>
  );
}
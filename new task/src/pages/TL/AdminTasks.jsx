import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  ClipboardList,
  Clock,
  CheckCheck,
  AlertTriangle,
  FileText,
  MessageSquare,
  Edit3
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
import { formatDate } from "../../utils/helpers";
import ReviewTask from "./ReviewTask";

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

export default function TLAdminTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    if (tasks.length > 0) {
      const highlightId = location.state?.highlightTaskId;
      if (highlightId) {
        const match = tasks.find(t => String(t.assign_id || t.id) === String(highlightId));
        if (match) {
          navigate(`/TL/review-task/${match.assign_id || match.id}`);
        }
      }
    }
  }, [tasks, location.state, navigate]);

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

  const completedCount = teamTasks.filter((t) =>
    t.status?.toLowerCase().includes("complete")
  ).length;

  const inprogressCount = teamTasks.filter((t) => {
    const s = t.status?.toLowerCase() || '';
    return s.includes("progress") || s.includes("inprogress") || s.includes("incomplete");
  }).length;

  const pendingCount = teamTasks.filter(
    (t) => !t.status || t.status.toLowerCase().includes("pending")
  ).length;

  const [periodFilter, setPeriodFilter] = useState("All");

  const today = new Date();

  const displayedTasks = teamTasks.filter((t) => {
    if (periodFilter !== "All") {
      const taskDate = new Date(t.assign_date || t.created_at || new Date());
      if (periodFilter === "Daily" && taskDate.toDateString() !== today.toDateString()) return false;
      if (periodFilter === "Weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        if (taskDate < weekAgo) return false;
      }
      if (periodFilter === "Monthly") {
        if (taskDate.getMonth() !== today.getMonth() || taskDate.getFullYear() !== today.getFullYear()) return false;
      }
    }

    if (statusFilter === "All") return true;
    if (statusFilter === "Pending") return !t.status || t.status.toLowerCase().includes("pending");
    if (statusFilter === "In Progress" || statusFilter === "Incomplete") {
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
      <div className="employee-action-row">
        <div>
          <h1 className="dashboard-header-title">Team Tasks</h1>
          <p className="dashboard-header-sub">
            Review team task progress reported by employees and reply with feedback.
          </p>
        </div>
      </div>

      <Card className="ui-card-p6">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 className="dashboard-card-title">Employee Daily Task Reports</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 5 }}>
              Filter by period or status to inspect team daily reports.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Period:</span>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="form-input"
                style={{ width: "130px", padding: "6px 10px" }}
              >
                <option value="All">All Period</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
                style={{ width: "140px", padding: "6px 10px" }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Incomplete">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {(() => {
          if (loading) return <TableSkeleton rows={5} cols={6} />;
          if (displayedTasks.length === 0) {
            return (
              <EmptyState
                icon={ClipboardList}
                title="No tasks found"
                description="No daily tasks match the selected period or status filter."
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
                    <th className="table-cell">Dates</th>
                    <th className="table-cell">TL View</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTasks.map((task, index) => {
                    const st = task.status || "Pending";
                    const taskId = task.assign_id || task.id;
                    const isCompletedTask = st.toLowerCase().includes("complete");

                    const todayMidnight = new Date();
                    todayMidnight.setHours(0, 0, 0, 0);
                    const rawDeadline = task.dline || task.deadline;
                    let isOverdue = false;
                    if (!isCompletedTask && rawDeadline) {
                      const dDate = new Date(rawDeadline);
                      if (!isNaN(dDate.getTime())) {
                        dDate.setHours(0, 0, 0, 0);
                        isOverdue = dDate.getTime() < todayMidnight.getTime();
                      }
                    }

                    return (
                      <tr key={taskId || index} className="table-row">
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
                        <td className="table-cell" style={{ minWidth: "190px", width:'25%'}}>
                          <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: "0.875rem", lineHeight: "1.5" }}>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <span style={{ color: "#eab308", fontSize: "1rem" }}>●</span>
                              <span><strong>Assign:</strong> {formatDate(task.assign_date)}</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <span style={{ color: "#ef4444", fontSize: "1rem" }}>●</span>
                              <span><strong>Due:</strong> {formatDate(task.dline || task.deadline)}</span>
                            </li>
                            {isOverdue && (
                              <li style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.2rem", color: "#ef4444", fontWeight: 500 }}>
                                {/* <AlertTriangle className="w-3.5 h-3.5 text-danger" style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} /> */}
                                <span>Overdue Task</span>
                              </li>
                            )}
                            {isCompletedTask && (
                              <li style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <span style={{ color: "#22c55e", fontSize: "1rem" }}>●</span>
                                <span><strong>Completed:</strong> {formatDate(task.completed_date || task.updated_at || task.assign_date)}</span>
                              </li>
                            )}
                          </ul>
                        </td>
                        <td className="table-cell">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (taskId) {
                                navigate(`/TL/review-task/${taskId}`);
                              } else {
                                handleOpenReviewModal(task);
                              }
                            }}
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Review / View & Reply
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
      <ReviewTask
        task={selectedTask}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaveSuccess={fetchTLData}
      />
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ClipboardList, Edit3 } from "lucide-react";
import { Card, EmptyState, Badge, TableSkeleton, Button, StatusSelectFilter } from "../../components/ui";
import { statusVariant } from "../../components/ui/Badge";
import { formatDate, matchesTaskStatus, matchesPeriod, useTLData } from "../../utils/helpers";
import ReviewTask from "./ReviewTask";

export default function TLAdminTasks() {
  const navigate = useNavigate();
  const location = useLocation();

  const { tasks, loading, teamTasks, fetchTLData } = useTLData();

  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("All");

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

  const displayedTasks = teamTasks.filter((t) => matchesPeriod(t, periodFilter) && matchesTaskStatus(t, statusFilter));

  const handleOpenReviewModal = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
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
              <StatusSelectFilter value={statusFilter} onChange={setStatusFilter} />
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
                      if (!Number.isNaN(dDate.getTime())) {
                        dDate.setHours(0, 0, 0, 0);
                        isOverdue = dDate.getTime() < todayMidnight.getTime();
                      }
                    }
                    let reportContent = <span style={{ opacity: 0.5 }}>No daily report submitted</span>;
                    if (task.daily_update) {
                      reportContent = <span>{task.daily_update}</span>;
                    } else if (task.remarks) {
                      reportContent = <span>{task.remarks}</span>;
                    }
                    return (
                      <tr key={taskId || index} className="table-row">
                        <td className="table-cell font-medium">{task.assign_to}</td>
                        <td className="table-cell font-medium">{task.task_name}</td>
                        <td className="table-cell">
                          <Badge variant={statusVariant(st)}>{st}</Badge>
                        </td>
                        <td className="table-cell text-muted" style={{ maxWidth: "16rem" }}>
                         {reportContent}
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
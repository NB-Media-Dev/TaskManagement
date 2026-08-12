import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { getAttendance } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, statusVariant, EmptyState, ErrorState, TableSkeleton } from '../../components/ui';

import { formatDate } from '../../utils/helpers';

export default function MyAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMine = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await getAttendance({ id: user?.email?.split('@')[0] });
        if (res.data.success) setRecords(res.data.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, [user]);

  return (
    <div className="dashboard-space-y">
      <div>
        <h1 className="dashboard-header-title">My Attendance</h1>
        <p className="dashboard-header-sub">Your check-in and check-out history.</p>
      </div>

      <Card className="ui-card-p6">
        {(() => {
          if (loading) return <TableSkeleton rows={5} cols={5} />;
          if (error) return <ErrorState onRetry={() => window.location.reload()} />;
          if (records.length === 0) return <EmptyState icon={Calendar} title="No attendance records yet" description="Your attendance history will appear here." />;
          return (
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell">Date</th>
                    <th className="table-cell">Check-in</th>
                    <th className="table-cell">Check-out</th>
                    <th className="table-cell">Work Hours</th>
                    <th className="table-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => (
                    <tr key={rec.attendance_id} className="table-row">
                      <td className="table-cell text-muted">{formatDate(rec.dates)}</td>
                      <td className="table-cell text-muted">{rec.checkin}</td>
                      <td className="table-cell text-muted">{rec.checkout}</td>
                      <td className="table-cell">{rec.workhours}</td>
                      <td className="table-cell">
                        <Badge variant={statusVariant(rec.status)} dot>
                          {rec.status}
                        </Badge>
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


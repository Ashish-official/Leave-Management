import { Check, RotateCw, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { adminApi, leaveApi } from '../api/client.js';
import AppLayout from '../components/AppLayout.jsx';
import { formatDate, getLeaveDays, statusClass } from '../utils/formatters.js';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryData, leaveData] = await Promise.all([
        adminApi.dashboard(),
        leaveApi.all(),
      ]);
      setSummary(summaryData);
      setLeaves(leaveData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, status) => {
    setError('');
    setMessage('');
    const payload = { status };

    if (status === 'REJECTED') {
      const reason = window.prompt('Rejection reason');
      if (reason) {
        payload.rejectionReason = reason;
      }
    }

    try {
      await leaveApi.updateStatus(id, payload);
      setMessage(`Leave request ${status.toLowerCase()}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const metrics = [
    ['Employees', summary?.totalEmployees ?? 0],
    ['Active', summary?.activeEmployees ?? 0],
    ['Pending', summary?.pendingRequests ?? 0],
    ['Approved', summary?.approvedRequests ?? 0],
    ['Rejected', summary?.rejectedRequests ?? 0],
    ['Cancelled', summary?.cancelledRequests ?? 0],
  ];

  return (
    <AppLayout>
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin Workspace</p>
          <h1>Leave approvals</h1>
        </div>
        <button className="icon-button" type="button" onClick={loadData} title="Refresh">
          <RotateCw size={18} />
        </button>
      </header>

      {error && <div className="alert">{error}</div>}
      {message && <div className="success">{message}</div>}

      <section className="balance-grid admin-metrics">
        {metrics.map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>All leave requests</h2>
        </div>

        {loading ? (
          <p className="muted">Loading requests...</p>
        ) : leaves.length === 0 ? (
          <p className="muted">No leave requests found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <strong>{leave.userId?.name || 'Unknown'}</strong>
                      <small>{leave.userId?.email}</small>
                    </td>
                    <td>{leave.leaveType}</td>
                    <td>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</td>
                    <td>{getLeaveDays(leave.startDate, leave.endDate)}</td>
                    <td><span className={statusClass(leave.status)}>{leave.status}</span></td>
                    <td>
                      {leave.status === 'PENDING' ? (
                        <div className="row-actions">
                          <button className="icon-button approve" type="button" onClick={() => updateStatus(leave._id, 'APPROVED')} title="Approve">
                            <Check size={18} />
                          </button>
                          <button className="icon-button danger" type="button" onClick={() => updateStatus(leave._id, 'REJECTED')} title="Reject">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="muted">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
};

export default AdminDashboard;

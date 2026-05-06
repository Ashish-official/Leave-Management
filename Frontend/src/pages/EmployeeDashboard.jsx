import { CalendarPlus, RotateCw, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { leaveApi } from '../api/client.js';
import AppLayout from '../components/AppLayout.jsx';
import { formatDate, getLeaveDays, statusClass } from '../utils/formatters.js';

const emptyForm = {
  leaveType: 'sick',
  startDate: '',
  endDate: '',
  reason: '',
};

const EmployeeDashboard = () => {
  const [balance, setBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [balanceData, leaveData] = await Promise.all([
        leaveApi.balance(),
        leaveApi.mine(),
      ]);
      setBalance(balanceData);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await leaveApi.apply(form);
      setForm(emptyForm);
      setMessage('Leave request submitted');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    setError('');
    setMessage('');
    try {
      await leaveApi.cancel(id);
      setMessage('Leave request cancelled');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout>
      <header className="page-header">
        <div>
          <p className="eyebrow">Employee Workspace</p>
          <h1>My leave requests</h1>
        </div>
        <button className="icon-button" type="button" onClick={loadData} title="Refresh">
          <RotateCw size={18} />
        </button>
      </header>

      {error && <div className="alert">{error}</div>}
      {message && <div className="success">{message}</div>}

      <section className="balance-grid">
        {['sick', 'casual', 'annual'].map((type) => (
          <div className="metric" key={type}>
            <span>{type}</span>
            <strong>{balance?.[type] ?? 0}</strong>
          </div>
        ))}
      </section>

      <section className="workspace-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="section-title">
            <CalendarPlus size={18} />
            <h2>Apply leave</h2>
          </div>

          <label>
            Leave type
            <select
              value={form.leaveType}
              onChange={(event) => setForm({ ...form, leaveType: event.target.value })}
            >
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
              <option value="annual">Annual</option>
            </select>
          </label>

          <div className="two-column">
            <label>
              Start date
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={form.endDate}
                onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              />
            </label>
          </div>

          <label>
            Reason
            <textarea
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              rows="4"
              placeholder="Brief reason for leave"
            />
          </label>

          <button className="primary-button" type="submit" disabled={submitting}>
            <CalendarPlus size={18} />
            <span>{submitting ? 'Submitting...' : 'Submit request'}</span>
          </button>
        </form>

        <section className="panel">
          <div className="section-title">
            <h2>History</h2>
          </div>

          {loading ? (
            <p className="muted">Loading leaves...</p>
          ) : leaves.length === 0 ? (
            <p className="muted">No leave requests yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.leaveType}</td>
                      <td>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</td>
                      <td>{getLeaveDays(leave.startDate, leave.endDate)}</td>
                      <td><span className={statusClass(leave.status)}>{leave.status}</span></td>
                      <td>
                        {leave.status === 'PENDING' && (
                          <button className="icon-button danger" type="button" onClick={() => handleCancel(leave._id)} title="Cancel">
                            <XCircle size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </AppLayout>
  );
};

export default EmployeeDashboard;

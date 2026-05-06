import { Plus, RotateCw, UserX } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/client.js';
import AppLayout from '../components/AppLayout.jsx';
import { formatDate } from '../utils/formatters.js';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  employeeId: '',
  department: '',
  designation: '',
  phone: '',
  joiningDate: '',
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const users = await adminApi.users();
      setEmployees(users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await adminApi.createUser(form);
      setForm(emptyForm);
      setMessage('User created');
      await loadEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deactivate = async (id) => {
    setError('');
    setMessage('');
    try {
      await adminApi.deactivateUser(id);
      setMessage('User deactivated');
      await loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout>
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin Workspace</p>
          <h1>Employees</h1>
        </div>
        <button className="icon-button" type="button" onClick={loadEmployees} title="Refresh">
          <RotateCw size={18} />
        </button>
      </header>

      {error && <div className="alert">{error}</div>}
      {message && <div className="success">{message}</div>}

      <section className="workspace-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="section-title">
            <Plus size={18} />
            <h2>Create user</h2>
          </div>

          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>

          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>

          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>

          <div className="two-column">
            <label>
              Role
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Employee ID
              <input value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} />
            </label>
          </div>

          <div className="two-column">
            <label>
              Department
              <input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
            </label>
            <label>
              Designation
              <input value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} />
            </label>
          </div>

          <div className="two-column">
            <label>
              Phone
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
            <label>
              Joining date
              <input type="date" value={form.joiningDate} onChange={(event) => setForm({ ...form, joiningDate: event.target.value })} />
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={submitting}>
            <Plus size={18} />
            <span>{submitting ? 'Creating...' : 'Create user'}</span>
          </button>
        </form>

        <section className="panel">
          <div className="section-title">
            <h2>User directory</h2>
          </div>

          {loading ? (
            <p className="muted">Loading employees...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Joining</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <strong>{employee.name}</strong>
                        <small>{employee.email}</small>
                      </td>
                      <td>{employee.role}</td>
                      <td>{employee.department || '-'}</td>
                      <td>{formatDate(employee.joiningDate)}</td>
                      <td><span className={employee.isActive ? 'status status-approved' : 'status status-rejected'}>{employee.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                      <td>
                        {employee.isActive && (
                          <button className="icon-button danger" type="button" onClick={() => deactivate(employee._id)} title="Deactivate">
                            <UserX size={18} />
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

export default Employees;

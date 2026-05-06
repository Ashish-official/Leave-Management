import { LogIn } from 'lucide-react';
import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await login(form);
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-screen">
      <form className="auth-panel" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Leave Management</p>
          <h1>Sign in</h1>
        </div>

        {error && <div className="alert">{error}</div>}

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="employee@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Minimum 6 characters"
          />
        </label>

        <button className="primary-button" type="submit" disabled={submitting}>
          <LogIn size={18} />
          <span>{submitting ? 'Signing in...' : 'Sign in'}</span>
        </button>

        <p className="auth-switch">
          New employee? <Link to="/register">Create account</Link>
        </p>
      </form>
    </section>
  );
};

export default Login;

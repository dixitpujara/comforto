import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/css/Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/catalog';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await login(email.trim(), password);
    setBusy(false);
    if (!res.ok) setError(res.error);
    else navigate(from, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sign In</h1>
        <p className="login-subtitle">Internal access for designers and sales associates.</p>

        <form onSubmit={onSubmit} className="login-form">
          <label>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-large" disabled={busy}>
            {busy ? 'Signing In…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

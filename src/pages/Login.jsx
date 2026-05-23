import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';
import '../assets/css/Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/catalog';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const res = login(email.trim(), password);
    if (!res.ok) setError(res.error);
    else navigate(from, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-brand" aria-label="Comforto Furniture">
          <img src={logo} alt="Comforto Furniture" />
        </Link>
        <h1>Staff Sign In</h1>
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
          <button type="submit" className="btn btn-primary btn-large">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

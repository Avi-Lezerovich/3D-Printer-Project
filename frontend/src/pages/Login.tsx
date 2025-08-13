import React from 'react';
import { login } from '../services/api';
import '../styles/login.css';

export default function Login() {
  const [email, setEmail] = React.useState('demo@example.com');
  const [password, setPassword] = React.useState('Password123!');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await login(email, password);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="login-form">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="btn btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in…' : 'Login'}
        </button>
      </form>
      {status === 'error' && (
        <p role="alert" className="status-message error">
          Login failed
        </p>
      )}
      {status === 'success' && (
        <p role="status" className="status-message success">
          Logged in
        </p>
      )}
    </div>
  );
}

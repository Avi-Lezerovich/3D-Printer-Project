import React from 'react';
import '../styles/login.css';
import { useAuthStore } from '../core/state/authStore';
function sanitizeInput(v:string){ return v.replace(/[<>"'`]/g,'').trim(); }

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const validateEmail = (email: string) => {
  const re = /^[\w.-]+@[\w-]+(?:\.[\w-]+)+$/;
    return re.test(email);
  };

  const authLogin = useAuthStore(s=>s.login);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    if (!validateEmail(email)) {
      setStatus('error');
      setError('Invalid email format.');
      return;
    }

    const ok = await authLogin(sanitizeInput(email).toLowerCase(), password);
    if(ok){
      setStatus('success');
    } else {
      setStatus('error');
      setError('Invalid email or password.');
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
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <button className="btn btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in…' : 'Login'}
        </button>
      </form>
      {status === 'error' && error && (
        <p role="alert" className="status-message error">
          {error}
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

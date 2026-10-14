import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, getToken, setToken } from '../services/api';
import { STORE_NAME } from '../config/store';
import '../styles/admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  if (getToken()) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await api.login(form.email, form.password);
      setToken(token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
    <form className="card login-card" onSubmit={submit}>
      <div className="login-head">
        <div className="login-icon" aria-hidden="true">🔒</div>
        <h1>Acceso administrador</h1>
        <p className="muted">{STORE_NAME}</p>
      </div>
      <div>
        <label htmlFor="email">Correo</label>
        <input id="email" type="email" autoComplete="username" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label htmlFor="password">Contraseña</label>
        <div className="password-field">
          <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {show ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>
      {error && <p className="status-error" role="alert">{error}</p>}
      <button className="btn" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
    </form>
    </div>
  );
}

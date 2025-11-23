import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ data }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const qrAttemptedRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // LOGIN VIA QR CODE
  const handleQRLogin = useCallback(async (qrData) => {
    if (!qrData.name || !qrData.userId || !qrData.timestamp) {
      setError('QR Code inválido ou incompleto');
      return;
    }

    setError(null);
    setLoading(true);

    try {
     const response = await fetch('/api/auth/login/qr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    qrCode: { 
      name: qrData.name,
      userId: qrData.userId,
      timestamp: qrData.timestamp
    }
  })
});
      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Login QR falhou');
      }

      // Salvar token e usuário
      localStorage.setItem('token', responseData.data.token);
      localStorage.setItem('user', JSON.stringify(responseData.data.user));
      window.dispatchEvent(new Event('userChanged'));

      // Redirecionar conforme role
      navigate(responseData.data.user.role === 'admin' ? '/produtos' : '/profile');

    } catch (err) {
      console.error('❌ Erro no login QR:', err);
      setError(err.message || 'Erro ao fazer login com QR Code');
      qrAttemptedRef.current = false; // permite nova tentativa
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // useEffect para login automático via QR
  useEffect(() => {
    const isQRDataComplete = data &&
                             data.isQrcode &&
                             data.name &&
                             data.userId &&
                             data.timestamp;

    if (isQRDataComplete && !qrAttemptedRef.current) {
      qrAttemptedRef.current = true;
      console.log('🔄 Login automático com QR Code iniciado');
      handleQRLogin({
        name: data.name,
        userId: data.userId,
        timestamp: data.timestamp
      });
    } else if (data && data.isQrcode && !isQRDataComplete) {
      console.warn('❌ Dados do QR Code incompletos, login automático não iniciado:', data);
    }
  }, [data, handleQRLogin]);

  // LOGIN NORMAL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Login falhou');
      }

      localStorage.setItem('token', responseData.data.token);
      localStorage.setItem('user', JSON.stringify(responseData.data.user));
      window.dispatchEvent(new Event('userChanged'));

      setFormData({ username: '', password: '' });
      navigate(responseData.data.user.role === 'admin' ? '/produtos' : '/profile');

    } catch (err) {
      console.error('❌ Erro no login:', err);
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">A processar login...</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Email ou Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="exemplo@email.com ou username"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Palavra-passe:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Sua palavra-passe"
            disabled={loading}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <Link to="/recuperar-password" className="forgot-password">
        Esqueci-me da palavra-passe
      </Link>

      <div className="login-footer">
        <p>Não tem conta? <Link to="/register">Registe-se aqui</Link></p>
      </div>
    </div>
  );
};

export default Login;

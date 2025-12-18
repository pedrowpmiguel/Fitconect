import React, { useState } from 'react';
import './TrainerRequestForm.scss';

export default function TrainerRequestForm({ trainerId, trainerName, onSuccess }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/trainer-requests/request/${trainerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao enviar pedido');
      }

      setSuccess(true);
      setMessage('');
      
      if (onSuccess) {
        onSuccess(data.data);
      }

    } catch (err) {
      setError(err.message || 'Erro ao enviar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trainer-request-form">
      <h3>Solicitar como Personal Trainer</h3>
      <p className="subtitle">Envie um pedido para {trainerName || 'este Personal Trainer'}</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Pedido enviado com sucesso! O PT irá responder em breve.</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="message">Mensagem (opcional):</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Deixe uma mensagem a explicar por que quer trabalhar com este PT..."
            rows="4"
            disabled={loading || success}
          />
        </div>

        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading || success}
        >
          {loading ? 'Enviando...' : success ? 'Pedido Enviado' : 'Enviar Pedido'}
        </button>
      </form>
    </div>
  );
}

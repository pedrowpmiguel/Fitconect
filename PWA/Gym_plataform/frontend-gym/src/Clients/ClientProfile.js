import React, { useEffect, useState } from 'react';
import './ClientProfile.css';

export default function ClientProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Não autenticado. Faça login.');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/profile', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Erro ${res.status}`);
        }

        const data = await res.json();
        setUser(data.data.user);
      } catch (err) {
        setError(err.message || 'Erro ao obter perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="client-profile"><p>Carregando perfil...</p></div>;
  if (error) return <div className="client-profile error"><p>{error}</p></div>;
  if (!user) return <div className="client-profile"><p>Perfil não disponível.</p></div>;

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <div className="client-profile">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Avatar" />
            ) : (
              <div className="initials">{(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}</div>
            )}
          </div>
          <div className="profile-info">
            <h2>{user.firstName} {user.lastName}</h2>
            <p className="muted">@{user.username} • {user.role}</p>
          </div>
        </div>

        <div className="profile-body">
          <div className="row">
            <div className="label">Email</div>
            <div className="value">{user.email}</div>
          </div>

          <div className="row">
            <div className="label">Telefone</div>
            <div className="value">{user.phone || '-'}</div>
          </div>

          <div className="row">
            <div className="label">Data de Nascimento</div>
            <div className="value">{formatDate(user.dateOfBirth)}</div>
          </div>

          <div className="row">
            <div className="label">Status</div>
            <div className="value">{user.isActive ? 'Ativo' : 'Inativo'}</div>
          </div>

          <div className="row">
            <div className="label">Personal Trainer</div>
            <div className="value">{user.assignedTrainer ? (typeof user.assignedTrainer === 'object' ? `${user.assignedTrainer.firstName || ''} ${user.assignedTrainer.lastName || ''}` : user.assignedTrainer) : 'Nenhum'}</div>
          </div>

          {user.qrCode && (
            <div className="row">
              <div className="label">QR Code</div>
              <div className="value"><img src={user.qrCode} alt="QR Code" className="qr"/></div>
            </div>
          )}

          {user.bio && (
            <div className="row">
              <div className="label">Sobre</div>
              <div className="value">{user.bio}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

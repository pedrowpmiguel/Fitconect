import React, { useEffect, useState } from 'react';
import './Profile.scss';

export default function TrainerProfile() {
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
          method: 'GET',
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
        console.log('Perfil do PT recebido:', data.data.user);
        setUser(data.data.user);
      } catch (err) {
        setError(err.message || 'Erro ao obter perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString();
    } catch {
      return d;
    }
  };

  if (loading) return <div className="trainer-profile"><p>Carregando perfil...</p></div>;
  if (error) return <div className="trainer-profile error"><p>{error}</p></div>;
  if (!user) return <div className="trainer-profile"><p>Perfil não disponível.</p></div>;

  return (
    <div className="trainer-profile">
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
            <div className="label">Género</div>
            <div className="value">
              {user.gender ? (user.gender === 'male' ? 'Masculino' : user.gender === 'female' ? 'Feminino' : 'Outro') : '-'}
            </div>
          </div>

          <div className="row">
            <div className="label">Status</div>
            <div className="value">{user.isActive ? 'Ativo' : 'Inativo'}</div>
          </div>

          <div className="row">
            <div className="label">Aprovado</div>
            <div className="value">{user.isApproved ? 'Sim' : 'Aguardando aprovação'}</div>
          </div>

          {/* Seção QR Code */}
          {user.qrCode && (
            <div className="qr-section">
              <h3>QR Code para Login Rápido</h3>
              <div className="qr-container">
                <img src={user.qrCode} alt="QR Code" className="qr-image"/>
              </div>
              <p className="qr-hint">Use este QR Code para fazer login rapidamente</p>
            </div>
          )}

          {!user.qrCode && (
            <div className="qr-section">
              <h3>QR Code</h3>
              <p className="qr-unavailable">
                QR Code não disponível. Faça logout e login novamente para gerar.
              </p>
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

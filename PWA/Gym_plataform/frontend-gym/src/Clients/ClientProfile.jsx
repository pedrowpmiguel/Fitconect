import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientProfile.scss';

export default function ClientProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Não autenticado. Faça login.');
      setLoading(false);
      return;
    }

    const fetchProfileAndWorkouts = async () => {
      try {
        // Fetch profile
        const profileRes = await fetch('/api/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!profileRes.ok) {
          throw new Error('Erro ao obter perfil');
        }

        const profileData = await profileRes.json();
        const userData = profileData.data.user || profileData.data;
        setUser(userData);

        // Fetch recent workouts
        try {
          const workoutsRes = await fetch('/api/client-workouts/logs?limit=5', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (workoutsRes.ok) {
            const workoutsData = await workoutsRes.json();
            setRecentWorkouts(workoutsData.data?.logs || []);
          }
        } catch (err) {
          console.error('Erro ao carregar treinos:', err);
        }
      } catch (err) {
        setError(err.message || 'Erro ao obter perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndWorkouts();
  }, []);

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('pt-PT');
    } catch {
      return d;
    }
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (loading) {
    return <div className="client-profile loading"><p>Carregando perfil...</p></div>;
  }

  if (error) {
    return <div className="client-profile error-container"><p> {error}</p></div>;
  }

  if (!user) {
    return <div className="client-profile"><p>Perfil não disponível.</p></div>;
  }

  return (
    <div className="client-profile">
      {/* HEADER COM NOME E BOTÃO EDITAR */}
      <div className="profile-header-section">
        <div className="profile-header-content">
          <div className="header-text">
            <h1 className="user-name">{user.firstName} {user.lastName}</h1>
            <p className="user-role">Cliente</p>
          </div>
          <button className="btn-edit-profile" onClick={handleEditProfile}>
            Editar Perfil
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="profile-content">
        {/* SEÇÃO ESQUERDA - INFORMAÇÕES PESSOAIS E ENDEREÇO */}
        <div className="profile-left">
          {/* INFORMAÇÕES PESSOAIS */}
          <div className="info-section">
            <h3 className="section-title">Informações Pessoais</h3>
            
            <div className="info-group">
              <div className="info-item">
                <span className="info-label">✉</span>
                <div>
                  <p className="info-label-text">Email</p>
                  <p className="info-value">{user.email || '-'}</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-label">🕻</span>
                <div>
                  <p className="info-label-text">Telefone</p>
                  <p className="info-value">{user.phone || '-'}</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-label">🗓</span>
                <div>
                  <p className="info-label-text">Data de Nascimento</p>
                  <p className="info-value">{formatDate(user.dateOfBirth)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ENDEREÇO */}
          {(user.address || user.city || user.postalCode) && (
            <div className="info-section">
              <h3 className="section-title">Endereço</h3>
              
              <div className="info-group">
                {user.address && (
                  <div className="info-item">
                    <span className="info-label">📍</span>
                    <div>
                      <p className="info-label-text">Endereço</p>
                      <p className="info-value">{user.address}</p>
                    </div>
                  </div>
                )}

                {user.postalCode && (
                  <div className="info-item">
                    <span className="info-label">📮</span>
                    <div>
                      <p className="info-label-text">Código Postal</p>
                      <p className="info-value">{user.postalCode}</p>
                    </div>
                  </div>
                )}

                {user.city && (
                  <div className="info-item">
                    <span className="info-label">🏙️</span>
                    <div>
                      <p className="info-label-text">Cidade</p>
                      <p className="info-value">{user.city}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SEÇÃO DIREITA - VAZIA (PARA FUTUROS CONTEÚDOS) */}
        <div className="profile-right">
          {/* Espaço reservado para conteúdo futuro */}
        </div>
      </div>

      {/* SEÇÃO FULL-WIDTH - ÚLTIMOS TREINOS */}
      <div className="recent-workouts-section">
        <div className="info-section">
          <h3 className="section-title">Últimos Treinos</h3>
          
          {recentWorkouts.length > 0 ? (
            <div className="workouts-table">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo de Treino</th>
                    <th>Duração</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWorkouts.map((workout, index) => (
                    <tr key={index}>
                      <td>{formatDate(workout.date)}</td>
                      <td>{workout.workoutType || 'Treino'}</td>
                      <td>{workout.duration || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">Nenhum treino registado ainda.</p>
          )}
        </div>
      </div>

      {/* TREINADOR ATRIBUÍDO */}
      {user.assignedTrainer && (
        <div className="trainer-section">
          <h3 className="section-title">Meu Treinador</h3>
          <div className="trainer-card">
            <div className="trainer-info">
              <h4>
                {typeof user.assignedTrainer === 'object' 
                  ? `${user.assignedTrainer.firstName || ''} ${user.assignedTrainer.lastName || ''}`
                  : user.assignedTrainer
                }
              </h4>
              {user.assignedTrainer.email && (
                <p className="trainer-email">
                  <a href={`mailto:${user.assignedTrainer.email}`}>
                    {user.assignedTrainer.email}
                  </a>
                </p>
              )}
            </div>
            <button className="btn-contact-trainer">Contactar Treinador</button>
          </div>
        </div>
      )}
    </div>
  );
}
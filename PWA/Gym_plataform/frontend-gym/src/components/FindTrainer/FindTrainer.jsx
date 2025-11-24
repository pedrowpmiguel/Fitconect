import React, { useState, useEffect } from 'react';
import TrainerRequestForm from '../TrainerRequestForm/TrainerRequestForm';
import './FindTrainer.scss';

export default function FindTrainer() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadTrainers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users?role=trainer', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao carregar trainers');
      }

      setTrainers(data.data?.users || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar trainers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="find-trainer"><p>Carregando trainers...</p></div>;
  if (error) return <div className="find-trainer error"><p>{error}</p></div>;

  return (
    <div className="find-trainer">
      <h1>Encontre seu Personal Trainer</h1>
      <p className="subtitle">Selecione um trainer e envie um pedido para trabalhar com ele</p>

      {trainers.length === 0 ? (
        <div className="no-trainers">
          <p>Nenhum Personal Trainer disponível no momento.</p>
        </div>
      ) : (
        <div className="trainers-grid">
          {trainers.map(trainer => (
            <div key={trainer._id} className="trainer-card">
              <div className="trainer-header">
                <div className="avatar">
                  {trainer.profileImage ? (
                    <img src={trainer.profileImage} alt={trainer.firstName} />
                  ) : (
                    <div className="initials">
                      {(trainer.firstName?.[0] || '') + (trainer.lastName?.[0] || '')}
                    </div>
                  )}
                </div>
                <div className="trainer-info">
                  <h3>{trainer.firstName} {trainer.lastName}</h3>
                  <p className="username">@{trainer.username}</p>
                  {trainer.isApproved && <p className="approved">✓ Aprovado</p>}
                </div>
              </div>

              {trainer.bio && (
                <div className="trainer-bio">
                  <p>{trainer.bio}</p>
                </div>
              )}

              <div className="trainer-contact">
                <p><strong>Email:</strong> {trainer.email}</p>
                {trainer.phone && <p><strong>Telefone:</strong> {trainer.phone}</p>}
              </div>

              <button 
                className="btn-expand"
                onClick={() => setSelectedTrainer(selectedTrainer === trainer._id ? null : trainer._id)}
              >
                {selectedTrainer === trainer._id ? '▼ Fechar' : '▶ Ver mais'}
              </button>

              {selectedTrainer === trainer._id && (
                <TrainerRequestForm 
                  trainerId={trainer._id}
                  trainerName={`${trainer.firstName} ${trainer.lastName}`}
                  onSuccess={() => {
                    alert('Pedido enviado com sucesso!');
                    setSelectedTrainer(null);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

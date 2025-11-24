import React, { useEffect, useState } from 'react';
import './Dashboard.scss'; 

export default function TrainerDashboard() {
  const [view, setView] = useState('dashboard'); // 'dashboard' ou 'create_plan'
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para o Formulário de Novo Plano
  const [exercisesList, setExercisesList] = useState([]); // Lista de exercícios do BD
  const [newPlan, setNewPlan] = useState({
    name: '',
    clientId: '', // Num cenário real, seria um select box com os clientes do PT
    frequency: '3x',
    totalWeeks: 4,
    startDate: new Date().toISOString().split('T')[0],
    sessions: [] // Começa vazio, vamos adicionar dinamicamente
  });

  const token = localStorage.getItem('token');

  // 1. Carregar Dados Iniciais (Stats e Planos)
  useEffect(() => {
    if (!token) return;
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Buscar Stats
      const resStats = await fetch('/api/workouts/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataStats = await resStats.json();
      if(dataStats.success) setStats(dataStats.data);

      // Buscar Planos Existentes
      const resPlans = await fetch('/api/workouts/plans?limit=5&sortOrder=desc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataPlans = await resPlans.json();
      if(dataPlans.success) setPlans(dataPlans.data.plans);

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Carregar Exercícios quando abrir o modo de criação
  const handleOpenCreate = async () => {
    setView('create_plan');
    try {
      // Buscar exercícios para o dropdown
      const res = await fetch('/api/workouts/exercises?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setExercisesList(data.data.exercises);
    } catch (err) {
      console.error("Erro ao carregar exercícios", err);
    }
  };

  // 3. Funções auxiliares do Formulário
  const addSession = () => {
    // Adiciona uma estrutura de sessão vazia ao plano
    setNewPlan({
      ...newPlan,
      sessions: [
        ...newPlan.sessions,
        { name: `Treino ${newPlan.sessions.length + 1}`, exercises: [] }
      ]
    });
  };

  const addExerciseToSession = (sessionIndex, exerciseId) => {
    if (!exerciseId) return;
    const updatedSessions = [...newPlan.sessions];
    updatedSessions[sessionIndex].exercises.push({
      exercise: exerciseId, // O ID do exercício selecionado
      sets: 3,
      repetitions: '10-12',
      notes: ''
    });
    setNewPlan({ ...newPlan, sessions: updatedSessions });
  };

  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    try {
      // Validação básica
      if (newPlan.sessions.length === 0) {
        alert("Adicione pelo menos uma sessão de treino.");
        return;
      }

      // POST para criar o plano
      const res = await fetch('/api/workouts/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPlan)
      });

      const result = await res.json();

      if (result.success) {
        alert('Plano criado com sucesso!');
        setView('dashboard');
        loadDashboardData(); // Recarrega a lista
        // Resetar form...
      } else {
        alert(`Erro: ${result.message}`);
        console.log(result.errors);
      }
    } catch (err) {
      alert('Erro ao enviar plano.');
    }
  };

  if (loading) return <div>Carregando dashboard...</div>;

  return (
    <div className="trainer-dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Painel do Personal Trainer</h1>
        {view === 'dashboard' && (
          <button className="btn-primary" onClick={handleOpenCreate}>
            + Criar Novo Plano
          </button>
        )}
        {view === 'create_plan' && (
          <button className="btn-secondary" onClick={() => setView('dashboard')}>
            Voltar
          </button>
        )}
      </div>

      {/* VIEW: DASHBOARD (Stats + Lista) */}
      {view === 'dashboard' && stats && (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="card stat">
              <h3>Total Planos</h3>
              <p>{stats.totalPlans}</p>
            </div>
            <div className="card stat">
              <h3>Planos Ativos</h3>
              <p>{stats.activePlans}</p>
            </div>
            <div className="card stat">
              <h3>Clientes Totais</h3>
              <p>{stats.totalClients}</p>
            </div>
            <div className="card stat">
              <h3>Taxa Média Conclusão</h3>
              <p>{Math.round(stats.avgCompletionRate)}%</p>
            </div>
          </div>

          {/* Lista Recente */}
          <div className="recent-plans-section">
            <h2>Planos Recentes</h2>
            <table className="plans-table">
              <thead>
                <tr>
                  <th>Nome do Plano</th>
                  <th>Cliente</th>
                  <th>Frequência</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan._id}>
                    <td>{plan.name}</td>
                    <td>{plan.client ? `${plan.client.firstName} ${plan.client.lastName}` : 'N/A'}</td>
                    <td>{plan.frequency}</td>
                    <td>
                      <span className={`status-badge ${plan.isActive ? 'active' : 'inactive'}`}>
                        {plan.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* VIEW: CRIAR PLANO (Formulário) */}
      {view === 'create_plan' && (
        <div className="create-plan-container">
          <h2>Novo Plano de Treino</h2>
          <form onSubmit={handleSubmitPlan}>
            
            {/* Detalhes Básicos */}
            <div className="form-row">
              <div className="form-group">
                <label>Nome do Plano</label>
                <input 
                  type="text" 
                  value={newPlan.name} 
                  onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>ID do Cliente</label>
                <input 
                  type="text" 
                  placeholder="ID do MongoDB do Cliente"
                  value={newPlan.clientId} 
                  onChange={e => setNewPlan({...newPlan, clientId: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Frequência</label>
                <select 
                  value={newPlan.frequency}
                  onChange={e => setNewPlan({...newPlan, frequency: e.target.value})}
                >
                  <option value="3x">3x por Semana</option>
                  <option value="4x">4x por Semana</option>
                  <option value="5x">5x por Semana</option>
                </select>
              </div>
              <div className="form-group">
                <label>Total Semanas</label>
                <input 
                  type="number" 
                  value={newPlan.totalWeeks}
                  onChange={e => setNewPlan({...newPlan, totalWeeks: Number(e.target.value)})} 
                />
              </div>
            </div>

            <hr />

            {/* Gerenciamento de Sessões */}
            <div className="sessions-builder">
              <h3>Sessões de Treino</h3>
              {newPlan.sessions.map((session, sIndex) => (
                <div key={sIndex} className="session-card">
                  <input 
                    className="session-title-input"
                    value={session.name}
                    onChange={e => {
                      const ups = [...newPlan.sessions];
                      ups[sIndex].name = e.target.value;
                      setNewPlan({...newPlan, sessions: ups});
                    }}
                  />
                  
                  {/* Lista de Exercícios desta Sessão */}
                  <div className="exercises-list">
                    {session.exercises.map((ex, exIndex) => (
                      <div key={exIndex} className="exercise-item">
                        <small>Exercício ID: {ex.exercise} | Séries: {ex.sets}</small>
                      </div>
                    ))}
                  </div>

                  {/* Adicionar Exercício à Sessão */}
                  <div className="add-exercise-control">
                    <select id={`select-ex-${sIndex}`}>
                      <option value="">Selecione um exercício...</option>
                      {exercisesList.map(ex => (
                        <option key={ex._id} value={ex._id}>{ex.name}</option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      onClick={() => {
                        const select = document.getElementById(`select-ex-${sIndex}`);
                        addExerciseToSession(sIndex, select.value);
                      }}
                    >
                      + Add Exercício
                    </button>
                  </div>
                </div>
              ))}

              <button type="button" className="btn-add-session" onClick={addSession}>
                + Nova Sessão (Treino)
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save-plan">Salvar Plano</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
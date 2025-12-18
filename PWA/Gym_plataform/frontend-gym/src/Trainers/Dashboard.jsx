import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerRequestsManager from '../components/TrainerRequestsManager/TrainerRequestsManager';
import './Dashboard.scss'; 

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard'); // 'dashboard', 'create_plan', ou 'requests'
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  
  // Estado para o Formulário de Novo Plano
  const [exercisesList, setExercisesList] = useState([]); // Lista de exercícios do BD
  const [newPlan, setNewPlan] = useState({
    name: '',
    clientId: '', 
    frequency: '3x',
    totalWeeks: 4,
    startDate: new Date().toISOString().split('T')[0],
    sessions: [] // Começa vazio, vamos adicionar dinamicamente
  });

  const token = localStorage.getItem('token');

  const loadUserProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUser(data.data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
      // Erro ao carregar dados
    } finally {
      setLoading(false);
    }
  };

  // 1. Carregar Dados Iniciais (Stats, Planos e Usuário)
  useEffect(() => {
    if (!token) return;
    loadDashboardData();
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
        { 
          dayOfWeek: 'monday', // Adicionar dayOfWeek com valor padrão
          exercises: [] 
        }
      ]
    });
  };

  const addExerciseToSession = (sessionIndex, exerciseId) => {
    if (!exerciseId) return;
    const updatedSessions = [...newPlan.sessions];
    updatedSessions[sessionIndex].exercises.push({
      exercise: exerciseId,
      sets: 3,
      reps: '10-12',
      order: updatedSessions[sessionIndex].exercises.length + 1
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
    <div className="trainer-dashboard-wrapper">
      {/* LOGOUT BUTTON - TOP RIGHT */}
      <div className="logout-fixed-container">
        {user && <span className="user-name-fixed">{user.firstName} {user.lastName}</span>}
        <button className="btn-logout-fixed" onClick={handleLogout} title="Fazer logout">
          ➜] Sair
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`trainer-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Fitconect</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '×' : '☰'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-label">Dashboard</span>}
          </button>
          
          <button 
            className={`nav-item ${view === 'create_plan' ? 'active' : ''}`}
            onClick={handleOpenCreate}
          >
            <span className="nav-icon">➕</span>
            {sidebarOpen && <span className="nav-label">Criar Plano</span>}
          </button>
          
          <button 
            className={`nav-item ${view === 'requests' ? 'active' : ''}`}
            onClick={() => setView('requests')}
          >
            <span className="nav-icon">🔔</span>
            {sidebarOpen && <span className="nav-label">Pedidos</span>}
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="trainer-main-content">
        <div className="dashboard-header">
          <h1>{view === 'dashboard' ? 'Painel do Personal Trainer' : view === 'create_plan' ? 'Criar Plano de Treino' : 'Pedidos de Clientes'}</h1>
        </div>

        <div className="dashboard-content">
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
                  <div className="session-header">
                    <div className="form-group">
                      <label>Dia da Semana</label>
                      <select 
                        value={session.dayOfWeek || 'monday'}
                        onChange={e => {
                          const ups = [...newPlan.sessions];
                          ups[sIndex].dayOfWeek = e.target.value;
                          setNewPlan({...newPlan, sessions: ups});
                        }}
                      >
                        <option value="monday">Segunda-feira</option>
                        <option value="tuesday">Terça-feira</option>
                        <option value="wednesday">Quarta-feira</option>
                        <option value="thursday">Quinta-feira</option>
                        <option value="friday">Sexta-feira</option>
                        <option value="saturday">Sábado</option>
                        <option value="sunday">Domingo</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Lista de Exercícios desta Sessão */}
                  <div className="exercises-list">
                    {session.exercises.map((ex, exIndex) => {
                      const exerciseName = exercisesList.find(e => e._id === ex.exercise)?.name || 'Desconhecido';
                      return (
                        <div key={exIndex} className="exercise-item">
                          <div className="exercise-info">
                            <span className="exercise-name">{exerciseName}</span>
                            <div className="exercise-details">
                              <input
                                type="number"
                                placeholder="Séries"
                                value={ex.sets}
                                onChange={(e) => {
                                  const ups = [...newPlan.sessions];
                                  ups[sIndex].exercises[exIndex].sets = parseInt(e.target.value);
                                  setNewPlan({...newPlan, sessions: ups});
                                }}
                                min="1"
                                max="10"
                              />
                              <input
                                type="text"
                                placeholder="Reps (ex: 10-12)"
                                value={ex.reps}
                                onChange={(e) => {
                                  const ups = [...newPlan.sessions];
                                  ups[sIndex].exercises[exIndex].reps = e.target.value;
                                  setNewPlan({...newPlan, sessions: ups});
                                }}
                              />
                              <button
                                type="button"
                                className="btn-remove-exercise"
                                onClick={() => {
                                  const ups = [...newPlan.sessions];
                                  ups[sIndex].exercises.splice(exIndex, 1);
                                  setNewPlan({...newPlan, sessions: ups});
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

        {/* VIEW: PEDIDOS DE CLIENTES */}
        {view === 'requests' && (
          <TrainerRequestsManager />
        )}
        </div>
      </div>
    </div>
  );
}
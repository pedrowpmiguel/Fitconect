import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import "./Dashboard.scss";

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("/api/client/workouts/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboard(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar dashboard", err);
      setError(err.message || "Erro ao carregar dashboard");
      setLoading(false);
    }
  };

  if (loading) return <div className="loader">A carregar...</div>;
  if (error) return <div className="error">Erro: {error}</div>;
  if (!dashboard) return <div className="error">Nenhum dado disponível.</div>;

  // Usando destructuring com valores padrão para evitar erros
  const { plan, statistics, charts } = dashboard;

  // Se statistics ou charts forem undefined, usamos objetos vazios
  const {
    totalCompleted = 0,
    totalNotCompleted = 0,
    completionRate = 0,
    avgWeeklyCompleted = 0,
    avgMonthlyCompleted = 0
  } = statistics || {};

  const {
    weekly = [],
    monthly = []
  } = charts || {};

  return (
    <div className="client-dashboard-container">
      <h1 className="dashboard-title">Dashboard do Cliente</h1>

      {/* ------------------ PLANO ATIVO ------------------ */}
      <div className="plan-card">
        {plan ? (
          <>
            <h2>{plan.name}</h2>
            <p>
              Semana atual: {plan.currentWeek} / {plan.totalWeeks}
            </p>
            <p>Taxa de progresso: {plan.completionRate}%</p>
          </>
        ) : (
          <p>Nenhum plano ativo de momento.</p>
        )}
      </div>

      {/* ------------------ ESTATÍSTICAS ------------------ */}
      <div className="stats-cards">
        <div className="stat-card">
          <h4>Treinos Completos</h4>
          <p>{totalCompleted}</p>
        </div>

        <div className="stat-card">
          <h4>Treinos Não Completos</h4>
          <p>{totalNotCompleted}</p>
        </div>

        <div className="stat-card">
          <h4>Taxa de Sucesso</h4>
          <p>{completionRate}%</p>
        </div>

        <div className="stat-card">
          <h4>Média Semanal</h4>
          <p>{avgWeeklyCompleted}</p>
        </div>

        <div className="stat-card">
          <h4>Média Mensal</h4>
          <p>{avgMonthlyCompleted}</p>
        </div>
      </div>

      {/* ------------------ GRÁFICO SEMANAL ------------------ */}
      <div className="chart-card">
        <h3>Progresso Semanal</h3>
        {weekly.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" />
              <Line type="monotone" dataKey="notCompleted" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>Não há dados semanais para exibir.</p>
        )}
      </div>

      {/* ------------------ GRÁFICO MENSAL ------------------ */}
      <div className="chart-card">
        <h3>Progresso Mensal</h3>
        {monthly.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#22c55e" />
              <Bar dataKey="notCompleted" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>Não há dados mensais para exibir.</p>
        )}
      </div>

      {/* ------------------ ÚLTIMOS TREINOS ------------------ */}
      <div className="recent-workouts">
        <h3>Últimos Treinos</h3>
        {weekly.length > 0 ? (
          <ul>
            {[...weekly].reverse().slice(0, 5).map((item, i) => (
              <li key={i}>
                <span>{item.period}</span>
                <span className={item.completed > 0 ? "success" : "fail"}>
                  {item.completed > 0 ? "Completo" : "Não completo"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há treinos recentes para exibir.</p>
        )}
      </div>
    </div>
  );
}
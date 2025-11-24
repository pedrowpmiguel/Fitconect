import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Register from './Auth/Register';
import ClientProfile from './Clients/ClientProfile';
import TrainerProfile from './Trainers/TrainerProfile';
import ClientDashboard from './Clients/Dashboard';
import TrainerDashboard from './Trainers/Dashboard';
import './App.scss';

function App() {

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const getUserRole = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : null;
  };

  const getRedirectPath = () => {
    const role = getUserRole();
    switch (role) {
      case 'admin':
        return '/produtos';
      case 'trainer':
        return '/dashboard';
      case 'client':
        return '/client/dashboard';  
      default:
        return '/login';
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>

          {/* Login */}
          <Route 
            path="/login" 
            element={
              isAuthenticated() ? (
                <Navigate to={getRedirectPath()} />
              ) : (
                <HomePage />
              )
            } 
          />

          {/* Registo */}
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route 
            path="/produtos" 
            element={
              isAuthenticated() && getUserRole() === 'admin' ? (
                <div className="placeholder-page">
                  <h1>Página de Produtos (Admin)</h1>
                  <p>Esta página será implementada em breve.</p>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/login';
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* Dashboard treinador */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated() && getUserRole() === 'trainer' ? (
                <TrainerDashboard />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* Dashboard cliente */}
          <Route
            path="/client/dashboard"
            element={
              isAuthenticated() && getUserRole() === 'client' ? (
                <ClientDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Perfil cliente*/}
          <Route
            path="/profile"
            element={
              isAuthenticated() ? (
                getUserRole() === 'client' ? <ClientProfile /> : <Navigate to={getUserRole() === 'trainer' ? '/trainer/profile' : '/login'} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Perfil do trainer */}
          <Route
            path="/trainer/profile"
            element={
              isAuthenticated() && getUserRole() === 'trainer' ? (
                <TrainerProfile />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Rota raiz → redireciona */}
          <Route 
            path="/" 
            element={
              isAuthenticated() ? (
                <Navigate to={getRedirectPath()} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* Rota desconhecida */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

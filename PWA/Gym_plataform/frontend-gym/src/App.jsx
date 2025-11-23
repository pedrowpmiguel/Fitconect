import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Register from './Auth/Register';
import ClientProfile from './Clients/ClientProfile';
import './App.scss';

function App() {
  // Verifica se o user está autenticado
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const getUserRole = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : null;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota de Login (agora com HomePage que inclui QR Code) */}
          <Route 
            path="/login" 
            element={
              isAuthenticated() ? (
                <Navigate to={getUserRole() === 'admin' ? '/produtos' : '/profile'} />
              ) : (
                <HomePage />
              )
            } 
          />
          
          {/* Rota de Registo */}
          <Route path="/register" element={<Register />} />

          {/* Rota de Produtos (Admin) */}
          <Route 
            path="/produtos" 
            element={
              isAuthenticated() && getUserRole() === 'admin' ? (
                <div className="placeholder-page">
                  <h1>Página de Produtos (Admin)</h1>
                  <p>Esta página será implementada em breve.</p>
                  <button onClick={() => {
                    localStorage.clear();
                    window.location.href = '/login';
                  }}>
                    Logout
                  </button>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* Rota Principal (Dashboard) */}
          <Route 
            path="/" 
            element={
              isAuthenticated() ? (
                getUserRole() === 'admin' ? (
                  <Navigate to="/produtos" />
                ) : (
                  <Navigate to="/profile" />
                )
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* Rota de Perfil do Cliente */}
          <Route
            path="/profile"
            element={
              isAuthenticated() ? (
                <ClientProfile />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Rota padrão - redireciona para raiz */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
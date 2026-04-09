import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import PropertiesListing from './pages/PropertiesListing';
import PropertyDetail from './pages/PropertyDetail';
import ScrollToTop from './components/ui/ScrollToTop';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import UserMenu from './components/ui/UserMenu';
import ConfirmDialog from './components/ui/ConfirmDialog';

/**
 * App Root: Arquitetura Global Light Mode Premium.
 * Implementa Header Sticky com Glassmorphism (Modo Claro) e tipografia Jakarta.
 */
function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const handleLogout = () => {
    if (window.confirm("Você realmente deseja encerrar sua sessão atual? Todos os acessos protegidos serão desabilitados.")) {
      logout();
    }
  };

  return (
    <Router>
      <ScrollToTop />

      <div className="min-h-screen bg-slate-50 flex flex-col font-jakarta">
        {/* Header Profissional (Light Mode) */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200/50">
          <div className="container mx-auto px-6 h-20 flex justify-between items-center">
            {/* Logo Profissional */}
            <Link to="/" className="flex items-center gap-2 group no-underline">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white group-hover:rotate-6 transition-all">
                <i className="fa-solid fa-house-chimney text-lg"></i>
              </div>
              <span className="text-xl font-bold tracking-tighter text-slate-900">
                IMOBILIÁRIA<span className="text-blue-600">HUB</span>
              </span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="flex items-center gap-4 lg:gap-10">
              {isAuthenticated && user ? (
                <UserMenu onLogoutClick={handleLogout} />
              ) : (
                <Link to="/login" className="flex items-center gap-3 px-4 md:px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl transition-all active:scale-95 border border-slate-200 shadow-sm">
                  <i className="fa-regular fa-circle-user text-[16px] text-slate-400"></i>
                  <span className="text-[14px] font-bold hidden md:block">Minha Conta</span>
                </Link>
              )}
            </nav>
          </div>
        </header>

        {/* Dynamic Route Section */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/imoveis" element={<PropertiesListing />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/favoritos" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/minhas-propriedades" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </main>

        {/* Footer Minimalista */}
        <footer className="py-20 border-t border-slate-200/50 bg-white">
          <div className="container mx-auto px-6 text-center">
            <div className="mb-6 flex justify-center items-center gap-3">
              <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center text-white">
                <i className="fa-solid fa-house-user text-[14px]"></i>
              </div>
              <span className="text-[14px] font-black tracking-tighter">IMOBILIÁRIA HUB</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
              © 2026 Imobiliária Hub — Desafio Técnico Pedro. <br />
              <span className="opacity-70 mt-2 block italic">Desenvolvido com foco em Alto Padrão e Engenharia Sênior.</span>
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

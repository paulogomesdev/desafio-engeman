import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PropertiesListing from './pages/PropertiesListing';
import PropertyDetail from './pages/PropertyDetail';
import ScrollToTop from './components/ui/ScrollToTop';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MyProperties from './pages/MyProperties';
import PropertyForm from './pages/PropertyForm';
import ProtectedRoute from './context/ProtectedRoute';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import UserMenu from './components/ui/UserMenu';
/**
 * Componente Header com navegação inteligente (Active State)
 */
const MainHeader = ({ isAuthenticated, user, onLogoutClick }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'HOME', path: '/', icon: 'fa-solid fa-house' },
    { name: 'IMÓVEIS', path: '/imoveis', icon: 'fa-solid fa-layer-group' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/50">
      <div className="w-full px-6 lg:px-12 h-20 flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo Profissional */}
          <Link to="/" className="flex items-center gap-2 group no-underline">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white group-hover:rotate-6 transition-all shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-house-chimney text-lg"></i>
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900 ml-1">
              IMOBILIÁRIA<span className="text-blue-600">HUB</span>
            </span>
          </Link>
        </div>

        {/* Navigation Right (Auth) */}
        <nav className="flex items-center gap-8 lg:gap-12">
          {/* Navegação Direita (Home/Imóveis) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  flex items-center gap-2.5 py-2 text-[14px] font-semibold transition-all relative
                  ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}
                `}
              >
                <i className={`${link.icon} text-[15px] opacity-70`}></i>
                {link.name}
                {location.pathname === link.path && (
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 animate-in fade-in slide-in-from-bottom-1 duration-500" />
                )}
              </NavLink>
            ))}
          </div>

          <div className="w-[1px] h-6 bg-slate-200 hidden md:block" />

          {isAuthenticated && user ? (
            <UserMenu onLogoutClick={onLogoutClick} />
          ) : (
            <Link to="/login" className="flex items-center gap-3 px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-900 rounded-full transition-all active:scale-95 border border-slate-200 shadow-sm">
              <i className="fa-regular fa-circle-user text-[17px] text-slate-400"></i>
              <span className="text-[14px] font-semibold hidden md:block">Minha Conta</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

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
        <MainHeader isAuthenticated={isAuthenticated} user={user} onLogoutClick={handleLogout} />

        {/* Dynamic Route Section */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/imoveis" element={<PropertiesListing />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/favoritos" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/minhas-propriedades" element={<ProtectedRoute><MyProperties /></ProtectedRoute>} />
            <Route path="/minhas-propriedades/novo" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
            <Route path="/minhas-propriedades/editar/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </main>

        {/* Footer Minimalista */}
        <footer className="py-20 border-t border-slate-200/50 bg-white">
          <div className="w-full px-6 lg:px-12 text-center">
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

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * UserMenu.jsx - Menu de Usuário Premium v2.0
 * Avatar com iniciais + Dropdown profissional com ícones.
 */
const UserMenu = ({ onLogoutClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lógica de Iniciais
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleAction = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const menuOptions = [
    { label: 'Meu Perfil', icon: 'fa-regular fa-user', path: '/perfil' },
    { label: 'Minhas Propriedades', icon: 'fa-regular fa-building', path: '/perfil' },
    { label: 'Favoritos', icon: 'fa-regular fa-heart', path: '/favoritos' },
  ];

  if (!user) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 group focus:outline-none"
      >
        {/* Desktop: Texto + Chevron */}
        <div className="hidden md:flex items-center gap-2 transition-transform">
          <span className="text-[14px] font-semibold text-slate-700">Minha Conta</span>
          <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-300'}`}></i>
        </div>

        {/* Mobile: Ícone de Menu (Classic) */}
        <div className="md:hidden w-8 h-8 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
          <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
        </div>

        {/* Avatar (Iniciais) */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300 border ${
          isOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200 shadow-sm'
        }`}>
          {getInitials(user.name)}
        </div>
      </button>

      {/* Dropdown Menu (Design Humilde e Profissional) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xl shadow-slate-200/40">
          <div className="px-6 py-4 border-b border-slate-100 mb-2 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuário Ativo</span>
            <span className="text-[14px] font-bold text-slate-900 truncate">{user.name.toUpperCase()}</span>
          </div>

          {menuOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAction(opt.path)}
              className="w-full flex items-center gap-4 px-6 py-3 hover:bg-slate-50 text-slate-600 transition-all group"
            >
              <div className="w-5 flex justify-center">
                <i className={`${opt.icon} text-[16px] transition-transform group-hover:scale-110`}></i>
              </div>
              <span className="text-[14px] font-medium tracking-tight">{opt.label}</span>
            </button>
          ))}

          <button
            onClick={() => { setIsOpen(false); onLogoutClick(); }}
            className="w-full flex items-center gap-4 px-6 py-3 hover:bg-red-50 text-red-500 transition-all group border-t border-slate-50 mt-1"
          >
            <div className="w-5 flex justify-center">
              <i className="fa-regular fa-share-from-square text-[16px] transition-transform group-hover:translate-x-0.5"></i>
            </div>
            <span className="text-[14px] font-medium tracking-tight">Encerrar Sessão</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

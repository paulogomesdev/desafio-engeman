import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthenticatedLayout - Layout Refinado
 * Integridade visual e Humildade: Foco em precisão e detalhes sutis.
 */
const AuthenticatedLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.pathname === '/perfil' && location.hash !== '#edit') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById('content-area');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const menuItems = [
    { label: 'Meu Perfil', path: '/perfil', icon: 'fa-regular fa-user' },
    { label: 'Minhas Propriedades', path: '/minhas-propriedades', icon: 'fa-regular fa-building', roles: ['ADMIN', 'CORRETOR'] },
    { label: 'Novo Usuário', path: '/usuarios', icon: 'fa-regular fa-address-card', roles: ['ADMIN'] },
    { label: 'Meus Favoritos', path: '/favoritos', icon: 'fa-regular fa-heart' },
  ];

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
  };

  return (
    <div className="bg-bg-main min-h-screen flex flex-col font-jakarta antialiased shadow-none transition-colors duration-300">
      {/* 🏔️ Header de Perfil (Suave Navy Industrial: Autoridade com Humildade) */}
      <section className="bg-brand-primary border-b border-slate-700/50 pt-10 pb-8 text-white">
        <div className="w-full px-6 lg:px-12 xl:px-20 max-w-[1920px] mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-full bg-brand-accent flex items-center justify-center text-white text-xl font-bold shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-100 tracking-tight mb-4">
              {user?.name || 'Usuário'}
            </h2>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.location.pathname === '/perfil') {
                    document.getElementById('content-area')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/perfil#edit');
                  }
                }}
                className="flex items-center gap-2 px-6 py-2 border border-white/20 hover:bg-white/10 text-white rounded-full text-[14px] font-semibold transition-all active:scale-95"
              >
                <i className="fa-regular fa-pen-to-square"></i>
                Editar Perfil
              </button>

              <div className="px-5 py-2 bg-white/10 text-white text-[12px] font-black tracking-widest rounded-full border border-white/10 uppercase flex items-center gap-1.5 shadow-sm">
                <i className="fa-solid fa-shield-halved text-blue-400"></i>
                {user?.role || 'CLIENTE'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full px-6 lg:px-12 xl:px-20 max-w-[1920px] mx-auto py-8 lg:py-12 flex-grow">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* 🛡️ Sidebar (Indicadores de Integridade: Borda Esquerda Ativa) */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="sticky top-28 flex flex-col gap-6">
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => {
                  const isAuthorized = !item.roles || item.roles.includes(user?.role);
                  if (!isAuthorized) return null;

                  return (
                    <NavLink
                      key={item.label}
                      to={item.path}
                      className={({ isActive }) => `
                        group flex items-center gap-4 px-4 py-3 border-l-4 transition-all duration-200
                        ${isActive
                          ? 'bg-slate-200/50 border-brand-accent text-brand-primary'
                          : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-brand-primary'}
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <i className={`${item.icon} text-[18px] ${isActive ? 'text-brand-accent' : 'text-slate-400 group-hover:text-brand-accent'}`}></i>
                          <span className={`text-[14px] ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}

                <button
                  onClick={() => logout()}
                  className="group flex items-center gap-4 px-5 py-3 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all mt-4"
                >
                  <i className="fa-regular fa-share-from-square text-[18px]"></i>
                  <span className="text-[14px] font-semibold">Desconectar</span>
                </button>
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div id="content-area" className="mb-10 scroll-mt-28">
              <h1 className="text-3xl font-extrabold text-brand-primary tracking-tight mb-2 uppercase text-[24px]">{title}</h1>
              {subtitle && <p className="text-slate-400 font-medium text-sm lg:text-base leading-relaxed">{subtitle}</p>}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;

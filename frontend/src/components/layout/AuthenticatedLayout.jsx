import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthenticatedLayout - Layout Principal para a Área Autenticada.
 * Combina a praticidade do menu lateral do Viva Real com o design limpo do Dribbble.
 */
const AuthenticatedLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🚀 Navegação de Precisão: Rola para o conteúdo ao mudar de tela
  useEffect(() => {
    const timer = setTimeout(() => {
      // Se for perfil vazio, sobe tudo para mostrar Avatar/Nome. Se tiver #edit ou for outra página, foca nocorpo de conteúdo.
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
    { 
      label: 'Minhas Propriedades', 
      path: '/minhas-propriedades', 
      icon: 'fa-regular fa-building', 
      roles: ['ADMIN', 'CORRETOR'] 
    },
    { label: 'Meus Favoritos', path: '/favoritos', icon: 'fa-regular fa-heart' },
  ];

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-jakarta antialiased shadow-none">
      {/* 🏔️ Header de Perfil (Design Direto e Humilde) */}
      <section className="bg-white border-b-2 border-slate-200 pt-10 pb-8">
        <div className="w-full px-6 lg:px-12 xl:px-20 max-w-[1920px] mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
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
                className="flex items-center gap-2 px-6 py-2 border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-full text-[14px] font-semibold transition-all shadow-sm active:scale-95"
              >
                <i className="fa-regular fa-pen-to-square"></i>
                Editar Perfil
              </button>
              
              <div className="px-5 py-2 bg-blue-50/50 text-blue-600 text-[12px] font-bold tracking-tight rounded-full border border-blue-100/50 uppercase flex items-center gap-1.5">
                <i className="fa-solid fa-shield-halved opacity-60"></i>
                {user?.role || 'CLIENTE'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full px-6 lg:px-12 xl:px-20 max-w-[1920px] mx-auto py-8 lg:py-12 flex-grow">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* 🛡️ Sidebar (Maturidade & Usabilidade) */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="sticky top-28 flex flex-col gap-6">
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => {
                  const isAuthorized = !item.roles || item.roles.includes(user?.role);
                  
                  if (!isAuthorized) {
                    return (
                      <div 
                        key={item.label}
                        className="flex items-center justify-between px-4 py-3 rounded-xl opacity-30 grayscale cursor-not-allowed text-slate-400"
                        title="Acesso Restrito"
                      >
                        <div className="flex items-center gap-4">
                          <i className={`${item.icon} text-[18px]`}></i>
                          <span className="text-[14px] font-semibold">{item.label}</span>
                        </div>
                        <i className="fa-solid fa-lock text-[10px]"></i>
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.label}
                      to={item.path}
                      className={({ isActive }) => `
                        group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                        ${isActive
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <i className={`${item.icon} text-[18px] ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'} transition-colors`}></i>
                          <span className="text-[14px] font-semibold">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}

                <button
                  onClick={() => {
                    if (window.confirm("Você realmente deseja encerrar sua sessão atual? Todos os acessos protegidos serão desabilitados.")) {
                      logout();
                    }
                  }}
                  className="group flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 mt-2"
                >
                  <i className="fa-regular fa-share-from-square text-[18px] transition-transform group-hover:translate-x-1"></i>
                  <span className="text-[14px] font-semibold">Sair da Sessão</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* 📋 Main Content Area */}
          <main className="flex-1 min-w-0">
            <div id="content-area" className="mb-8 scroll-mt-28">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-slate-500 font-medium text-sm lg:text-base leading-relaxed">
                  {subtitle}
                </p>
              )}
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

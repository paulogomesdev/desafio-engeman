import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getUser, updateProfile, TOKEN_STORAGE_KEY } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';

/**
 * Profile.jsx - Área Autenticada: Meus Dados
 * Layout profissional com foco em segurança e clareza de dados.
 */
const Profile = () => {
  const { login } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 📥 Busca dados REAIS da API
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getUser,
  });

  usePageTitle('Meu Perfil');

  useEffect(() => {
    if (location.hash === '#edit') {
      const element = document.getElementById('content-area');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: user.name }));
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setIsSuccess(false);

    try {
      // UserUpdateDTO (Engeman Spec): campos opcionais — só enviamos o que tem valor
      const payload = {};
      if (formData.name && formData.name.trim()) payload.name = formData.name.trim();
      if (formData.password && formData.password.length >= 6) payload.password = formData.password;

      await updateProfile(payload);
      setIsSuccess(true);
      login(localStorage.getItem(TOKEN_STORAGE_KEY), { ...user, name: formData.name });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return (
     <AuthenticatedLayout title="Meus Dados">
       <div className="bg-slate-100 animate-pulse h-96 rounded-2xl" />
     </AuthenticatedLayout>
  );

  return (
    <AuthenticatedLayout 
      title="Meus Dados"
      subtitle="Mantenha suas informações sempre atualizadas para um atendimento mais ágil."
    >
      <div className="max-w-4xl">
        <form onSubmit={handleUpdate} className="bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-200/50 p-8 lg:p-12 space-y-10">
          <div id="info-section" className="flex flex-col md:flex-row md:items-center justify-between gap-4 scroll-mt-32">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-[1px] bg-blue-600"></span>
              Informações da Conta
            </h3>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl border border-blue-700 shadow-sm">
               <i className="fa-solid fa-shield-halved text-white text-[12px]"></i>
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Nível de Acesso: {user?.role || 'CLIENTE'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative group">
                <i className="fa-regular fa-circle-user absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] transition-colors group-focus-within:text-blue-600"></i>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="w-full bg-white border border-slate-300 focus:border-slate-950 rounded-xl py-4 pl-14 pr-6 text-[14px] font-bold text-slate-900 transition-all outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-xs">E-mail (Não Alterável)</label>
              <div className="relative">
                 <i className="fa-regular fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"></i>
                 <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  placeholder="Seu e-mail"
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl py-4 pl-14 pr-6 text-[14px] font-bold text-slate-600 cursor-not-allowed placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nova Senha</label>
            <div className="relative group">
              <i className="fa-solid fa-key absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] transition-colors group-focus-within:text-blue-600"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Deixe vazio para manter a senha atual"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white border border-slate-300 focus:border-slate-950 rounded-xl py-4 pl-14 pr-16 text-[14px] font-bold text-slate-900 transition-all outline-none placeholder:text-slate-500 placeholder:font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                title={showPassword ? "Esconder Senha" : "Mostrar Senha"}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-[18px]`}></i>
              </button>
            </div>
          </div>

          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-6 py-4 rounded-xl text-[12px] font-bold flex items-center gap-3 animate-in fade-in duration-500">
              <i className="fa-regular fa-circle-check text-lg"></i>
              Dados atualizados com sucesso.
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-10 py-4 bg-slate-900 hover:bg-black text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 active:scale-95 border border-slate-900"
            >
              {isUpdating ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
};

export default Profile;

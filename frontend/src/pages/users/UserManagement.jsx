import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '../../services/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';

/**
 * UserManagement.jsx - Página de Gestão de Usuários (Cadastro Direto)
 * Esta página herda a lógica do CreateUserForm para acesso direto.
 */
const UserManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CORRETOR'
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    // Timeout de 100ms para garantir que o layout carregou completamente
    const timer = setTimeout(() => {
      if (nameInputRef.current) nameInputRef.current.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setSuccess(true);
      setError('');
      setFormData({ name: '', email: '', password: '', role: 'CORRETOR' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Volta o foco para o primeiro campo para o próximo cadastro
      if (nameInputRef.current) nameInputRef.current.focus();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Falha ao criar usuário. Verifique se o e-mail já existe.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      return setError('Todos os campos obrigatórios precisam ser preenchidos.');
    }
    
    mutation.mutate(formData);
  };

  return (
    <AuthenticatedLayout 
      title="Gestão de Usuários" 
      subtitle="Cadastre novos integrantes na plataforma HUB para controle de acesso e gestão de imóveis."
    >
      <form onSubmit={handleSubmit} className="max-w-5xl space-y-10">
        
        {/* Seção 1: Credenciais e Acesso */}
        <div className="bg-white rounded-xl border border-slate-300 p-8 lg:p-10 space-y-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <span className="w-8 h-[1px] bg-blue-600"></span> Identificação e Segurança
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nome Completo */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <i className="fa-regular fa-user text-sm"></i>
                </div>
                <input
                  type="text"
                  required
                  ref={nameInputRef}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setSuccess(false);
                  }}
                  placeholder="Nome completo do colaborador"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 pl-14 pr-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <i className="fa-regular fa-envelope text-sm"></i>
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="exemplo@hub.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 pl-14 pr-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <i className="fa-solid fa-lock text-sm"></i>
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 pl-14 pr-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Nível de Acesso */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Papel (Role)</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <i className="fa-solid fa-shield-halved text-sm"></i>
                </div>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 pl-14 pr-6 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="CLIENTE">CLIENTE (Nível 1)</option>
                  <option value="CORRETOR">CORRETOR (Nível 2)</option>
                  <option value="ADMIN">ADMINISTRADOR (Nível 3)</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                  <i className="fa-solid fa-chevron-down text-[10px]"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {(error || success) && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-4">
                <i className="fa-solid fa-triangle-exclamation text-base"></i> {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-4">
                <i className="fa-solid fa-circle-check text-base"></i> Usuário criado com sucesso!
              </div>
            )}
          </div>
        )}

        {/* Ações de Formulário */}
        <div className="flex items-center justify-end pt-10 border-t border-slate-100 gap-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center justify-center gap-2 px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-full transition-all active:scale-95 disabled:opacity-50 shadow-sm shadow-emerald-200"
          >
            {mutation.isPending ? (
              <i className="fa-solid fa-circle-notch animate-spin text-sm"></i>
            ) : (
              <i className="fa-solid fa-check text-sm"></i>
            )}
            {mutation.isPending ? 'Cadastrando...' : 'Cadastrar Usuário'}
          </button>
        </div>
      </form>
    </AuthenticatedLayout>
  );
};

export default UserManagement;

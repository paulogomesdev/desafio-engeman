import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register, TOKEN_STORAGE_KEY } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';

/**
 * Register.jsx - Interface de Cadastro Minimalista (Fase 3)
 * Design sincronizado com a página de Login para consistência de marca.
 */
const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const nameInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const { login } = useAuth();
  const navigate = useNavigate();

  usePageTitle('Criar Conta');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Registra o usuário
      await register(formData);

      setIsSuccess(true);
      setFormData({ name: '', email: '', password: '' });

      // Auto focus de volta para o primeiro campo para facilitar um novo cadastro
      setTimeout(() => {
        if (nameInputRef.current) nameInputRef.current.focus();
      }, 100);

    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
            <i className="fa-solid fa-user-plus text-xl"></i>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Criação de Perfil</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Protocolo de Registro Seguro</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-[11px] font-bold mb-4 flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        {isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl text-[11px] font-bold mb-4 flex items-center gap-3 animate-in fade-in duration-500">
            <i className="fa-solid fa-circle-check"></i>
            Cadastro realizado com sucesso! Você já pode entrar.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome Completo</label>
            <input
              type="text"
              required
              ref={nameInputRef}
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setIsSuccess(false); // Limpa mensagem ao começar novo digito
              }}
              placeholder="Ex: João Silva"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail Corporativo</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="vendedor@imobiliaria.com"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha</label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3.5 px-6 pr-14 text-sm font-bold text-slate-900 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-[16px]`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 mt-2 shadow-lg shadow-slate-900/10"
          >
            {isLoading ? 'Registrando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3">Já possui acesso?</p>
          <Link to="/login" className="text-blue-600 font-black uppercase text-[11px] tracking-widest hover:text-slate-900 transition-colors">
            Fazer login direto
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

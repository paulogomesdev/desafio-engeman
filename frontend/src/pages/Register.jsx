import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Register.jsx - Interface de Registro Minimalista (Fase 3)
 */
const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulação rápida de registro
      setTimeout(() => {
        login('mock-jwt-token', { name: formData.name, email: formData.email });
        navigate('/imoveis');
      }, 1000);
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl p-10 border border-slate-200 shadow-2xl shadow-slate-200/20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-600/20">
            <i className="fa-solid fa-user-plus text-2xl"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Criar Conta</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Junte-se à maior rede imobiliária</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: João Silva"
              className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="seu@email.com"
              className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Crie uma Senha</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-600/10 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Registrando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-4">Já possui acesso?</p>
          <Link to="/login" className="text-slate-900 font-black uppercase text-[11px] tracking-widest hover:text-blue-600 transition-colors">
            Fazer Login Direto
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

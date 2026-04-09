import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, getUser } from '../services/api';

/**
 * Login.jsx - Interface de Autenticação Minimalista (Fase 3)
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authData = await loginApi(email, password);
      // Salva o token temporariamente para permitir a chamada getUser subsequente
      localStorage.setItem('hub-token', authData.token);
      
      const userProfile = await getUser();
      login(authData.token, userProfile);
      
      // Sucesso sem alert travando a UI
      navigate('/imoveis');
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
            <i className="fa-solid fa-house-lock text-xl"></i>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Acesso ao Sistema</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Protocolo de Segurança JWT</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-[11px] font-bold mb-4 flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail Corporativo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendedor@imobiliaria.com"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3.5 px-6 text-sm font-bold text-slate-900 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha</label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3.5 px-6 pr-14 text-sm font-bold text-slate-900 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                title={showPassword ? "Esconder Senha" : "Mostrar Senha"}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-[16px]`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Acessando...' : 'Entrar Agora'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3">Acesso Externo?</p>
          <Link to="/register" className="text-blue-600 font-black uppercase text-[11px] tracking-widest hover:text-slate-900 transition-colors">
            Registrar nova conta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

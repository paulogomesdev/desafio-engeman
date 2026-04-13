import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProperties, togglePropertyStatus, deleteProperty } from '../../services/api';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout';
import { Link, useNavigate } from 'react-router-dom';
import ActionMenu from '../../components/ui/ActionMenu';

/**
 * MyProperties.jsx - Gestão de Imóveis (Conformidade Estrita)
 * Segue a API_ENGEMAN.md: getUserProperties retorna uma lista simples [].
 * Paginação removida; Busca realizada no client-side.
 */
const MyProperties = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // 📥 Busca imóveis do usuário (Conforme DOC: Sem parâmetros de paginação)
  const { data, isLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: () => getUserProperties(),
  });

  // 🔎 Filtro Client-side para manter UX sem violar a Spec da API
  const filteredProperties = data?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.state.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // ⚡ Mutation: Alternar Status
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => togglePropertyStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
    }
  });

  // ⚡ Mutation: Deletar
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
    }
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Deseja realmente excluir permanentemente o imóvel "${name}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id, name, active) => {
    const action = active ? 'DESATIVAR' : 'ATIVAR';
    if (window.confirm(`Deseja realmente ${action} a visibilidade do imóvel "${name}"?`)) {
      toggleStatusMutation.mutate(id);
    }
  };

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400';

  if (isLoading) return (
    <AuthenticatedLayout title="Minhas Propriedades">
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-slate-200">
          <div className="h-12 bg-slate-100 rounded-full w-full max-w-lg" />
          <div className="h-12 bg-slate-100 rounded-full w-48" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0" />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );

  return (
    <AuthenticatedLayout title="Minhas Propriedades">
      <div className="space-y-6">

        {/* Barra de Ações Superior */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-slate-200">
          <div className="relative group flex-1 max-w-lg">
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-blue-600 text-sm"></i>
            <input
              type="text"
              placeholder="Pesquise nos seus imóveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white border border-slate-200 rounded-full pl-14 pr-4 text-[14px] font-medium text-slate-900 placeholder:text-slate-400/50 focus:placeholder:text-slate-400 focus:border-brand-accent transition-all outline-none"
            />
          </div>

          <Link
            to="/minhas-propriedades/novo"
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-full transition-all active:scale-95 shadow-sm"
          >
            <i className="fa-solid fa-plus text-sm"></i>
            Cadastrar Imóvel
          </Link>
        </div>

        {/* Header de Status (Paginação Removida conforme Spec) */}
        <div className="flex items-center justify-between py-2 px-1">
          <div className="flex items-start md:items-center gap-2">
            <i className="fa-solid fa-house-chimney text-slate-300 text-[13px] mt-0.5 md:mt-0"></i>
            <div className="flex flex-col md:flex-row md:items-center md:gap-1">
              <span className="text-[13px] font-bold text-slate-500">{filteredProperties.length}</span>
              <span className="text-[10px] md:text-[13px] font-bold text-slate-400 md:text-slate-500 uppercase tracking-widest">imóveis listados</span>
            </div>
          </div>
        </div>

        {/* Tabela de Imóveis */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-200/50 pb-4 overflow-x-auto">
          <div className="w-full">
            <table className="w-full text-left border-collapse min-w-[800px] md:min-w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tl-xl min-w-[320px]">Registrado em</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Tipologia</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Área</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Valor</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center rounded-tr-xl">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="hover:bg-slate-100/60 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={p.imageUrls?.split(',')[0].trim() || DEFAULT_IMAGE}
                            alt={p.name}
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm shrink-0"
                          />
                          <div className="min-w-0 pr-4">
                            <p className="text-[13px] font-medium text-slate-700 line-clamp-1 truncate mb-0.5">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider line-clamp-1 truncate">{p.city}, {p.state}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <div className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-100 whitespace-nowrap">
                          {p.type}
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <p className="text-[13px] font-medium text-slate-600 whitespace-nowrap">{p.area} m²</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] font-medium text-slate-900 tracking-tight">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p.value)}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`
                            inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                            ${p.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}
                          `}>
                          {p.active ? 'ATIVO' : 'INATIVO'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <ActionMenu
                          label=""
                          icon="fa-solid fa-gear"
                          triggerClass="!bg-transparent !border-none !shadow-none !w-10 !px-0 flex justify-center hover:scale-110"
                          dropdownClass="right-0"
                          actions={[
                            { label: 'Editar Produto', icon: 'fa-solid fa-pen-to-square', onClick: () => navigate(`/minhas-propriedades/editar/${p.id}`) },
                            { label: p.active ? 'Desativar Visibilidade' : 'Habilitar Visibilidade', icon: p.active ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye', onClick: () => handleToggleStatus(p.id, p.name, p.active) },
                            { label: 'Excluir Produto', icon: 'fa-solid fa-trash-can', variant: 'danger', onClick: () => handleDelete(p.id, p.name) }
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-32 text-center text-slate-300">
                      <div className="flex flex-col items-center">
                        <i className="fa-solid fa-building-circle-exclamation text-4xl mb-4 opacity-20"></i>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum imóvel encontrado</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default MyProperties;

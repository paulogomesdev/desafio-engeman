import React from 'react';

/**
 * ActiveFilterTags.jsx
 * Exibe chips profissionais para filtros ativos com opção de remoção individual.
 */
const ActiveFilterTags = ({ filters, onClearFilter, onClearAll }) => {
  const activeTags = [];

  if (filters.name) activeTags.push({ id: 'name', label: `Busca: ${filters.name}` });
  if (filters.type && filters.type !== 'ALL') activeTags.push({ id: 'type', label: filters.type });
  if (filters.minBedrooms) activeTags.push({ id: 'minBedrooms', label: `${filters.minBedrooms}+ Quartos` });
  if (filters.minPrice) activeTags.push({ id: 'minPrice', label: `Min: R$ ${filters.minPrice}` });
  if (filters.maxPrice) activeTags.push({ id: 'maxPrice', label: `Max: R$ ${filters.maxPrice}` });
  
  if (filters.transactionType === 'BUY') activeTags.push({ id: 'transactionType', label: 'Compra' });
  if (filters.transactionType === 'RENT') activeTags.push({ id: 'transactionType', label: 'Aluguel' });
  if (filters.transactionType === 'BOTH') activeTags.push({ id: 'transactionType', label: 'Compra & Aluguel' });

  if (activeTags.length === 0) return null;

  return (
    <div className="mb-4 ">
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros Ativos</span>
        <button 
          onClick={onClearAll}
          className="text-[9px] font-black text-rose-500 uppercase tracking-widest active:scale-95 transition-all"
        >
          Limpar Tudo
        </button>
      </div>

      <div className="flex lg:flex-wrap items-center gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0 whitespace-nowrap lg:whitespace-normal">
        <span className="hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Filtros Ativos:</span>
        
        {activeTags.map((tag) => (
          <div 
            key={tag.id}
            className="flex-shrink-0 flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full border border-blue-100 animate-in fade-in zoom-in duration-300"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">{tag.label}</span>
            <button 
              onClick={() => onClearFilter(tag.id, tag.id === 'transactionType' ? 'ALL' : (tag.id === 'type' ? 'ALL' : ''))}
              className="hover:bg-blue-600 hover:text-white rounded-full w-4 h-4 flex items-center justify-center transition-all bg-blue-100/50"
            >
              <i className="fa-solid fa-xmark text-[10px]"></i>
            </button>
          </div>
        ))}

        <button 
          onClick={onClearAll}
          className="hidden lg:block text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors ml-2"
        >
          Limpar Tudo
        </button>
      </div>
    </div>
  );
};

export default ActiveFilterTags;

import React from 'react';
import { PROPERTY_TYPES } from '../../services/api';
import CustomSelect from '../ui/CustomSelect';

/**
 * SidebarFilters (Vertical).
 * Otimizado para navegação lateral em Desktop e Drawer em Mobile.
 */
const SidebarFilters = ({ filters, onFilterChange, onApply, onToggle, isMobile = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  // 📝 Helper para formatar moeda brasileira em tempo real
  const formatValueToBRL = (value) => {
    if (!value) return '';
    const cleanValue = value.toString().replace(/\D/g, '');
    return new Intl.NumberFormat('pt-BR').format(cleanValue);
  };

  // 📝 Helper para remover formatação antes de enviar ao state
  const parseRawValue = (value) => {
    return value.replace(/\D/g, '');
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    // Envia apenas os números para o filtro (API/Filtro)
    onFilterChange(name, parseRawValue(value));
  };

  const propertyTypeOptions = [
    { value: 'ALL', label: 'Todos os tipos' },
    ...Object.keys(PROPERTY_TYPES).map(type => ({ value: type, label: type }))
  ];

  const sectionClass = isMobile ? "mb-8" : "mb-10";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4";

  return (
    <div className={`flex flex-col ${isMobile ? 'p-6' : 'w-full'}`}>

      {/* 🚀 Header de Controle (Desktop Only) */}
      {!isMobile && onToggle && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Filtros Avançados</span>
          <button
            onClick={onToggle}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all border border-slate-100"
            title="Recolher Filtros"
          >
            <i className="fa-solid fa-chevron-left text-[9px]"></i>
          </button>
        </div>
      )}

      {/* 🔍 Busca por Nome */}
      <div className={sectionClass}>
        <label className={labelClass}>O que você procura?</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <i className="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-blue-600 transition-colors text-sm"></i>
          </div>
          <input
            type="text"
            name="name"
            value={filters.name || ''}
            onChange={handleChange}
            placeholder="Ex: Apartamento Centro"
            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-full py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all outline-none"
          />
        </div>
      </div>

      {/* 🏢 Tipo de Imóvel */}
      <div className={sectionClass}>
        <label className={labelClass}>Tipo de Imóvel</label>
        <CustomSelect
          name="type"
          value={filters.type || 'ALL'}
          onChange={(name, val) => onFilterChange(name, val)}
          options={propertyTypeOptions}
          icon="fa-solid fa-house-chimney"
        />
      </div>

      {/* 🛌 Dormitórios (Tag Format) */}
      <div className={sectionClass}>
        <label className={labelClass}>Dormitórios</label>
        <div className="flex flex-wrap gap-2">
          {['', '1', '2', '3+'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onFilterChange('minBedrooms', val)}
              className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border ${(filters.minBedrooms === val || (val === '3+' && filters.minBedrooms === '3'))
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
                }`}
            >
              {val === '' ? 'Todos' : `${val} Quartos`}
            </button>
          ))}
        </div>
      </div>

      {/* 💰 Faixa de Preço */}
      <div className={sectionClass}>
        <label className={labelClass}>Faixa de Preço</label>
        <div className="flex flex-col gap-3">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">R$</span>
            <input
              type="text"
              name="minPrice"
              value={formatValueToBRL(filters.minPrice)}
              onChange={handlePriceChange}
              placeholder="Mínimo"
              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-full py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all outline-none"
            />
          </div>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">R$</span>
            <input
              type="text"
              name="maxPrice"
              value={formatValueToBRL(filters.maxPrice)}
              onChange={handlePriceChange}
              placeholder="Máximo"
              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-full py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* 🚀 Ações de Filtro */}
      <div className="mt-4 space-y-4">
        {!isMobile && (
          <button
            onClick={onApply}
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            Aplicar Filtros
          </button>
        )}
        
        <button
          onClick={() => onFilterChange('CLEAR_ALL', '')}
          className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors text-center"
        >
          Limpar Tudo
        </button>
      </div>
    </div>
  );
};

export default SidebarFilters;

import React from 'react';
import CustomSelect from '../ui/CustomSelect';

/**
 * PropertySort - Componente Unificado de Ordenação.
 * Gerencia o comportamento visual para Mobile e Desktop através de props.
 */
const PropertySort = ({ value, onChange, isMobile = false }) => {
  const sortOptions = [
    { value: 'name,asc', label: isMobile ? 'Nome' : 'Ordem Alfabética' },
    { value: 'value,asc', label: 'Menor Preço' },
    { value: 'value,desc', label: 'Maior Preço' },
  ];

  return (
    <div className={`flex items-center justify-end relative ${!isMobile ? 'w-full md:w-[240px] shrink-0' : 'w-auto'}`}>
      <CustomSelect
        name="sort"
        value={value}
        onChange={(name, val) => onChange(name, val)}
        options={sortOptions}
        icon="fa-solid fa-arrow-down-short-wide"
        className="w-full min-w-0"
        // Estilos dinâmicos baseados no contexto
        triggerClass={isMobile 
          ? "h-10 border border-slate-300 bg-white font-bold text-slate-800 rounded-xl px-3 transition-all hover:border-slate-400 !min-w-0"
          : "h-12 border border-slate-300 hover:border-slate-400 px-4 truncate"
        }
        dropdownClass="right-0"
        labelClass={isMobile ? "hidden" : ""}
      />
    </div>
  );
};

export default PropertySort;

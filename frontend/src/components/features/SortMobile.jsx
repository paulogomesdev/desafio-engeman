import React from 'react';
import CustomSelect from '../ui/CustomSelect';

/**
 * SortMobile.jsx - Estilo Caixa (Consistência Desktop)
 * Adaptado para mobile: compacto mas com borda e label, igual ao estilo industrial.
 */
const SortMobile = ({ value, onChange }) => {
  const sortOptions = [
    { value: 'name,asc', label: 'Nome' },
    { value: 'value,asc', label: 'Menor Preço' },
    { value: 'value,desc', label: 'Maior Preço' },
  ];

  return (
    <div className="flex items-center justify-end relative">
      <CustomSelect
        name="sort"
        value={value}
        onChange={(name, val) => onChange(name, val)}
        options={sortOptions}
        icon="fa-solid fa-arrow-down-short-wide"
        className="w-auto"
        // Estilo Caixa (Industrial Clean): fundo branco e borda
        triggerClass="h-10 border border-slate-300 bg-white font-bold text-slate-800 rounded-xl px-3 transition-all hover:border-slate-400 !min-w-0"
        dropdownClass="right-0 -mt-1"
        labelClass="hidden" // Esconde o texto "Ordenar por" se estiver no componente para economizar espaço
      />
    </div>
  );
};

export default SortMobile;

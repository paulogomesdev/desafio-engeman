import React from 'react';
import CustomSelect from '../ui/CustomSelect';

/**
 * SortSelect.jsx
 * Componente isolado para ordenação, posicionado fora do menu lateral de filtros.
 */
const SortSelect = ({ value, onChange }) => {
  const sortOptions = [
    { value: 'name,asc', label: 'Ordem Alfabética' },
    { value: 'value,asc', label: 'Menor Preço' },
    { value: 'value,desc', label: 'Maior Preço' },
  ];

  return (
    <div className="flex items-center justify-end w-full md:w-[240px] transition-all font-roboto shrink-0 relative">
      <CustomSelect
        name="sort"
        value={value}
        onChange={(name, val) => onChange(name, val)}
        options={sortOptions}
        icon="fa-solid fa-arrow-down-short-wide"
        className="w-full min-w-0"
        triggerClass="h-12 border border-slate-300 hover:border-slate-400 px-4 truncate"
        dropdownClass="right-0"
      />
    </div>
  );
};

export default SortSelect;

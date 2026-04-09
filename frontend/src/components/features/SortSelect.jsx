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
    <div className="flex items-center gap-2 md:bg-white md:border md:border-slate-100 pr-0 h-10 md:h-12 rounded-2xl md:rounded-xl transition-all w-fit md:w-auto md:shadow-none">
      <div className="relative">
        <CustomSelect
          name="sort"
          value={value}
          onChange={(name, val) => onChange(name, val)}
          options={sortOptions}
          icon="fa-solid fa-arrow-down-short-wide"
          className="w-auto hide-label-mobile"
          triggerClass="h-10 md:h-full border-none bg-transparent px-0 flex items-center justify-center md:justify-start shadow-none text-2xl"
        />
      </div>
    </div>
  );
};

export default SortSelect;

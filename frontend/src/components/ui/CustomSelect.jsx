import React, { useState, useRef, useEffect } from 'react';

/**
 * CustomSelect.jsx - Seletor Premium Minimalista.
 * Substitui o seletor nativo mantendo a identidade visual original.
 * Focado em centralização e limpeza visual.
 */
const CustomSelect = ({ 
  name, 
  value, 
  onChange, 
  options = [], 
  icon = null, 
  className = "",
  triggerClass = "",
  dropdownClass = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleSelect = (val) => {
    onChange(name, val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative font-roboto ${className}`}>
      {/* Gatilho (Trigger) - Design Refinado e Consistente */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white text-slate-900 text-[14px] font-bold tracking-tight px-5 py-4 rounded-xl border border-slate-300 hover:border-slate-400 transition-all flex items-center justify-between group overflow-hidden ${triggerClass}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-4">
          {icon && <i className={`${icon} text-blue-600 text-[15px] shrink-0`}></i>}
          <span className={`block truncate ${className.includes('hide-label-mobile') ? 'hidden md:inline' : ''}`}>
            {selectedOption?.label}
          </span>
        </div>
        <i className={`fa-solid fa-chevron-down text-[10px] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'} ${className.includes('hide-label-mobile') ? 'hidden md:inline' : ''}`}></i>
      </button>

      {/* Lista de Opções (Dropdown) - Estilo Premium UserMenu */}
      {isOpen && (
        <div className={`absolute z-[100] mt-1.5 min-w-[200px] w-full ${dropdownClass || (className.includes('hide-label-mobile') ? 'right-0' : 'left-0')} bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/40 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top overflow-hidden`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-6 py-3.5 text-[14px] font-medium tracking-tight text-left transition-all hover:bg-slate-50 active:bg-slate-100 ${
                value === option.value ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">{option.label}</span>
                {value === option.value && <i className="fa-solid fa-check text-[12px] shrink-0 animate-in zoom-in-50"></i>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

import React, { useState, useRef, useEffect } from 'react';

/**
 * ActionMenu.jsx - Menu de Ações (Estilo Idêntico ao CustomSelect)
 * Mantém a paridade visual absoluta com o CustomSelect.jsx, mas focado em disparar funções.
 */
const ActionMenu = ({ 
  actions = [], 
  label = "Ações", 
  icon = "fa-solid fa-ellipsis-vertical",
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

  const handleAction = (onClick) => {
    onClick();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Gatilho (Trigger) - Idêntico ao CustomSelect */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white text-slate-900 text-[14px] font-bold tracking-tight px-5 py-4 rounded-xl border border-slate-300 hover:border-slate-400 transition-all flex items-center justify-between group overflow-hidden ${triggerClass}`}
      >
        <div className="flex items-center justify-center min-w-0 flex-1">
          {icon && <i className={`${icon} ${isOpen ? 'text-blue-600' : 'text-slate-700'} text-[18px] shrink-0 transition-colors`}></i>}
          {label && <span className="block truncate ml-2.5">{label}</span>}
        </div>
        {label && <i className={`fa-solid fa-chevron-down text-[10px] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}></i>}
      </button>

      {/* Lista de Opções (Dropdown) - Responsivo Mobile / Desktop */}
      {isOpen && (
        <div className={`
          z-[100] bg-white pt-1 pb-2 shadow-2xl animate-in fade-in duration-200
          /* Mobile: Comporta-se como um Bottom Sheet flutuante travado na tela */
          max-sm:fixed max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:rounded-2xl max-sm:border max-sm:border-slate-200 max-sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
          /* Desktop: Comporta-se como um Dropdown absoluto */
          sm:absolute sm:mt-1.5 sm:min-w-[200px] sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-slate-200/40 sm:zoom-in-95 sm:origin-top ${dropdownClass || 'sm:right-0'} overflow-hidden
        `}>
          {actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAction(action.onClick)}
              className={`w-full px-6 py-3.5 text-[14px] font-medium tracking-tight text-left transition-all hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 ${
                action.variant === 'danger' ? 'text-red-500' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className={`${action.icon} text-[14px] w-5 text-center ${action.variant === 'danger' ? 'text-red-400' : 'text-blue-500'}`}></i>
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;

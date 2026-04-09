import React from 'react';

/**
 * ConfirmDialog.jsx - Dialog de Confirmação Minimalista Premium.
 */
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-[2rem] border-2 border-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center text-slate-900">
           {/* Ícone de Alerta */}
           <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
           </div>

          <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{title}</h3>
          <p className="text-sm font-bold text-slate-400 leading-relaxed px-4">{message}</p>
        </div>

        <div className="grid grid-cols-2 border-t-2 border-slate-900">
          <button
            onClick={onCancel}
            className="py-5 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all border-r-2 border-slate-900"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="py-5 font-black uppercase text-[10px] tracking-widest text-red-600 hover:bg-red-50 transition-all"
          >
            Confirmar saída
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

import React, { useState, useEffect } from 'react';
import SidebarFilters from '../features/SidebarFilters';

/**
 * FilterDrawerMobile - Bottom Sheet para filtros no mobile com gesto de arraste.
 */
const FilterDrawerMobile = ({ onClose, filters, onFilterChange, onApply }) => {
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0) setDragY(diff);
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 400);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0 focus-within:opacity-100'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/60 transition-all duration-700 ${mounted ? 'backdrop-blur-sm opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Full-screen Content Container */}
      <div
        style={{
          transform: `translateY(${mounted ? dragY : 100}%)`,
          transition: dragY === 0 ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s' : 'none'
        }}
        className="relative w-full h-full bg-slate-50 flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="bg-white p-8 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Filtros</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Refine sua busca</p>
          </div>
          <button
            onClick={handleClose}
            className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl border border-slate-100 active:bg-slate-100 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 bg-slate-50 overscroll-contain">
          <SidebarFilters filters={filters} onFilterChange={onFilterChange} onApply={onApply} isMobile={true} />
        </div>
      </div>
    </div>
  );
};

export default FilterDrawerMobile;

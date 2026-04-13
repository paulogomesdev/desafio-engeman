import React from 'react';

/**
 * PropertyGalleryMobile - Galeria Full-bleed com Native Scroll Snap.
 * Isolado para performance mobile e manutenibilidade.
 */
const PropertyGalleryMobile = ({ 
  photos, 
  activePhotoIdx, 
  setActivePhotoIdx, 
  property, 
  isFavorite, 
  isOwner, 
  toggleFavorite, 
  favoriteMutation, 
  navigate,
  onShare
}) => {
  return (
    <section className="md:hidden -mx-6 -mt-6 mb-8 relative bg-slate-900">
      <div 
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar aspect-square"
        onScroll={(e) => {
          const idx = Math.round(e.target.scrollLeft / window.innerWidth);
          if (idx !== activePhotoIdx) setActivePhotoIdx(idx);
        }}
      >
        {photos.map((img, i) => (
          <div key={i} className="min-w-full h-full snap-center select-none">
            <img src={img} className="w-full h-full object-cover" alt={`${property.name} - ${i + 1}`} />
          </div>
        ))}
      </div>

      {/* Botões em Overlay (Canto Superior Direito) */}
      <div className="absolute top-4 right-4 flex gap-2.5">
        <button 
          onClick={onShare}
          className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center text-slate-900 shadow-xl active:scale-90 transition-all backdrop-blur-sm cursor-pointer"
        >
          <i className="fa-solid fa-share-nodes text-sm"></i>
        </button>
        <button
          onClick={toggleFavorite}
          disabled={favoriteMutation.isPending}
          className={`w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all backdrop-blur-sm cursor-pointer ${isFavorite ? 'text-red-500' : 'text-slate-900'}`}
        >
          {favoriteMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart text-sm`}></i>
          )}
        </button>
        {isOwner && (
          <button
            onClick={() => navigate(`/minhas-propriedades/editar/${property.id}`)}
             className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center text-slate-900 shadow-xl active:scale-90 transition-all backdrop-blur-sm cursor-pointer"
          >
            <i className="fa-solid fa-pen text-sm"></i>
          </button>
        )}
      </div>

      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center text-slate-900 shadow-xl active:scale-90 transition-all backdrop-blur-sm cursor-pointer"
      >
         <i className="fa-solid fa-arrow-left text-sm"></i>
      </button>

      {/* Contador de Fotos */}
      <div className="absolute bottom-4 left-4">
        <span className="bg-black/60 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/10 uppercase tracking-widest">
          {activePhotoIdx + 1} / {photos.length}
        </span>
      </div>

      {/* Indicadores (Dots/Lines) Mobile */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${activePhotoIdx === i
                ? 'w-6 h-1 bg-white shadow-sm'
                : 'w-1.5 h-1 bg-white/40 shadow-sm'
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PropertyGalleryMobile;

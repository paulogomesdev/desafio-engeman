import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavorites, addFavorite, removeFavorite } from '../../services/api';

/**
 * PropertyCard Premium v2.2.
 * Sync REAL com a API de Favoritos da Engeman.
 */
const PropertyCard = ({ property, onLoad }) => {
  const { id, name, city, state, type, bedrooms, area, active, imageUrls, value } = property;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1073&auto=format&fit=crop';
  const [imgError, setImgError] = React.useState(false);
  const [currentIdx, setCurrentIdx] = React.useState(0);

  // Parse inteligente das imagens (Suporta Local e Externo)
  const photos = React.useMemo(() => {
    if (!imageUrls) return [PLACEHOLDER_IMAGE];

    // Converte string para array e limpa espaços
    const urlArray = typeof imageUrls === 'string' ? imageUrls.split(',') : [imageUrls];

    return urlArray.map(url => {
      const cleanUrl = url.trim();
      if (!cleanUrl) return PLACEHOLDER_IMAGE;

      // Se for link externo (http) ou base64, retorna direto
      if (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:')) return cleanUrl;

      // Se for caminho local, aponta para o servidor da Engeman
      return `https://d-engeman.onrender.com/api/uploads/${cleanUrl.replace(/^\//, '')}`;
    });
  }, [imageUrls]);

  // 📥 Busca lista de favoritos (omitido resto do código de query por brevidade, mantendo lógica)
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
  });

  const isFavorite = favorites?.some(fav => fav.id === id) || false;

  const favoriteMutation = useMutation({
    mutationFn: () => isFavorite ? removeFavorite(id) : addFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const toggleFavorite = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return alert('Faça login para favoritar!');
    favoriteMutation.mutate();
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIdx(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIdx(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const price = value || 0;

  return (
    <div
      onClick={() => navigate(`/property/${id}`)}
      className="group block bg-white rounded-xl overflow-hidden border border-slate-200 transition-all duration-300 hover:border-blue-400 cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* Imagem com Carousel Integrado */}
      <div className="relative aspect-[16/10] overflow-hidden group/img bg-slate-100">
        {/* 🚀 SMART PRELOAD: Carrega as imagens em background para troca instantânea */}
        <div className="hidden">
          {photos.map((src, i) => (
            <img key={i} src={src} aria-hidden="true" />
          ))}
        </div>

        <img
          src={imgError ? PLACEHOLDER_IMAGE : photos[currentIdx]}
          alt={name}
          onLoad={onLoad}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Setas de Navegação (Visíveis sempre no mobile, hover no desktop) */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-slate-800 opacity-100 md:opacity-0 md:group-hover/img:opacity-100 transition-all hover:bg-white z-10"
            >
              <i className="fa-solid fa-chevron-left text-[10px]"></i>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-slate-800 opacity-100 md:opacity-0 md:group-hover/img:opacity-100 transition-all hover:bg-white z-10"
            >
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </>
        )}

        {/* Dots Indicadores (Estilo Pill Premium) */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-300 rounded-full ${currentIdx === i
                  ? 'w-6 h-1 bg-white'
                  : 'w-1 h-1 bg-white/60'
                  }`}
              />
            ))}
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${active ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'}`}>
            {active ? 'Disponível' : 'Vendido'}
          </span>
          <span className="bg-white/90 text-slate-900 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-sm border border-slate-200/50 shadow-sm">
            {type}
          </span>
        </div>
      </div>

      {/* Conteúdo Compacto */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors truncate">
            {name}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <i className="fa-solid fa-location-dot text-[11px] text-blue-600"></i>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {city} / {state}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 py-3 border-y border-slate-100 text-slate-600">
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-bed text-[11px] text-slate-400"></i>
            <span className="text-[12px] font-bold">{bedrooms || 0} <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Qts</span></span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-slate-100 pl-4">
            <i className="fa-solid fa-maximize text-[11px] text-slate-400"></i>
            <span className="text-[12px] font-bold">{area || 0} <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">m²</span></span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Valor</span>
            <span className="text-lg font-bold text-slate-800 tracking-tight">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
            </span>
          </div>

          <button
            onClick={toggleFavorite}
            disabled={favoriteMutation.isPending}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${favoriteMutation.isPending ? 'opacity-50 cursor-wait' : ''} ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-red-500'}`}
          >
            {favoriteMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart text-lg`}></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

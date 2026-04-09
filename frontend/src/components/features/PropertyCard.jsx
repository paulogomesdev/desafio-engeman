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
  const { id, name, city, state, type, bedrooms, area, active, imageUrls, photos, value } = property;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1073&auto=format&fit=crop';
  const [imgError, setImgError] = React.useState(false);

  // 📥 Busca lista de favoritos para checar estado inicial
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
  });

  const isFavorite = favorites?.some(fav => fav.id === id) || false;

  // ⚡ Mutations para Sincronização Real
  const favoriteMutation = useMutation({
    mutationFn: () => isFavorite ? removeFavorite(id) : addFavorite(id),
    onSuccess: () => {
      // Invalida o cache para atualizar todos os corações no sistema
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const toggleFavorite = (e) => {
    e.stopPropagation(); 
    if (!isAuthenticated) return alert('Faça login para favoritar!');
    favoriteMutation.mutate();
  };

  const handleImageLoad = () => {
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    setImgError(true);
    if (onLoad) onLoad();
  };

  const price = value || property.price || 0;

  const rawPhotos = imageUrls || photos || '';
  const firstPhoto = (rawPhotos && typeof rawPhotos === 'string') ? rawPhotos.split(',')[0].trim() : '';

  const mainImage = firstPhoto
    ? (firstPhoto.startsWith('http') ? firstPhoto : `https://d-engeman.onrender.com/api/uploads/${firstPhoto.replace(/^\//, '')}`)
    : PLACEHOLDER_IMAGE;

  return (
    <div
      onClick={() => navigate(`/property/${id}`)}
      className="group block bg-white rounded-3xl overflow-hidden border border-slate-200 transition-all duration-300 hover:border-blue-400 cursor-pointer"
    >
      {/* Imagem Otimizada (Agora 100% Limpa) */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={imgError ? PLACEHOLDER_IMAGE : mainImage}
          alt={name}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${active ? 'bg-blue-600 text-white' : 'bg-slate-500 text-white'}`}>
            {active ? 'Disponível' : 'Vendido'}
          </span>
          <span className="bg-white/90 text-slate-800 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">
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
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${favoriteMutation.isPending ? 'opacity-50 cursor-wait' : ''} ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-red-500'}`}
          >
            {favoriteMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isFavorite ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

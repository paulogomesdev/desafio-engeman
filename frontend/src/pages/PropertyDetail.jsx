import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPropertyById, getFavorites, addFavorite, removeFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';

/**
 * PropertyDetail.jsx - Layout Final v9.3 (Favoritos Sync)
 */
const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 📥 Busca dados do imóvel
  const { data: property, isLoading, isError } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id),
  });

  // 📥 Busca favoritos para checar estado
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
  });

  const isFavorite = favorites?.some(fav => fav.id === parseInt(id)) || false;

  // ⚡ Mutations para Sincronização Real
  const favoriteMutation = useMutation({
    mutationFn: () => isFavorite ? removeFavorite(id) : addFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const toggleFavorite = () => {
    if (!isAuthenticated) return alert('Faça login para favoritar!');
    favoriteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Autenticando Propriedade...</p>
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Imóvel Indisponível</h2>
          <button onClick={() => navigate('/imoveis')} className="text-blue-600 font-black uppercase text-[10px] tracking-widest border-b-2 border-blue-600 pb-1">
            Retornar
          </button>
        </div>
      </div>
    );
  }

  const photos = property.imageUrls
    ? property.imageUrls.split(',').map(img => img.trim()).filter(img => img !== '')
    : ['https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200'];

  const features = [
    { icon: 'fa-bed', label: 'Quartos', value: property.bedrooms || 0 },
    { icon: 'fa-bath', label: 'Banheiros', value: property.bathrooms || 'Indefinido' },
    { icon: 'fa-maximize', label: 'Área', value: `${property.area || 0} m²` }
  ];

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Imóveis', path: '/imoveis' },
    { label: property.name }
  ];

  const whatsappLink = `https://wa.me/554799999999?text=Olá! Desejo informações sobre o imóvel: ${property.name}`;

  return (
    <div className="min-h-screen bg-white font-jakarta pb-20 overflow-x-hidden">

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">

        {/* ⚡ HEADER UNIFICADO */}
        <section className="flex flex-wrap items-center justify-between gap-6 mb-8 py-5 border-b border-slate-100">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="flex items-center gap-6 lg:gap-10">
            <button className="flex items-center gap-2.5 text-blue-600 hover:text-slate-900 transition-all font-black uppercase text-[11px] lg:text-xs tracking-widest group">
              <i className="fa-solid fa-arrow-up-from-bracket text-sm lg:text-base group-hover:-translate-y-0.5 transition-transform"></i>
              <span>Compartilhar</span>
            </button>
            <button 
              onClick={toggleFavorite}
              disabled={favoriteMutation.isPending}
              className={`flex items-center gap-2.5 transition-all font-black uppercase text-[11px] lg:text-xs tracking-widest group ${isFavorite ? 'text-red-500' : 'text-blue-600 hover:text-red-500'}`}
            >
              {favoriteMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart text-sm lg:text-base group-hover:scale-110 transition-transform`}></i>
              )}
              <span>{isFavorite ? 'Favoritado' : 'Favoritar'}</span>
            </button>
          </div>
        </section>

        {/* 📐 SEÇÃO MÍDIA */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-16">
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="aspect-video md:h-[400px] rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative">
              <img src={photos[activePhotoIdx]} alt="Main" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {photos.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhotoIdx(i)}
                  className={`min-w-[80px] md:min-w-[110px] h-16 md:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activePhotoIdx === i ? 'border-blue-600 scale-95' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-100 min-h-[300px] lg:h-[400px] relative bg-slate-50">
            {/* 🗺️ Skeleton Loader para o Mapa */}
            {!mapLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-map-location-dot text-slate-400 text-xl"></i>
                </div>
                <div className="h-2 w-32 bg-slate-200 rounded-full"></div>
              </div>
            )}
            
            <iframe
              title="Location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${property.address}, ${property.city} - ${property.state}`)}&output=embed`}
              className={`w-full h-full border-0 transition-all duration-1000 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
              allowFullScreen
              onLoad={() => setMapLoaded(true)}
            ></iframe>
          </div>
        </section>

        {/* 📋 CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-8">
            <div className="mb-12">
              <h1 className="text-3xl lg:text-[2.6rem] font-black text-slate-900 tracking-tighter leading-tight mb-4 uppercase">
                {property.name}
              </h1>

              <div className="flex items-center gap-3 mt-4 mb-8">
                <span className="border border-blue-100 bg-blue-50/50 text-blue-600 px-4 py-1.5 rounded-lg text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em]">
                  {property.type}
                </span>
                <span className="border border-emerald-100 bg-emerald-50/50 text-emerald-600 px-4 py-1.5 rounded-lg text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 shadow-sm shadow-emerald-500/5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Disponível
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-tight">
                <i className="fa-solid fa-location-dot text-blue-600"></i>
                <span>{property.address}, {property.city} - {property.state}</span>
              </div>
            </div>

            {/* Ficha Técnica: Ajustada para 3 colunas em MD/LG */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4 bg-white border border-slate-200 p-5 rounded-xl transition-all group">
                  <div className="w-10 h-10 bg-slate-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <i className={`fa-solid ${f.icon} text-lg`}></i>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                    <p className="text-base font-black text-slate-900 leading-none">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="prose prose-slate max-w-none pb-12">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-10 h-[1px] bg-slate-200"></span> Memorial Descritivo
              </h4>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                {property.description}
              </p>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-2xl shadow-slate-200/20 sticky top-10">
              <div className="flex flex-col gap-1 mb-8">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Total Investido</span>
                <div className="flex items-baseline gap-2 text-blue-600">
                  <span className="text-3xl lg:text-[2.2rem] font-black tracking-tighter leading-none">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.value || 0)}
                  </span>
                </div>
              </div>

              <button className="w-full py-4 bg-white hover:bg-slate-50 text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all border border-slate-200 mb-8 active:scale-[0.98]">
                Agendar Visita Presencial
              </button>

              {property.brokerName && (
                <div className="pt-8 border-t border-slate-100 mb-8">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Informações de Contato</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                      <span className="text-slate-400 text-[10px] font-medium uppercase">Responsável</span>
                      <span>{property.brokerName}</span>
                    </div>
                  </div>
                </div>
              )}

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;

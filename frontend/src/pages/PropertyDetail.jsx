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
  const { isAuthenticated, user } = useAuth();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // 📥 Busca dados do imóvel
  const { data: property, isLoading, isError } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id),
    staleTime: 0,
  });

  // 📥 Busca favoritos para checar estado
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
  });

  const isFavorite = favorites?.some(fav => fav.id === parseInt(id)) || false;
  const isOwner = isAuthenticated && user && property && user.id === property.brokerId;

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

  // 🔄 Sync da mensagem dinâmica quando property carrega
  React.useEffect(() => {
    if (property?.name && !customMessage) {
      setCustomMessage(`Olá! Desejo informações sobre o imóvel: ${property.name}`);
    }
  }, [property, customMessage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-jakarta">
        <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center py-5 border-b border-slate-100 mb-8 animate-pulse">
            <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
            <div className="flex gap-6">
              <div className="h-4 w-24 bg-slate-100 rounded-lg"></div>
              <div className="h-4 w-24 bg-slate-100 rounded-lg"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-16 animate-pulse">
            <div className="lg:col-span-3 h-[400px] bg-slate-100 rounded-2xl"></div>
            <div className="lg:col-span-2 h-[400px] bg-slate-100 rounded-2xl"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 animate-pulse">
            <div className="lg:col-span-8">
              <div className="h-12 w-3/4 bg-slate-200 rounded-xl mb-6"></div>
              <div className="h-4 w-1/2 bg-slate-100 rounded-lg mb-12"></div>
              <div className="grid grid-cols-3 gap-4 mb-20">
                <div className="h-20 bg-slate-50 rounded-xl"></div>
                <div className="h-20 bg-slate-50 rounded-xl"></div>
                <div className="h-20 bg-slate-50 rounded-xl"></div>
              </div>
            </div>
            <div className="lg:col-span-4 h-96 bg-slate-50 rounded-2xl"></div>
          </div>
        </main>
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
    { icon: 'fa-maximize', label: 'Área', value: `${property.area || 0} m²` },
    { icon: 'fa-tag', label: 'Tipo', value: property.type || 'N/A' }
  ];

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Imóveis', path: '/imoveis' },
    { label: property.name }
  ];

  const whatsappLink = `https://wa.me/554799999999?text=${encodeURIComponent(customMessage)}`;

  return (
    <div className="min-h-screen bg-slate-50 font-jakarta pb-20">

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">

        {/* ⚡ HEADER DESKTOP (Inalterado) */}
        <section className="hidden md:flex items-center justify-between gap-6 mb-8 py-5 border-b border-slate-100">
          <div className="hidden md:block">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          <div className="flex items-center gap-6 lg:gap-10">
            {isOwner && (
              <button
                onClick={() => navigate(`/minhas-propriedades/editar/${id}`)}
                className="flex items-center justify-center gap-2.5 text-slate-900 border border-slate-200 lg:border-none p-2 lg:p-0 rounded-xl lg:bg-transparent transition-all font-black uppercase text-[11px] lg:text-xs tracking-widest group"
              >
                <i className="fa-solid fa-pen text-sm lg:text-base group-hover:-translate-y-0.5 transition-transform"></i>
                <span className="hidden lg:inline">Editar Imóvel</span>
              </button>
            )}
            <button className="flex items-center justify-center gap-2.5 text-blue-600 border border-blue-100 lg:border-none p-2 lg:p-0 rounded-xl lg:bg-transparent transition-all font-black uppercase text-[11px] lg:text-xs tracking-widest group">
              <i className="fa-solid fa-arrow-up-from-bracket text-sm lg:text-base group-hover:-translate-y-0.5 transition-transform"></i>
              <span className="hidden lg:inline">Compartilhar</span>
            </button>
            <button
              onClick={toggleFavorite}
              disabled={favoriteMutation.isPending}
              className={`flex items-center justify-center gap-2.5 border p-2 lg:p-0 rounded-xl lg:bg-transparent lg:border-none transition-all font-black uppercase text-[11px] lg:text-xs tracking-widest group ${isFavorite ? 'text-red-500 border-red-100' : 'text-blue-600 border-blue-50/50 hover:text-red-500'}`}
            >
              {favoriteMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart text-sm lg:text-base group-hover:scale-110 transition-transform`}></i>
              )}
              <span className="hidden lg:inline">{isFavorite ? 'Favoritado' : 'Favoritar'}</span>
            </button>
          </div>
        </section>

        {/* ⚡ GALERIA MOBILE (Full-bleed + Native Scroll) */}
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
            <button className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center text-slate-900 shadow-xl active:scale-90 transition-all backdrop-blur-sm">
              <i className="fa-solid fa-share-nodes text-sm"></i>
            </button>
            <button
              onClick={toggleFavorite}
              disabled={favoriteMutation.isPending}
              className={`w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all backdrop-blur-sm ${isFavorite ? 'text-red-500' : 'text-slate-900'}`}
            >
              {favoriteMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart text-sm`}></i>
              )}
            </button>
            {isOwner && (
              <button
                onClick={() => navigate(`/minhas-propriedades/editar/${id}`)}
                 className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center text-slate-900 shadow-xl active:scale-90 transition-all backdrop-blur-sm"
              >
                <i className="fa-solid fa-pen text-sm"></i>
              </button>
            )}
          </div>

          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center text-slate-900 shadow-xl active:scale-90 transition-all backdrop-blur-sm"
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

        {/* 📐 LAYOUT UNIFICADO — Card alinhado ao topo com a galeria */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* COLUNA ESQUERDA: Galeria + Info + Mapa */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* Galeria Desktop (Oculta no mobile) */}
            <div className="hidden md:flex flex-col gap-8">
              {/* Galeria — Carousel com Setas + Dots */}
              <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-100 group">
                <div className="h-[280px] md:h-[440px]">
                  <img
                    src={photos[activePhotoIdx]}
                    alt={`${property.name} - Foto ${activePhotoIdx + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                </div>

                {/* Setas de Navegação */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhotoIdx(prev => prev === 0 ? photos.length - 1 : prev - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-slate-700 shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 active:scale-90 z-20"
                      aria-label="Foto anterior"
                    >
                      <i className="fa-solid fa-chevron-left text-xs"></i>
                    </button>
                    <button
                      onClick={() => setActivePhotoIdx(prev => prev === photos.length - 1 ? 0 : prev + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-slate-700 shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 active:scale-90 z-20"
                      aria-label="Próxima foto"
                    >
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                  </>
                )}

                {/* Contador */}
                <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  {activePhotoIdx + 1} / {photos.length}
                </div>

                {/* Dots */}
                {photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhotoIdx(i)}
                        className={`rounded-full transition-all duration-300 ${activePhotoIdx === i
                          ? 'w-6 h-1 bg-white'
                          : 'w-1.5 h-1 bg-white/50 hover:bg-white/80'
                          }`}
                        aria-label={`Ir para foto ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {photos.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`min-w-[72px] h-14 md:min-w-[96px] md:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activePhotoIdx === i ? 'border-blue-600 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Foto ${i + 1}`} />
                  </button>
                ))}
              </div>
            </div>
            {/* Info do Imóvel */}
            <div className="bg-white p-8 lg:p-12 rounded-xl border border-slate-200 shadow-sm shadow-slate-200/50">
              <div className="mb-12">
                <h1 className="text-3xl lg:text-[2.6rem] font-black text-slate-900 tracking-tighter leading-tight mb-4 uppercase">
                  {property.name}
                </h1>

                <div className="flex items-center gap-3 mt-4 mb-8">
                  <span className="border border-blue-100 bg-blue-50/50 text-blue-600 px-4 py-1.5 rounded-lg text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em]">
                    {property.type}
                  </span>
                  <span className="border border-emerald-100 bg-emerald-50/50 text-emerald-600 px-4 py-1.5 rounded-lg text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Disponível
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-tight">
                  <i className="fa-solid fa-location-dot text-blue-600"></i>
                  <span>{property.address}, {property.city} - {property.state}</span>
                </div>

                {/* Mini Mapa inline */}
                <div className="mt-6 rounded-lg overflow-hidden border border-slate-100 h-[200px] relative bg-slate-50">
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 animate-pulse">
                      <i className="fa-solid fa-map-location-dot text-slate-300 text-lg"></i>
                      <div className="h-1.5 w-24 bg-slate-200 rounded-full"></div>
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
              </div>

              {/* Ficha Técnica */}
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-10 h-[1px] bg-blue-600"></span> Infraestrutura & Detalhes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-5 rounded-xl transition-all group">
                    <div className="w-10 h-10 bg-white text-blue-600 rounded-lg flex items-center justify-center border border-slate-200">
                      <i className={`fa-solid ${f.icon} text-lg`}></i>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="text-base font-black text-slate-900 leading-none">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="prose prose-slate max-w-none">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <span className="w-10 h-[1px] bg-blue-600"></span> Memorial Descritivo
                </h4>
                <p className="text-slate-500 text-lg leading-relaxed font-semibold">
                  {property.description}
                </p>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: Card de Contato (sticky, alinhado ao topo da galeria) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl p-10 border border-slate-200 shadow-sm shadow-slate-200/50 sticky top-24 flex flex-col h-fit">
              <div className="flex flex-col gap-1 mb-8">
                <span className="text-[11px] font-black tracking-widest uppercase text-slate-900">Total Investido</span>
                <div className="flex items-baseline gap-2 text-blue-600">
                  <span className="text-3xl lg:text-[2.2rem] font-black tracking-tighter leading-none">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.value || 0)}
                  </span>
                </div>
              </div>

              {property.brokerName && (
                <div className="pt-6 border-t border-slate-100 mb-6">
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Responsável</h5>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {property.brokerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-base font-bold text-slate-900 leading-tight">{property.brokerName}</p>
                  </div>
                </div>
              )}

              {property.brokerName && (
                <div className="pt-6 border-t border-slate-100 mb-6">
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Entre em contato agora!</h5>
                  <div className="relative">
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows="5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-bold text-slate-900 focus:border-blue-600 transition-all outline-none resize-none"
                    />
                    <div className="absolute right-3 bottom-3 opacity-20">
                      <i className="fa-solid fa-pen-to-square text-xs"></i>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <i className="fa-brands fa-whatsapp text-xl"></i>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;

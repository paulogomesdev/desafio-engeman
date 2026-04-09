import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * 🎨 ÍCONES CUSTOMIZADOS (ESTILO BLACK PILL)
 * Transforma o marcador comum em um "Price Badge" elegante como no mockup.
 */
const createPriceIcon = (price) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    maximumFractionDigits: 0 
  }).format(price);

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="flex flex-col items-center group">
        <div class="bg-slate-950 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-2xl border border-white/10 group-hover:bg-blue-600 transition-colors duration-300">
          ${formattedPrice}
        </div>
        <div class="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1 border border-white shadow-sm ring-2 ring-orange-500/20"></div>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 35]
  });
};

const MapAutoControl = ({ center }) => {
  const map = useMap();
  if (center) map.setView(center, 14); // Zoom mais próximo para foco urbano
  return null;
};

const PropertyMap = ({ properties, userLocation }) => {
  const defaultCenter = userLocation || [-23.5505, -46.6333];

  return (
    <section id="map-explorer" className="w-full relative py-20 bg-stone-50">
      <div className="container mx-auto px-6 mb-12 flex flex-col items-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
          Mapa de Oportunidades
        </h2>
        <div className="w-12 h-1 bg-blue-600 rounded-full mb-4"></div>
        <p className="text-slate-500 text-sm font-medium text-center max-w-sm">
          Filtre e visualize a vizinhança dos imóveis com preços em tempo real no mapa.
        </p>
      </div>

      <div className="h-[700px] w-full container mx-auto px-0 md:px-12">
        <div className="h-full w-full rounded-[48px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-white relative z-10">
          <MapContainer 
            center={defaultCenter} 
            zoom={13} 
            scrollWheelZoom={false}
            className="h-full w-full"
            zoomControl={false} // Desativamos para colocar botões flutuantes como no mockup
          >
            {/* TileLayer: Estilo Clean Visual (Positron) */}
            <TileLayer
              attribution='&copy; OpenStreetMap &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <MapAutoControl center={userLocation} />

            {/* Marcadores Estilo Price-Pill */}
            {properties?.map((p) => (
              p.latitude && p.longitude && (
                <Marker 
                  key={p.id} 
                  position={[p.latitude, p.longitude]}
                  icon={createPriceIcon(p.value || p.price || 0)}
                >
                  <Popup className="clean-pill-popup" minWidth={340}>
                    <div className="flex bg-white rounded-3xl overflow-hidden p-2 gap-4">
                      {/* Lado Esquerdo: Imagem Quadrada */}
                      <div className="w-32 h-32 flex-shrink-0">
                        <img 
                          src={p.imageUrls?.[0] || p.photos?.[0] || '/images/placeholder.jpg'} 
                          className="w-full h-full object-cover rounded-2xl" 
                          alt={p.name}
                        />
                      </div>

                      {/* Lado Direito: Info */}
                      <div className="flex flex-col justify-center py-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                            {p.transactionType === 'RENT' ? 'Para Alugar' : 'À Venda'}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-950 tracking-tighter mb-2">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p.value || p.price || 0)}
                        </h3>

                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 mb-3">
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-bed text-blue-500/50"></i> {p.bedrooms || 2} bed
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-bath text-blue-500/50"></i> {p.bathrooms || 1} bath
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-expand text-blue-500/50"></i> {p.area || 85}m²
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-tight truncate w-40">
                          {p.address || 'São Paulo, SP - Brasil'}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Simulação de Controles Flutuantes (UI Mockup) */}
            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
              <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 border border-slate-100 hover:bg-slate-50 transition-all">
                <i className="fa-solid fa-expand text-sm"></i>
              </button>
            </div>
            
            <div className="absolute top-6 right-6 z-[1000]">
              <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 border border-slate-100 hover:bg-slate-50 transition-all">
                <i className="fa-solid fa-layer-group text-sm"></i>
              </button>
            </div>

            <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
              <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 border border-slate-100 hover:bg-slate-50 transition-all font-black text-xl">+</button>
              <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 border border-slate-100 hover:bg-slate-50 transition-all font-black text-xl">-</button>
            </div>

          </MapContainer>
        </div>
      </div>
    </section>
  );
};

export default PropertyMap;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProperties, getLocations } from '../services/api';
import PropertyCard from '../components/features/PropertyCard';
import CustomSelect from '../components/ui/CustomSelect';

/**
 * Home: Landing Page de Alta Conversão.
 * Focada em impacto visual, busca simplificada e destaques do portfólio.
 */
const Home = () => {
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState('ALL');
  const [propertyType, setPropertyType] = useState('ALL');
  const [location, setLocation] = useState('ALL');
  const [availableLocations, setAvailableLocations] = useState([]);

  // Opções para o CustomSelect
  const propertyTypeOptions = [
    { value: 'ALL', label: 'Todos os Tipos' },
    { value: 'APARTAMENTO', label: 'Apartamento' },
    { value: 'CASA', label: 'Casa Residencial' },
    { value: 'TERRENO', label: 'Terreno / Lote' },
    { value: 'COMERCIAL', label: 'Ponto Comercial' },
  ];

  // 🌍 Carregar localizações reais disponíveis no estoque
  useEffect(() => {
    const fetchLocs = async () => {
      const locs = await getLocations();
      setAvailableLocations(locs);
    };
    fetchLocs();
  }, []);

  const locationOptions = [
    { value: 'ALL', label: 'Todas as Cidades' },
    ...availableLocations.map(loc => ({ value: loc, label: loc })),
  ];

  // Busca de Destaques (Máximo 3)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => getProperties({ size: 3, sort: 'id,desc' }),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (transactionType !== 'ALL') params.set('transactionType', transactionType);
    if (propertyType !== 'ALL') params.set('type', propertyType);
    if (location !== 'ALL') {
      const [city, state] = location.split(', ');
      params.set('city', city);
      params.set('state', state);
    }
    navigate(`/imoveis?${params.toString()}`);
  };

  return (
    <div className="bg-white min-h-screen font-jakarta">
      {/* 🏙️ HERO SECTION: Design Premium & Focado */}
      {/* 🏙️ HERO SECTION: Design Híbrido (QuintoAndar-Inspired no Mobile) */}
      <section className="relative flex flex-col md:block md:h-[600px] overflow-hidden bg-white">
        {/* Background Image Area */}
        <div className="relative w-full h-[300px] md:absolute md:inset-0 md:h-full z-0">
          <img
            src="/images/hero.jpg"
            alt="Interior de Apartamento de Luxo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/20 md:bg-slate-950/30" />
        </div>

        {/* Search Card Container */}
        <div className="container mx-auto px-6 relative z-10 md:absolute md:inset-0 md:flex md:items-center">
          <div className="w-full md:max-w-[460px] md:ml-16 bg-white p-8 md:p-10 rounded-[2.5rem] -mt-12 md:mt-0 border-2 border-slate-100 shadow-2xl shadow-slate-950/5 animate-in fade-in slide-in-from-bottom md:slide-in-from-left duration-700">
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 leading-[1.1] mb-3 md:mb-4 tracking-tighter">
              A moradia que <br className="hidden md:block" /> você sempre quis. <i className="fa-solid fa-house-circle-check text-blue-600 ml-1 text-2xl"></i>
            </h1>
            <p className="text-slate-500 text-sm font-medium mb-6 md:mb-8 leading-relaxed">
              Encontre o imóvel ideal com a segurança e a transparência que você merece.
            </p>

            <div className="flex flex-col gap-4 md:gap-5">
              {/* Menu de Transação (Compacto) */}
              <div className="flex border-b border-slate-100 mb-1 md:mb-2 relative">
                <button
                  type="button"
                  className={`relative py-3 md:py-4 px-4 md:px-6 text-[10px] font-black uppercase tracking-widest transition-all ${transactionType === 'ALL' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  Todos
                  {transactionType === 'ALL' && <div className="absolute bottom-0 left-4 md:left-6 right-4 md:right-6 h-0.5 bg-blue-600 rounded-full"></div>}
                </button>
                <button
                  type="button"
                  className="relative py-3 md:py-4 px-4 md:px-6 text-[10px] font-black uppercase tracking-widest text-slate-300 cursor-not-allowed"
                >
                  Comprar
                </button>
                <button
                  type="button"
                  className="relative py-3 md:py-4 px-4 md:px-6 text-[10px] font-black uppercase tracking-widest text-slate-300 cursor-not-allowed"
                >
                  Alugar
                </button>
              </div>

              {/* Seletor de Tipo */}
              <CustomSelect
                name="propertyType"
                value={propertyType}
                onChange={(name, val) => setPropertyType(val)}
                options={propertyTypeOptions}
                icon="fa-solid fa-house-chimney"
              />

              {/* Seletor de Localização */}
              <CustomSelect
                name="location"
                value={location}
                onChange={(name, val) => setLocation(val)}
                options={locationOptions}
                icon="fa-solid fa-location-dot"
              />

              <button
                onClick={handleSearch}
                className="w-full mt-1 bg-blue-600 hover:bg-black text-white py-4 md:py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                PESQUISAR IMÓVEIS
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🏆 PROPERTY GRID: Destaques (Máximo 6) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                Portfólio de Imóveis
              </h2>
              <p className="text-slate-500 font-medium text-lg">
                Uma curadoria exclusiva com as melhores oportunidades selecionadas pelos nossos especialistas.
              </p>
            </div>

            <Link to="/imoveis" className="group flex items-center gap-3 text-blue-600 font-black uppercase text-[10px] tracking-widest pt-2">
              Ver portfólio completo
              <div className="w-8 h-8 rounded-full border border-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton-light h-[460px] rounded-[2.5rem]" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-rose-500 font-black uppercase text-xs tracking-widest">Erro inesperado na base de dados.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20 animate-in fade-in duration-1000">
                {data?.content?.slice(0, 3).map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              <div className="flex justify-center">
                <Link
                  to="/imoveis"
                  className="px-16 py-6 border-2 border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 font-black uppercase text-[10px] tracking-[0.3em] rounded-full transition-all active:scale-95"
                >
                  Explorar todos os imóveis
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

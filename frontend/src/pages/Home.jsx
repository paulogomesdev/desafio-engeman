import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProperties, getAvailableTypes } from '../services/api';
import PropertyCard from '../components/features/PropertyCard';
import PropertyCardSkeleton from '../components/features/PropertyCardSkeleton';
import CustomSelect from '../components/ui/CustomSelect';

/**
 * Home: Landing Page de Alta Conversão.
 * Focada em impacto visual, busca simplificada e destaques do portfólio.
 */
const Home = () => {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState('ALL');
  const [availableTypes, setAvailableTypes] = useState([]);

  // 🌍 Carregar tipos reais disponíveis no estoque
  useEffect(() => {
    const fetchData = async () => {
      const types = await getAvailableTypes();
      setAvailableTypes(types);
    };
    fetchData();
  }, []);

  const propertyTypeOptions = [
    { value: 'ALL', label: 'Todos os Tipos' },
    ...availableTypes.map(type => ({ value: type, label: type.charAt(0) + type.slice(1).toLowerCase() })),
  ];

  // Busca de Destaques (Máximo 3)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => getProperties({ size: 3, sort: 'id,desc' }),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (propertyType !== 'ALL') params.set('type', propertyType);
    navigate(`/imoveis?${params.toString()}`);
  };

  return (
    <div className="bg-white min-h-screen font-jakarta">
      {/* 🏙️ HERO SECTION: Design Premium & Focado */}
      {/* 🏙️ HERO SECTION: Design Híbrido (QuintoAndar-Inspired no Mobile) */}
      <section className="relative flex flex-col md:block md:min-h-[600px] bg-white">
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
        <div className="w-full px-6 lg:px-12 xl:px-20 max-w-[1920px] mx-auto relative z-10 md:absolute md:inset-0 md:flex md:items-center">
          <div className="w-full md:max-w-[460px] lg:max-w-[500px] xl:ml-10 bg-white p-8 md:p-10 rounded-xl -mt-12 md:mt-0 border-2 border-slate-100 shadow-2xl shadow-slate-950/5 animate-in fade-in slide-in-from-bottom md:slide-in-from-left duration-700">
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
                  className="relative py-3 md:py-4 px-4 md:px-6 text-[10px] font-black uppercase tracking-widest transition-all text-blue-600"
                >
                  Todos
                  <div className="absolute bottom-0 left-4 md:left-6 right-4 md:right-6 h-0.5 bg-blue-600 rounded-full"></div>
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

              {/* Seletor de Localização (Congelado — API não suporta filtro por cidade) */}
              <CustomSelect
                name="location"
                value="ALL"
                onChange={() => {}}
                options={[{ value: 'ALL', label: 'Todas as Cidades' }]}
                icon="fa-solid fa-location-dot"
                disabled={true}
              />

              <button
                onClick={handleSearch}
                className="w-full mt-1 bg-blue-600 hover:bg-black text-white py-4 md:py-5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
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
        <div className="w-full px-6 lg:px-12 xl:px-20 max-w-[1920px] mx-auto">
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
              {[1, 2, 3].map(i => (
                <PropertyCardSkeleton key={i} />
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

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProperties, DEBOUNCE_DELAY } from '../services/api';
import { buildImageUrl } from '../services/imageUrl';
import { useDebounce } from '../hooks/useDebounce';
import PropertyCard from '../components/features/PropertyCard';
import SidebarFilters from '../components/features/SidebarFilters';
import PropertyCardSkeleton from '../components/features/PropertyCardSkeleton';
import ActiveFilterTags from '../components/features/ActiveFilterTags';
import PropertySort from '../components/features/PropertySort';
import FilterDrawerMobile from '../components/mobile/FilterDrawerMobile';

/**
 * Página de Listagem Profissional v2.0.
 * Layout com Sidebar Filters, Tags Ativas e Ordenação Independente.
 */
const PropertiesListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const initialFilters = {
    name: searchParams.get('name') || '',
    type: searchParams.get('type') || 'ALL',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minBedrooms: searchParams.get('minBedrooms') || '',
    transactionType: searchParams.get('transactionType') || 'ALL',
    sort: searchParams.get('sort') || 'name,asc',
    page: parseInt(searchParams.get('page')) || 0,
    size: 9,
  };

  const [filters, setFilters] = useState(initialFilters); // Filtros aplicados (Query + URL)
  const [workingFilters, setWorkingFilters] = useState(initialFilters); // Filtros em edição na UI
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  const debouncedName = useDebounce(workingFilters.name, DEBOUNCE_DELAY);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1. Sincronização de Name (Debounce) -> Se o nome debounced mudar, aplicamos ele nos filtros reais
  useEffect(() => {
    setFilters(prev => ({ ...prev, name: debouncedName, page: 0 }));
  }, [debouncedName]);

  // Query Params Memorizados (Filtros Aplicados)
  const queryParams = useMemo(() => ({
    ...filters
  }), [filters]);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['properties', queryParams],
    queryFn: () => getProperties(queryParams),
  });

  // 🖼️ Lógica de Preloading de Imagens (Otimizada)
  useEffect(() => {
    if (data?.content?.length > 0) {
      // Só dispara o preloading se houver mudança real nos dados (não apenas refresh de background)
      setIsPreloading(true);
      setLoadedImagesCount(0);

      let loaded = 0;
      const total = data.content.length;

      data.content.forEach(property => {
        const rawPhotos = property.imageUrls || '';
        const firstPhoto = (rawPhotos && typeof rawPhotos === 'string') ? rawPhotos.split(',')[0].trim() : '';
        const mainImage = buildImageUrl(firstPhoto);

        const img = new Image();
        img.src = mainImage;
        img.onload = img.onerror = () => {
          loaded++;
          setLoadedImagesCount(loaded);
          if (loaded >= total) setIsPreloading(false);
        };
      });

      // Safety Timeout (3s)
      const timeout = setTimeout(() => {
        setIsPreloading(false);
        setLoadedImagesCount(total);
      }, 3000);

      return () => clearTimeout(timeout);
    } else {
      setIsPreloading(false);
      setLoadedImagesCount(0);
    }
  }, [data?.content]);

  // Sincronização automática com a URL
  useEffect(() => {
    const updatedParams = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'ALL' && key !== 'size') {
        updatedParams[key] = filters[key];
      }
    });
    setSearchParams(updatedParams, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = (name, value, immediate = false) => {
    if (name === 'CLEAR_ALL') {
      const cleared = { ...initialFilters, name: '', type: 'ALL', minPrice: '', maxPrice: '', minBedrooms: '', transactionType: 'ALL' };
      setWorkingFilters(cleared);
      setFilters(cleared);
    } else if (immediate) {
      setFilters(prev => ({ ...prev, [name]: value, page: 0 }));
      setWorkingFilters(prev => ({ ...prev, [name]: value, page: 0 }));
    } else {
      setWorkingFilters(prev => ({ ...prev, [name]: value }));
      // Se for apenas o nome, o useEffect do debouncedName cuidará de aplicar
    }
  };

  const handleApplyFilters = () => {
    setFilters({ ...workingFilters, page: 0 });
    setIsFilterDrawerOpen(false); // Fecha drawer mobile ao aplicar
  };

  const handlePageChange = (newPage) => {
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    setWorkingFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="bg-slate-50 min-h-screen font-jakarta pb-20">
      <div className="flex flex-col lg:flex-row items-start">

        {/* 🛡️ Sidebar de Filtros (Desktop - Dinâmica) */}
        <aside
          className={`hidden lg:block w-[320px] fixed top-20 left-0 h-[calc(100vh-80px)] border-r border-slate-100 bg-white overflow-y-auto z-30 transition-all duration-500 overscroll-contain ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`
            aside::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="py-12 px-8 min-w-[320px]">
            <SidebarFilters
              filters={workingFilters}
              onFilterChange={handleFilterChange}
              onApply={handleApplyFilters}
              onToggle={() => setIsSidebarOpen(false)}
            />
          </div>
        </aside>

        {/* ⚡ Gutter (Barra minimalista para reabrir) */}
        {!isSidebarOpen && (
          <div className="hidden lg:flex fixed top-20 left-0 w-12 h-[calc(100vh-80px)] bg-white border-r border-slate-100 z-40 flex-col items-center py-6 transition-all animate-in slide-in-from-left duration-500">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border-2 border-slate-200 text-slate-400 hover:border-slate-300 transition-all group"
              title="Abrir Filtros"
            >
              <i className="fa-solid fa-chevron-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
            </button>
            <div className="mt-8 [writing-mode:vertical-lr] rotate-180 flex items-center gap-4">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Filtros</span>
              <div className="w-[1px] h-12 bg-slate-100"></div>
            </div>
          </div>
        )}

        <main className={`flex-1 w-full bg-slate-50/50 min-h-[calc(100vh-80px)] transition-all duration-500 ${isSidebarOpen ? 'lg:ml-[320px]' : 'lg:ml-12'}`}>
          <div className="px-6 lg:px-12 pb-20">

              {/* 📱 Interface Mobile (Simetria MB-4) */}
              <div className="lg:hidden mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 relative group">
                    <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-blue-600 text-sm"></i>
                    <input
                      type="text"
                      placeholder="Qual imóvel você busca?"
                      value={workingFilters.name}
                      onChange={(e) => handleFilterChange('name', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-full py-4 pl-14 pr-4 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 transition-all outline-none shadow-sm shadow-slate-200/50"
                    />
                  </div>

                  <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className={`w-14 h-14 flex items-center justify-center bg-white border border-slate-300 rounded-2xl active:scale-95 transition-all shadow-sm ${Object.keys(filters).some(k => k !== 'name' && k !== 'sort' && k !== 'page' && k !== 'size' && (k === 'type' ? filters[k] !== 'ALL' : !!filters[k]))
                        ? 'text-blue-600 border-blue-100 bg-blue-50/30'
                        : 'text-slate-400'
                      }`}
                  >
                    <i className="fa-solid fa-sliders text-xl"></i>
                  </button>
                </div>

                <div className="h-px w-full bg-slate-200/60 my-4" />

                <div className="flex items-center justify-between px-1 mb-4">
                  <span className="text-base font-bold text-slate-900 tracking-tight">
                    {data?.totalElements || 0} imóveis
                  </span>
                  <PropertySort value={filters.sort} onChange={(name, value) => handleFilterChange(name, value, true)} isMobile={true} />
                </div>
              </div>

              {/* 🛡️ Interface Desktop (Mantida Profissional) */}
              <section className="hidden lg:flex items-center justify-between gap-8 mb-6 py-6 border-b border-slate-200">
                <div className="flex items-center gap-6 flex-1">
                  <div className="relative group flex-1 max-w-lg">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 text-sm"></i>
                    <input
                      type="text"
                      placeholder="O que você procura? (ex: Apartamento no Centro)"
                      value={workingFilters.name}
                      onChange={(e) => handleFilterChange('name', e.target.value)}
                      className="w-full h-12 bg-white border border-slate-300 rounded-full pl-12 pr-4 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PropertySort value={filters.sort} onChange={(name, value) => handleFilterChange(name, value, true)} />
                </div>
              </section>

            {/* 🏷️ Active Filters Tags (GitHub Component) */}
            <ActiveFilterTags 
              filters={filters}
              onClearFilter={(name, value) => handleFilterChange(name, value, true)}
              onClearAll={() => handleFilterChange('CLEAR_ALL')}
            />



            {/* Lógica de Skeleton Estendida (API + Preloading de Imagens) */}
            {/* Lógica de Skeleton: Só mostramos se for a carga inicial ou se não houver dados */}
            {((isLoading || isPreloading) || (isFetching && (!data || data?.content?.length === 0))) ? (
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${isSidebarOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm">
                <i className="fa-solid fa-triangle-exclamation text-rose-500 text-4xl mb-4"></i>
                <h2 className="text-xl font-black text-slate-900 mb-2">Erro de conexão</h2>
                <p className="text-slate-500">{error.message}</p>
              </div>
            ) : data?.content?.length > 0 ? (
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-500 ${isSidebarOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-4'
                }`}>
                {data.content.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onLoad={() => setLoadedImagesCount(prev => prev + 1)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <i className="fa-solid fa-magnifying-glass text-3xl"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Nada por aqui...</h2>
                <p className="text-slate-400 max-w-xs mx-auto">Tente um filtro menos restritivo para ver mais opções.</p>
              </div>
            )}

            {data?.totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-3">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-all border border-slate-100"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(data.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${filters.page === i
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page + 1 >= data?.totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-all border border-slate-100"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 📱 Filtro Mobile Modularizado */}
      {isFilterDrawerOpen && (
        <FilterDrawerMobile
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={workingFilters}
          onFilterChange={handleFilterChange}
          onApply={handleApplyFilters}
        />
      )}
    </div>
  );
};



export default PropertiesListing;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '../services/api';
import PropertyCard from '../components/features/PropertyCard';
import PropertyCardSkeleton from '../components/features/PropertyCardSkeleton';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';

/**
 * Favorites.jsx - Área Autenticada: Meus Favoritos
 * Listagem REAL de favoritos integrada ao layout robusto.
 */
const Favorites = () => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const ITEMS_PER_PAGE = 6;

  // 📥 Busca REAL (Lista Completa para manter paridade com a API)
  const { data: allFavorites, isLoading, isFetching, isError } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    staleTime: 60000, // 1 minuto de cache para evitar loops
  });

  // ✂️ Lógica de Paginação Local (Frontend-only)
  const totalPages = allFavorites ? Math.ceil(allFavorites.length / ITEMS_PER_PAGE) : 0;
  const paginatedFavorites = allFavorites
    ? allFavorites.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
    : [];

  // Comum: Barra de Paginação para reuso superior e inferior
  const renderPagination = (extraClass = "", showDetails = true, isBottom = false) => {
    if (totalPages <= 1) return null;

    const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
      if (isBottom) {
        setTimeout(() => {
          const area = document.getElementById('content-area');
          if (area) {
            const yOffset = area.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: yOffset, behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      }
    };

    return (
      <div className={`flex items-center ${showDetails ? 'justify-between' : 'justify-end'} py-4 px-1 ${extraClass}`}>
        {showDetails && (
          <div className="flex items-start md:items-center gap-2">
            <i className="fa-solid fa-heart text-slate-300 text-[13px] mt-0.5 md:mt-0"></i>
            <div className="flex flex-col md:flex-row md:items-center md:gap-1">
              <span className="text-[13px] font-bold text-slate-500 leading-none md:leading-normal">{allFavorites?.length || 0}</span>
              <span className="text-[10px] md:text-[13px] font-bold text-slate-400 md:text-slate-500 leading-none md:leading-normal mt-0.5 md:mt-0">imóveis favoritos</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-[13px] font-bold text-slate-400">{currentPage + 1} / {totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-black shadow-sm disabled:opacity-30 disabled:grayscale transition-all"
            >
              <i className="fa-solid fa-chevron-left text-[10px]"></i>
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage + 1 >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-black shadow-sm disabled:opacity-30 disabled:grayscale transition-all"
            >
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout
      title="Meus Favoritos"
      subtitle="Gerencie aqui os imóveis que você salvou para ver mais tarde ou comparar."
    >
      {(isLoading || (isFetching && (!allFavorites || allFavorites.length === 0))) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 bg-rose-50 rounded-3xl border border-rose-100">
          <i className="fa-solid fa-triangle-exclamation text-rose-500 text-3xl mb-4"></i>
          <p className="text-rose-900 font-bold uppercase text-[10px] tracking-widest">Erro ao carregar favoritos</p>
        </div>
      ) : allFavorites?.length > 0 ? (
        <>
          {/* 📟 Paginação Superior */}
          {renderPagination("border-b border-slate-100 mb-6")}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-4">
            {paginatedFavorites.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* 📟 Paginação Inferior */}
          {renderPagination("border-t border-slate-100 mt-2", false, true)}
        </>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
            <i className="fa-regular fa-heart text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Sua lista está vazia</h3>
          <p className="text-slate-400 font-medium max-w-xs mx-auto mb-8 leading-relaxed text-sm">
            Parece que você ainda não favoritou nenhum imóvel. Que tal explorar nosso portfólio?
          </p>
          <a
            href="/imoveis"
            className="inline-flex h-12 items-center px-10 bg-slate-900 hover:bg-black text-white rounded-full text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Explorar Imóveis
          </a>
        </div>
      )}
    </AuthenticatedLayout>
  );
};

export default Favorites;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '../services/api';
import PropertyCard from '../components/features/PropertyCard';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';

/**
 * Favorites.jsx - Área Autenticada: Meus Favoritos
 * Listagem REAL de favoritos integrada ao layout robusto.
 */
const Favorites = () => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const ITEMS_PER_PAGE = 6;

  // 📥 Busca REAL (Lista Completa para manter paridade com a API)
  const { data: allFavorites, isLoading, isError } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
  });

  // ✂️ Lógica de Paginação Local (Frontend-only)
  const totalPages = allFavorites ? Math.ceil(allFavorites.length / ITEMS_PER_PAGE) : 0;
  const paginatedFavorites = allFavorites 
    ? allFavorites.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
    : [];

  return (
    <AuthenticatedLayout 
      title="Meus Favoritos"
      subtitle="Gerencie aqui os imóveis que você salvou para ver mais tarde ou comparar."
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-light h-[460px] rounded-[2.5rem]" />
          ))}
        </div>
      ) : isError ? (
         <div className="text-center py-20 bg-rose-50 rounded-3xl border border-rose-100">
           <i className="fa-solid fa-triangle-exclamation text-rose-500 text-3xl mb-4"></i>
           <p className="text-rose-900 font-bold uppercase text-[10px] tracking-widest">Erro ao carregar favoritos</p>
         </div>
      ) : allFavorites?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {paginatedFavorites.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* 📟 Paginação Local (Padrão Humilde) */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 py-10 border-t border-slate-100">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-all border border-slate-100"
              >
                <i className="fa-solid fa-chevron-left text-xs"></i>
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage + 1 >= totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-all border border-slate-100"
              >
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>
          )}
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

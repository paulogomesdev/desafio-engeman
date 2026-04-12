import React from 'react';

/**
 * PropertyCardSkeleton.jsx
 * Skeleton premium que imita a estrutura do PropertyCard real para evitar layout shift.
 */
const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col border border-slate-100 animate-pulse">
      {/* Imagem Placeholder */}
      <div className="relative aspect-[16/10] bg-slate-200" />
      
      {/* Conteúdo */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Title Placeholder */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-slate-200 rounded-lg" />
          <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
        </div>

        {/* Divider & Features */}
        <div className="py-3 border-y border-slate-50 flex gap-4">
          <div className="h-4 w-12 bg-slate-100 rounded-md" />
          <div className="h-4 w-12 bg-slate-100 rounded-md" />
        </div>

        {/* Price Placeholder */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-2 w-10 bg-slate-50 rounded" />
            <div className="h-7 w-32 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-6 w-6 bg-slate-100 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;

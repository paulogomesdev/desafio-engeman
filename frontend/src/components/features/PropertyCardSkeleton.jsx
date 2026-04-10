import React from 'react';

/**
 * PropertyCardSkeleton.jsx
 * Skeleton premium que imita a estrutura do PropertyCard real para evitar layout shift.
 */
const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col h-[460px] animate-pulse">
      {/* Imagem Placeholder */}
      <div className="relative h-64 bg-slate-200" />
      
      {/* Conteúdo */}
      <div className="p-6 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          {/* Badge Placeholder */}
          <div className="h-4 w-20 bg-slate-100 rounded-full" />
          {/* Heart Placeholder */}
          <div className="h-6 w-6 bg-slate-100 rounded-full" />
        </div>

        {/* Title Placeholder */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-slate-200 rounded-lg" />
          <div className="h-3 w-1/2 bg-slate-100 rounded-lg" />
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-50 my-2" />

        {/* Features Placeholder */}
        <div className="flex gap-4">
          <div className="h-4 w-12 bg-slate-100 rounded-md" />
          <div className="h-4 w-12 bg-slate-100 rounded-md" />
          <div className="h-4 w-12 bg-slate-100 rounded-md" />
        </div>

        {/* Price Placeholder */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="h-8 w-32 bg-slate-200 rounded-xl" />
          <div className="h-4 w-4 bg-slate-100 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;

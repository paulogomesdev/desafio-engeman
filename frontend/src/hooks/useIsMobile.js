import { useState, useEffect } from 'react';

/**
 * Custom Hook para detectar se a visualização atual é mobile (baseado no breakpoint md do Tailwind).
 * @param {number} breakpoint - Largura em pixels para considerar como mobile (default: 768px).
 * @returns {boolean} - True se for mobile (abaixo do breakpoint).
 */
export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    
    // Executa uma vez no mount para garantir sincronia
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

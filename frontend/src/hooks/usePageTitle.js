import { useEffect } from 'react';

/**
 * usePageTitle - Hook para atualizar o título da aba do navegador.
 * @param {string} title - O título específico da página.
 */
export const usePageTitle = (title) => {
  useEffect(() => {
    const baseTitle = 'Imobiliária Hub';
    if (title) {
      document.title = `${title} | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [title]);
};

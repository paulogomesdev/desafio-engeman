import { useState, useEffect } from 'react';

/**
 * Hook para evitar chamadas de API a cada tecla digitada (Otimização).
 * @param value O valor que está sendo digitado.
 * @param delay O tempo de espera em ms antes de atualizar o "debouncedValue".
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

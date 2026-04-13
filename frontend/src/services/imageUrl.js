/**
 * Utility para construção de URLs de imagem conforme o ambiente
 * Centraliza lógica de MOCK vs Produção
 */

import { USE_MOCK, API_PRODUCTION_URL, PLACEHOLDER_IMAGE_URL } from './api';

/**
 * Construir URL de imagem conforme o ambiente
 * @param {string} imageInput - URL ou caminho da imagem
 * @returns {string} URL completa da imagem
 */
export const buildImageUrl = (imageInput) => {
  // Se não tem imagem, usa placeholder
  if (!imageInput) return PLACEHOLDER_IMAGE_URL;

  // Se já é URL completa (Cloudinary, externa, ou data URL), retorna como está
  if (imageInput.startsWith('http') || imageInput.startsWith('data:')) {
    return imageInput;
  }

  // Se está em modo MOCK, retorna placeholder
  if (USE_MOCK) {
    return PLACEHOLDER_IMAGE_URL;
  }

  // Caso contrário, constrói URL baseada na API da Engeman (produção)
  const cleanPath = imageInput.replace(/^\//, '');
  return `${API_PRODUCTION_URL}/api/uploads/${cleanPath}`;
};

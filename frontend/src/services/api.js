import axios from 'axios';

// 🛠️ CONFIGURAÇÃO DE AMBIENTE
// true  -> Conecta no nosso Simulador Local (Porta 3001)
// false -> Conecta na API Real da Engeman (OnRender)
const USE_MOCK = true;

/**
 * ENUMS OFICIAIS (PDF ENGEMAN)
 */
export const PROPERTY_TYPES = {
  RESIDENCIAL: 'RESIDENCIAL',
  COMERCIAL: 'COMERCIAL',
  TERRENO: 'TERRENO',
  INDUSTRIAL: 'INDUSTRIAL',
  OUTROS: 'OUTROS'
};

const api = axios.create({
  baseURL: USE_MOCK ? 'http://localhost:3001' : 'https://d-engeman.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hub-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * SERVIÇOS DE API (Agnósticos ao ambiente)
 */

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const getProperties = async (params) => {
  const allowedFields = ['name', 'type', 'minPrice', 'maxPrice', 'minBedrooms', 'page', 'size', 'sort'];
  const cleanParams = Object.keys(params).reduce((acc, key) => {
    if (params[key] !== '' && params[key] !== 'ALL' && allowedFields.includes(key)) acc[key] = params[key];
    return acc;
  }, {});

  const response = await api.get('/api/property', { params: cleanParams });
  return response.data;
};

export const getPropertyById = async (id) => {
  const response = await api.get(`/api/property/${id}`);
  return response.data;
};

export const getUser = async () => {
  const response = await api.get('/api/user');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/api/user/update', data);
  return response.data;
};

// --- SERVIÇOS DE FAVORITOS (CONFORME DOC ENGEMAN) ---
export const getFavorites = async () => {
  const response = await api.get('/api/favorites');
  return response.data;
};

export const addFavorite = async (propertyId) => {
  const response = await api.post(`/api/favorites/${propertyId}`);
  return response.data;
};

export const removeFavorite = async (propertyId) => {
  const response = await api.delete(`/api/favorites/${propertyId}`);
  return response.data;
};

export const getLocations = async () => {
  // Nota: A Engeman não possui endpoint de cidades, usamos Mock para a lista de filtros
  if (USE_MOCK) {
    try {
      const response = await api.get('/api/property', { params: { size: 100 } });
      const locations = response.data.content.map(p => `${p.city}, ${p.state}`);
      return [...new Set(locations)].sort();
    } catch (e) { return ["São Paulo, SP", "Florianópolis, SC"]; }
  }
  return ["São Paulo, SP", "Florianópolis, SC", "Joinville, SC"];
};

export default api;

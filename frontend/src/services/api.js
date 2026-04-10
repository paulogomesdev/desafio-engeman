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
  paramsSerializer: {
    indexes: null, // by default: false (results in `type[]=...`), setting to null results in `type=...`
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hub-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⚙️ CONFIGURAÇÕES GLOBAIS DE UX
export const MIN_LOADING_TIME = 300; // ms (Tempo mínimo para os skeletons ficarem visíveis)

/**
 * ⏳ HELPER: FORÇAR TEMPO MÍNIMO (UX PREMIUM)
 * Garante que o Skeleton tenha tempo de brilhar e evita flickers em conexões ultra-rápidas.
 */
const withMinimumDelay = async (promise, ms = MIN_LOADING_TIME) => {
  const [result] = await Promise.all([
    promise,
    new Promise(resolve => setTimeout(resolve, ms))
  ]);
  return result;
};

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
    const val = params[key];
    const isNotEmptyArray = Array.isArray(val) && val.length > 0;
    const isNoAllOrEmpty = val !== '' && val !== 'ALL' && !Array.isArray(val);

    if ((isNoAllOrEmpty || isNotEmptyArray) && allowedFields.includes(key)) {
      acc[key] = val;
    }
    return acc;
  }, {});

  return withMinimumDelay(
    api.get('/api/property', { params: cleanParams }).then(res => res.data)
  );
};

export const getPropertyById = async (id) => {
  return withMinimumDelay(
    api.get(`/api/property/${id}`).then(res => res.data)
  );
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
  return withMinimumDelay(
    api.get('/api/user/favorites').then(res => res.data)
  );
};

export const addFavorite = async (propertyId) => {
  const response = await api.post(`/api/user/favorites/${propertyId}`);
  return response.data;
};

export const removeFavorite = async (propertyId) => {
  const response = await api.delete(`/api/user/favorites/${propertyId}`);
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

export const getAvailableTypes = async () => {
  if (USE_MOCK) {
    try {
      const response = await api.get('/api/property', { params: { size: 100 } });
      const types = response.data.content.map(p => p.type);
      return [...new Set(types)].sort();
    } catch (e) { return Object.keys(PROPERTY_TYPES); }
  }
  return Object.keys(PROPERTY_TYPES);
};

export default api;

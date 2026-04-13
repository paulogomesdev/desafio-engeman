import axios from 'axios';

// ⚠️ VARIÁVEIS DE AMBIENTE CARREGADAS AUTOMATICAMENTE PELO VITE

// --- API BACKEND ---
export const USE_MOCK = import.meta.env.VITE_API_USE_MOCK === 'true';
export const API_LOCAL_URL = import.meta.env.VITE_API_LOCAL_URL;
export const API_PRODUCTION_URL = import.meta.env.VITE_API_PRODUCTION_URL;

// --- ARMAZENAMENTO E TOKENS ---
export const TOKEN_STORAGE_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY;

// --- CLOUDINARY ---
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
export const CLOUDINARY_API_URL = import.meta.env.VITE_CLOUDINARY_API_URL;

// --- SERVIÇOS EXTERNOS ---
export const PLACEHOLDER_IMAGE_URL = import.meta.env.VITE_PLACEHOLDER_IMAGE_URL;
export const WHATSAPP_CONTACT_NUMBER = import.meta.env.VITE_WHATSAPP_CONTACT_NUMBER;

// --- CACHE E TIMEOUTS ---
export const QUERY_STALE_TIME = parseInt(import.meta.env.VITE_QUERY_STALE_TIME);
export const FAVORITES_STALE_TIME = parseInt(import.meta.env.VITE_FAVORITES_STALE_TIME);

// --- DEBOUNCE ---
export const DEBOUNCE_DELAY = parseInt(import.meta.env.VITE_DEBOUNCE_DELAY);

/**
 * ENUMS OFICIAIS
 */
export const PROPERTY_TYPES = {
  RESIDENCIAL: 'RESIDENCIAL',
  COMERCIAL: 'COMERCIAL',
  TERRENO: 'TERRENO',
  INDUSTRIAL: 'INDUSTRIAL',
  OUTROS: 'OUTROS'
};

const api = axios.create({
  baseURL: USE_MOCK ? API_LOCAL_URL : API_PRODUCTION_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null, // by default: false (results in `type[]=...`), setting to null results in `type=...`
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
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

export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
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

  return api.get('/api/property', { params: cleanParams }).then(res => res.data);
};

export const getPropertyById = async (id) => {
  return api.get(`/api/property/${id}`).then(res => res.data);
};

export const getUser = async () => {
  const response = await api.get('/api/user');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/api/user/update', data);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/api/user/create', userData);
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await api.get('/api/user/all', { params });
  return response.data;
};

// --- SERVIÇOS DE PROPRIEDADES (ADMIN/CORRETOR) ---
export const getUserProperties = async () => {
  return api.get('/api/property/getUserProperties').then(res => res.data);
};

export const createProperty = async (data) => {
  // Conforme Spec: POST /api/property
  const response = await api.post('/api/property', data);
  return response.data;
};

export const updateProperty = async (data) => {
  // Conforme Spec: PUT /api/property/{id}
  const { id, ...payload } = data;
  const response = await api.put(`/api/property/${id}`, payload);
  return response.data;
};

export const deleteProperty = async (id) => {
  // Conforme Spec: DELETE /api/property/{id}
  const response = await api.delete(`/api/property/${id}`);
  return response.data;
};

export const togglePropertyStatus = async (id) => {
  // Conforme Spec: PATCH /api/property/status/{id}
  const response = await api.patch(`/api/property/status/${id}`);
  return response.data;
};


// --- SERVIÇOS DE FAVORITOS (CONFORME DOC ENGEMAN) ---
export const getFavorites = async () => {
  return api.get('/api/user/favorites').then(res => res.data);
};

export const addFavorite = async (propertyId) => {
  const response = await api.post(`/api/user/favorites/${propertyId}`);
  return response.data;
};

export const removeFavorite = async (propertyId) => {
  const response = await api.delete(`/api/user/favorites/${propertyId}`);
  return response.data;
};

/**
 * 🔍 DESCOBERTA DE METADADOS (Universal)
 * Como a API não possui endpoints de 'lista de cidades' ou 'tipos', 
 * fazemos uma descoberta dinâmica baseada no inventário atual.
 */
let discoveryPromise = null;

const getDiscoveryData = () => {
  if (!discoveryPromise) {
    discoveryPromise = (async () => {
      try {
        // 1. Fazemos uma chamada leve só para descobrir o TOTAL real de imóveis
        const meta = await api.get('/api/property', { params: { size: 1 } });
        const total = meta.data.totalElements || 500; // Fallback se não vier total

        // 2. Agora buscamos TODOS os imóveis em uma única chamada de inventário
        const response = await api.get('/api/property', { params: { size: total } });
        return response.data.content;
      } catch (e) {
        console.error("Erro na varredura total:", e);
        return [];
      }
    })();
  }
  return discoveryPromise;
};

export const getAvailableTypes = async () => {
  try {
    const properties = await getDiscoveryData();
    if (properties.length === 0) return Object.keys(PROPERTY_TYPES);

    const types = properties.map(p => p.type);
    return [...new Set(types)].sort();
  } catch (e) {
    return Object.keys(PROPERTY_TYPES);
  }
};

export default api;

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Carrega os dados do JSON original
const mockDataPath = path.join(__dirname, '../frontend/src/services/mockData.json');
let properties = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')).content;

// 1. Autenticação
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const validUsers = [
    { email: 'admin@imobiliaria.com', password: '123456', name: 'Admin Hub', role: 'ADMIN' },
    { email: 'corretor@imobiliaria.com', password: '123456', name: 'Pedro Corretor', role: 'CORRETOR' },
    { email: 'cliente@gmail.com', password: '123456', name: 'Cliente Teste', role: 'CLIENTE' }
  ];

  const user = validUsers.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({
      token: `mock-jwt-token-${user.role.toLowerCase()}`,
      user: { id: 1, name: user.name, email: user.email, role: user.role }
    });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

// 2. Propriedades - Listagem com Filtros e Ordenação
app.get('/api/property', (req, res) => {
  let filtered = [...properties];
  const { name, type, minPrice, maxPrice, minBedrooms, page = 0, size = 9, sort = 'id,asc' } = req.query;

  // Filtros
  if (name) {
    const term = name.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || p.city.toLowerCase().includes(term));
  }
  if (type && type !== 'ALL') {
    filtered = filtered.filter(p => p.type === type);
  }
  if (minPrice) filtered = filtered.filter(p => p.value >= parseFloat(minPrice));
  if (maxPrice) filtered = filtered.filter(p => p.value <= parseFloat(maxPrice));
  if (minBedrooms) filtered = filtered.filter(p => p.bedrooms >= parseInt(minBedrooms));

  // Ordenação
  const [field, direction] = sort.split(',');
  filtered.sort((a, b) => {
    let valA = a[field] || 0;
    let valB = b[field] || 0;
    if (field === 'value') { valA = a.value; valB = b.value; }
    return direction === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  // Paginação
  const start = parseInt(page) * parseInt(size);
  const end = start + parseInt(size);
  const paginated = filtered.slice(start, end);

  res.json({
    content: paginated,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    size: parseInt(size),
    number: parseInt(page),
    first: parseInt(page) === 0,
    last: end >= filtered.length,
    numberOfElements: paginated.length,
    empty: paginated.length === 0
  });
});

// 3. Propriedades - Detalhes
app.get('/api/property/:id', (req, res) => {
  const found = properties.find(p => p.id === parseInt(req.params.id));
  if (found) res.json(found);
  else res.status(404).json({ message: 'Imóvel não encontrado' });
});

// 4. Usuário - Perfil (getMe)
app.get('/api/user', (req, res) => {
  // Simula o retorno do usuário baseado no token (que viria no header)
  res.json({ id: 1, name: 'Pedro Corretor', email: 'corretor@imobiliaria.com', role: 'CORRETOR' });
});

// 5. Usuário - Update
app.put('/api/user/update', (req, res) => {
  res.json({ message: 'Perfil atualizado com sucesso', ...req.body });
});

// 6. Favoritos - Listar
app.get('/api/favorites', (req, res) => {
  res.json(properties.slice(0, 2)); // Simula 2 favoritos
});

app.listen(PORT, () => {
  console.log(`\n🚀 [MOCK SERVER] Engeman Simulation rodando em http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponíveis: /api/auth/login, /api/property, /api/user\n`);
});

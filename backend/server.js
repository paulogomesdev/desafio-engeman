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

// Configuração do "Banco de Dados" Local
const dbPath = path.join(__dirname, './data/db.json');
let db = { content: [] };

const loadDB = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      db = data;
    }
  } catch (e) {
    console.error('❌ Erro ao carregar db.json:', e.message);
  }
};

const saveDB = () => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('❌ Erro ao salvar db.json:', e.message);
  }
};

loadDB();

// --- MIDDLEWARE DE AUTENTICAÇÃO E AUTORIZAÇÃO ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  const roleMatch = token.match(/mock-jwt-token-(\w+)/);
  if (!roleMatch) return res.status(403).json({ message: 'Token inválido' });

  const role = roleMatch[1].toUpperCase();
  const user = db.users.find(u => u.role === role);

  if (!user) return res.status(403).json({ message: 'Usuário não encontrado' });

  req.user = user;
  next();
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Acesso negado. Requer role: ${allowedRoles.join(' ou ')}` });
    }
    next();
  };
};

// ==========================================
// 1. AUTENTICAÇÃO (/api/auth)
// ==========================================

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({ token: `mock-jwt-token-${user.role.toLowerCase()}` });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.status(200).json({ message: 'Usuário registrado com sucesso' });
});

// ==========================================
// 2. PROPRIEDADES (/api/property)
// ==========================================

app.get('/api/property', (req, res) => {
  let filtered = [...db.content];
  const { name, type, minPrice, maxPrice, minBedrooms, page = 0, size = 10, sort = 'id' } = req.query;

  if (name) filtered = filtered.filter(p => p.name.toLowerCase().includes(name.toLowerCase()) || p.city.toLowerCase().includes(name.toLowerCase()));
  if (type && type !== 'ALL') filtered = filtered.filter(p => p.type === type);
  if (minPrice) filtered = filtered.filter(p => p.value >= parseFloat(minPrice));
  if (maxPrice) filtered = filtered.filter(p => p.value <= parseFloat(maxPrice));
  if (minBedrooms) filtered = filtered.filter(p => p.bedrooms >= parseInt(minBedrooms));

  // Ordenação Robusta (Suporta formato campo,direção ex: value,desc)
  if (sort) {
    const [field, direction] = sort.split(',');
    const sortField = field === 'price' ? 'value' : field;
    const isDesc = direction && direction.toLowerCase() === 'desc';

    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      return isDesc ? (valB - valA) : (valA - valB);
    });
  }

  const start = parseInt(page) * parseInt(size);
  const end = start + parseInt(size);
  const content = filtered.slice(start, end);

  res.json({
    content,
    pageable: { sort: { sorted: true, unsorted: false, empty: false }, offset: start, pageSize: size, pageNumber: page, paged: true, unpaged: false },
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    size: parseInt(size),
    number: parseInt(page),
    first: parseInt(page) === 0,
    last: end >= filtered.length,
    numberOfElements: content.length,
    empty: content.length === 0
  });
});

app.get('/api/property/getUserProperties', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  // ADMIN vê tudo, CORRETOR vê apenas os dele
  const myProperties = req.user.role === 'ADMIN'
    ? db.content
    : db.content.filter(p => p.brokerId === req.user.id || p.brokerName === req.user.name);
  res.json(myProperties);
});

app.get('/api/property/:id', (req, res) => {
  const found = db.content.find(p => p.id === parseInt(req.params.id));
  if (found) res.json(found);
  else res.status(404).json({ message: 'Propriedade não encontrada' });
});

app.post('/api/property', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const newId = db.content.length > 0 ? Math.max(...db.content.map(p => p.id)) + 1 : 1;
  const newProperty = {
    id: newId,
    active: true,
    brokerId: req.user.id,
    brokerName: req.user.name,
    ...req.body
  };
  db.content.push(newProperty);
  saveDB();
  res.status(201).json(newProperty);
});

app.put('/api/property/:id', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const idx = db.content.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });

  // Regra: Somente o dono ou Admin pode editar
  if (req.user.role !== 'ADMIN' && db.content[idx].brokerId !== req.user.id) {
    return res.status(403).json({ message: 'Você não tem permissão para editar este imóvel' });
  }

  db.content[idx] = { ...db.content[idx], ...req.body };
  saveDB();
  res.status(201).json(db.content[idx]);
});

app.delete('/api/property/:id', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const idx = db.content.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });

  if (req.user.role !== 'ADMIN' && db.content[idx].brokerId !== req.user.id) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  db.content = db.content.filter(p => p.id !== parseInt(req.params.id));
  saveDB();
  res.status(204).send();
});

app.patch('/api/property/status/:id', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const idx = db.content.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });

  if (req.user.role !== 'ADMIN' && db.content[idx].brokerId !== req.user.id) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  db.content[idx].active = !db.content[idx].active;
  saveDB();
  res.json(db.content[idx]);
});

// ==========================================
// 3. USUÁRIO (/api/user)
// ==========================================

app.get('/api/user', authenticateToken, (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role });
});

app.put('/api/user/update', authenticateToken, (req, res) => {
  res.status(201).json({ ...req.user, ...req.body });
});

app.post('/api/user/create', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
  const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, ...req.body };
  db.users.push(newUser);
  saveDB();
  res.status(201).json(newUser);
});

// --- FAVORITOS PERSISTENTES POR USUÁRIO ---
const getFavoritesFn = (req, res) => {
  if (!db.favorites) db.favorites = {};
  const userFavoritesIds = db.favorites[req.user.id] || [];
  const favoriteProperties = db.content.filter(p => userFavoritesIds.includes(p.id));
  res.json(favoriteProperties);
};

const postFavoriteFn = (req, res) => {
  if (!db.favorites) db.favorites = {};
  if (!db.favorites[req.user.id]) db.favorites[req.user.id] = [];

  const propertyId = parseInt(req.params.propertyId);
  if (!db.favorites[req.user.id].includes(propertyId)) {
    db.favorites[req.user.id].push(propertyId);
    saveDB();
  }
  res.status(204).send();
};

const deleteFavoriteFn = (req, res) => {
  if (!db.favorites || !db.favorites[req.user.id]) return res.status(204).send();

  const propertyId = parseInt(req.params.propertyId);
  db.favorites[req.user.id] = db.favorites[req.user.id].filter(id => id !== propertyId);
  saveDB();
  res.status(204).send();
};

// Cadastro de rotas (Suporta com e sem prefixo /api)
app.get('/api/favorites', authenticateToken, getFavoritesFn);
app.get('/favorites', authenticateToken, getFavoritesFn);

app.post('/api/favorites/:propertyId', authenticateToken, postFavoriteFn);
app.post('/favorites/:propertyId', authenticateToken, postFavoriteFn);

app.delete('/api/favorites/:propertyId', authenticateToken, deleteFavoriteFn);
app.delete('/favorites/:propertyId', authenticateToken, deleteFavoriteFn);

app.listen(PORT, () => {
  console.log(`\n🚀 [SIMULADOR ENGEMAN] On-Network em http://localhost:${PORT}`);
  console.log(`🔒 Mock Security: JWT Interceptor Ativado.`);
  console.log(`👥 Database: ${db.users.length} usuários e ${db.content.length} propriedades carregadas.\n`);
});

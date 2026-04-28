const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.set('etag', false);

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

  const tokenMatch = token.match(/mock-jwt-token-(\w+)-(\d+)/);
  if (!tokenMatch) return res.status(403).json({ message: 'Token inválido ou expirado' });

  const role = tokenMatch[1].toUpperCase();
  const userId = parseInt(tokenMatch[2]);
  const user = db.users.find(u => u.id === userId);

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
    res.json({ token: `mock-jwt-token-${user.role.toLowerCase()}-${user.id}` });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Todos os campos são obrigatórios' });

  const userExists = db.users.find(u => u.email === email);
  if (userExists) return res.status(400).json({ message: 'E-mail já cadastrado' });

  const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, name, email, password, role: 'CLIENTE' };

  db.users.push(newUser);
  saveDB();
  res.status(200).send();
});

// ==========================================
// 2. PROPRIEDADES (/api/property)
// ==========================================

// GET /api/property/getUserProperties
app.get('/api/property/getUserProperties', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const properties = req.user.role === 'ADMIN'
    ? db.content
    : db.content.filter(p => p.brokerId === req.user.id);
  res.json(properties);
});

// GET /api/property (Listagem Pública)
app.get('/api/property', (req, res) => {
  loadDB();
  // 🛡️ Filtro de Integridade Pública: Apenas imóveis ATIVOS são visíveis na home/listagem
  let filtered = db.content.filter(p => p.active === true);
  
  const { name, type, minPrice, maxPrice, minBedrooms, page = 0, size = 10, sort = 'id' } = req.query;

  if (name) filtered = filtered.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  if (type && type !== 'ALL') filtered = filtered.filter(p => p.type === type);
  if (minPrice) filtered = filtered.filter(p => p.value >= parseFloat(minPrice));
  if (maxPrice) filtered = filtered.filter(p => p.value <= parseFloat(maxPrice));
  if (minBedrooms) filtered = filtered.filter(p => p.bedrooms >= parseInt(minBedrooms));

  // Ordenação Simples
  const [field, order] = (sort || 'id').split(',');
  filtered.sort((a, b) => {
    let valA = a[field];
    let valB = b[field];
    if (typeof valA === 'string') {
      return order === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
    }
    return order === 'desc' ? valB - valA : valA - valB;
  });

  const start = parseInt(page) * parseInt(size);
  const end = start + parseInt(size);
  const content = filtered.slice(start, end);

  res.json({
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / parseInt(size)),
    size: parseInt(size),
    number: parseInt(page)
  });
});

// GET /api/property/{id}
app.get('/api/property/:id', (req, res) => {
  loadDB();
  const idValue = parseInt(req.params.id);
  if (isNaN(idValue)) return res.status(404).json({ message: 'ID Inválido' });

  const found = db.content.find(p => p.id === idValue);
  if (found) res.json(found);
  else res.status(404).json({ message: 'Propriedade não encontrada' });
});

// POST /api/property (CONFORME SPEC)
app.post('/api/property', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const { name, description, type, value, area, bedrooms, address, city, state, imageUrls } = req.body;

  // Validação Estrita DTO
  if (!name || name.length < 10 || name.length > 100) return res.status(400).json({ message: 'Nome deve ter entre 10 e 100 caracteres' });
  if (!value || value <= 0) return res.status(400).json({ message: 'Valor deve ser positivo' });
  if (!area || area <= 0) return res.status(400).json({ message: 'Área deve ser positiva' });

  const newId = db.content.length > 0 ? Math.max(...db.content.map(p => p.id)) + 1 : 1;
  const newProperty = { 
    id: newId, name, description, type, value: Number(value), area: Number(area), 
    bedrooms: Number(bedrooms), address, city, state, active: true, 
    brokerId: req.user.id, brokerName: req.user.name, imageUrls 
  };

  db.content.push(newProperty);
  saveDB();
  res.status(201).json(newProperty);
});

// PUT /api/property/{id} (CONFORME SPEC)
app.put('/api/property/:id', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const idValue = parseInt(req.params.id);
  const idx = db.content.findIndex(p => p.id === idValue);
  
  if (idx === -1) return res.status(404).json({ message: 'Propriedade não encontrada' });
  
  // Verificação de Ownership
  if (req.user.role !== 'ADMIN' && db.content[idx].brokerId !== req.user.id) {
    return res.status(403).json({ message: 'Acesso negado: você não é o dono deste imóvel' });
  }

  const updates = req.body;
  if (updates.name && (updates.name.length < 10 || updates.name.length > 100)) {
    return res.status(400).json({ message: 'Nome deve ter entre 10 e 100 caracteres' });
  }

  db.content[idx] = { ...db.content[idx], ...updates, id: idValue }; // Garante que o ID não mude
  saveDB();
  res.status(201).json(db.content[idx]);
});

// DELETE /api/property/{id} (CONFORME SPEC)
app.delete('/api/property/:id', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const idValue = parseInt(req.params.id);
  const idx = db.content.findIndex(p => p.id === idValue);
  
  if (idx === -1) return res.status(404).json({ message: 'Propriedade não encontrada' });
  if (req.user.role !== 'ADMIN' && db.content[idx].brokerId !== req.user.id) {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  db.content = db.content.filter(p => p.id !== idValue);
  saveDB();
  res.status(204).send();
});

// PATCH /api/property/status/{id} (CONFORME SPEC)
app.patch('/api/property/status/:id', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const idValue = parseInt(req.params.id);
  const idx = db.content.findIndex(p => p.id === idValue);
  
  if (idx === -1) return res.status(404).json({ message: 'Propriedade não encontrada' });
  if (req.user.role !== 'ADMIN' && db.content[idx].brokerId !== req.user.id) {
    return res.status(403).json({ message: 'Acesso negado' });
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
  const userIdx = db.users.findIndex(u => u.id === req.user.id);
  if (userIdx === -1) return res.status(404).json({ message: 'Usuário não encontrado' });
  
  const { name, password } = req.body;
  if (name) db.users[userIdx].name = name;
  if (password) db.users[userIdx].password = password;
  
  saveDB();
  res.status(201).json({ id: db.users[userIdx].id, name: db.users[userIdx].name, email: db.users[userIdx].email, role: db.users[userIdx].role });
});

app.post('/api/user/create', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
  const { name, email, password, role } = req.body;
  const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, name, email, password, role };
  db.users.push(newUser);
  saveDB();
  res.status(201).json({ id: newId, name, email, role });
});

app.get('/api/user/favorites', authenticateToken, (req, res) => {
  if (!db.favorites) db.favorites = {};
  const ids = db.favorites[req.user.id] || [];
  res.json(db.content.filter(p => ids.includes(p.id)));
});

app.post('/api/user/favorites/:propertyId', authenticateToken, (req, res) => {
  if (!db.favorites) db.favorites = {};
  if (!db.favorites[req.user.id]) db.favorites[req.user.id] = [];
  const propertyId = parseInt(req.params.propertyId);
  if (!db.favorites[req.user.id].includes(propertyId)) {
    db.favorites[req.user.id].push(propertyId);
    saveDB();
  }
  res.status(204).send();
});

app.delete('/api/user/favorites/:propertyId', authenticateToken, (req, res) => {
  if (!db.favorites || !db.favorites[req.user.id]) return res.status(204).send();
  const propertyId = parseInt(req.params.propertyId);
  db.favorites[req.user.id] = db.favorites[req.user.id].filter(id => id !== propertyId);
  saveDB();
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`\n🚀 [SIMULADOR ENGEMAN] On http://localhost:${PORT}`);
  console.log(`🔒 Modo Compliance 100%: Ativado (Fiel à Spec v1.0)\n`);
});


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
app.set('etag', false); // Forçar 200 OK e evitar 304 para fins de demonstração literal

// 📸 MOCK UPLOAD ENDPOINT (Para evitar 404 ao subir fotos no simulator)
app.post('/api/upload', (req, res) => {
  console.log('🖼️ MOCK: Simulando upload de imagem...');
  // Retorna um placeholder do Unsplash para não quebrar o layout
  const placeholders = [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1497366216548-37526070297c"
  ];
  const random = placeholders[Math.floor(Math.random() * placeholders.length)];
  res.json({ url: `${random}?auto=format&fit=crop&w=1200&q=80` });
});

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

  // Null-safety antes de acessar propriedades
  if (!name || !email || !password) return res.status(400).json({ message: 'Todos os campos são obrigatórios' });

  // Validações RegisterDTO
  if (name.length < 3 || name.length > 100) return res.status(400).json({ message: 'Nome deve ter entre 3 e 100 caracteres' });
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return res.status(400).json({ message: 'E-mail inválido' });
  if (password.length < 6) return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });

  const userExists = db.users.find(u => u.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'E-mail já cadastrado' });
  }

  const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, name, email, password, role: 'CLIENTE' };

  db.users.push(newUser);
  saveDB();

  res.status(200).send(); // Response (200 OK) conforme doc
});

// ==========================================
// 2. PROPRIEDADES (/api/property)
// ==========================================

app.get('/api/property', (req, res) => {
  loadDB(); // Recarregar do disco para refletir mudanças manuais
  let filtered = [...db.content];
  const { name, type, minPrice, maxPrice, minBedrooms, page = 0, size = 10, sort = 'id' } = req.query;

  if (name) filtered = filtered.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  if (type) filtered = filtered.filter(p => p.type === type);
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
    pageable: { sort: { sorted: true, unsorted: false, empty: false }, offset: start, pageSize: parseInt(size), pageNumber: parseInt(page), paged: true, unpaged: false },
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / parseInt(size)),
    size: parseInt(size),
    number: parseInt(page),
    first: parseInt(page) === 0,
    last: end >= filtered.length,
    numberOfElements: content.length,
    empty: content.length === 0
  });
});



app.get('/api/property/getUserProperties', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const { page = 0, size = 10, name = '' } = req.query;
  let filtered = req.user.role === 'ADMIN'
    ? db.content
    : db.content.filter(p => p.brokerId === req.user.id);

  if (name) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  const start = parseInt(page) * parseInt(size);
  const end = start + parseInt(size);
  const content = filtered.slice(start, end);

  res.json({
    content,
    pageable: { sort: { sorted: true, unsorted: false, empty: false }, offset: start, pageSize: parseInt(size), pageNumber: parseInt(page), paged: true, unpaged: false },
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / parseInt(size)),
    size: parseInt(size),
    number: parseInt(page),
    first: parseInt(page) === 0,
    last: end >= filtered.length,
    numberOfElements: content.length,
    empty: content.length === 0
  });
});

app.get('/api/property/:id', (req, res) => {
  loadDB(); // Recarregar do disco para refletir mudanças manuais
  const found = db.content.find(p => p.id === parseInt(req.params.id));
  if (found) res.json(found);
  else res.status(404).json({ message: 'Propriedade não encontrada' });
});

app.post('/api/property', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const { name, description, type, value, area, bedrooms, address, city, state, imageUrls } = req.body;

  // Validações PropertyCreateDTO
  if (!name || name.length < 10 || name.length > 100) return res.status(400).json({ message: 'Nome inválido (10-100 caracteres)' });
  if (!description) return res.status(400).json({ message: 'Descrição é obrigatória' });
  if (!type) return res.status(400).json({ message: 'Tipo é obrigatório' });
  if (!value || value <= 0) return res.status(400).json({ message: 'Valor deve ser positivo' });
  if (!area || area <= 0) return res.status(400).json({ message: 'Área deve ser positiva' });
  if (!bedrooms || bedrooms <= 0) return res.status(400).json({ message: 'Quartos deve ser positivo' });
  if (!address || !city || !state) return res.status(400).json({ message: 'Endereço incompleto' });
  if (!imageUrls) return res.status(400).json({ message: 'URLs de imagem são obrigatórias' });

  const newId = db.content.length > 0 ? Math.max(...db.content.map(p => p.id)) + 1 : 1;
  const newProperty = {
    id: newId,
    name,
    description,
    type,
    value,
    area,
    bedrooms,
    address,
    city,
    state,
    active: true,
    brokerId: req.user.id,
    brokerName: req.user.name,
    imageUrls
  };
  db.content.push(newProperty);
  saveDB();
  res.status(201).json(newProperty); // Response (201 Created)
});



app.put('/api/property/:id', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const idx = db.content.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });

  // Regra: Somente o dono ou Admin pode editar
  if (req.user.role !== 'ADMIN' && db.content[idx].brokerId !== req.user.id) {
    return res.status(403).json({ message: 'Você não tem permissão para editar este imóvel' });
  }

  // Validações PropertyUpdateDTO (Opcionais mas validados se presentes)
  if (req.body.name !== undefined && (req.body.name.length < 10 || req.body.name.length > 100)) return res.status(400).json({ message: 'Nome inválido (10-100 caracteres)' });
  if (req.body.value !== undefined && req.body.value <= 0) return res.status(400).json({ message: 'Valor deve ser positivo' });
  if (req.body.area !== undefined && req.body.area <= 0) return res.status(400).json({ message: 'Área deve ser positiva' });
  if (req.body.bedrooms !== undefined && req.body.bedrooms <= 0) return res.status(400).json({ message: 'Quartos deve ser positivo' });

  // PropertyUpdateDTO whitelist — apenas campos do DTO são aceitos
  const allowedUpdateFields = ['name', 'description', 'type', 'value', 'area', 'bedrooms', 'address', 'city', 'state', 'brokerId'];
  const updates = {};
  allowedUpdateFields.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  db.content[idx] = { ...db.content[idx], ...updates };
  saveDB();
  res.status(201).json(db.content[idx]); // Response (201 Created)
});

app.delete('/api/property/:id', authenticateToken, authorizeRoles('ADMIN', 'CORRETOR'), (req, res) => {
  const propertyId = parseInt(req.params.id);
  const idx = db.content.findIndex(p => p.id === propertyId);
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });

  const property = db.content[idx];

  if (req.user.role !== 'ADMIN' && property.brokerId !== req.user.id) {
    return res.status(403).json({ message: 'Permissão negada' });
  }

  // 1. Apagar do Banco de Dados
  db.content = db.content.filter(p => p.id !== propertyId);

  // 2. Limpar Referência de Favoritos em TODOS os usuários
  if (db.favorites) {
    Object.keys(db.favorites).forEach(userId => {
      db.favorites[userId] = db.favorites[userId].filter(favId => favId !== propertyId);
    });
  }

  // 3. Simular Remoção do Cloudinary (Exigiria Admin API Secret do Cloudinary)
  if (property.imageUrls) {
    const images = property.imageUrls.split(',').filter(u => u);
    console.log(`[Cloudinary] Simulando exclusão física de ${images.length} imagens atreladas ao imóvel ID ${propertyId}`);
    // Exemplo de como seria com o SDK:
    // cloudinary.v2.api.delete_resources(images.map(extractPublicId), { type: 'upload', resource_type: 'image' })
  }

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
  const userIdx = db.users.findIndex(u => u.id === req.user.id);
  if (userIdx === -1) return res.status(404).json({ message: 'Usuário não encontrado' });

  // UserUpdateDTO (Engeman Spec): validações opcionais mas rigorosas se presentes
  const { name, password } = req.body;
  if (name !== undefined) {
    if (name.length < 3 || name.length > 100) return res.status(400).json({ message: 'Nome deve ter entre 3 e 100 caracteres' });
    db.users[userIdx].name = name;
  }
  if (password !== undefined) {
    if (password.length < 6) return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
    db.users[userIdx].password = password;
  }

  saveDB();

  const updatedUser = {
    id: db.users[userIdx].id,
    name: db.users[userIdx].name,
    email: db.users[userIdx].email,
    role: db.users[userIdx].role
  };

  res.status(201).json(updatedUser);
});

app.post('/api/user/create', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
  const { name, email, password, role } = req.body;

  // Validações UserCreateDTO
  if (!name || name.length < 3 || name.length > 100) return res.status(400).json({ message: 'Nome inválido (3-100 caracteres)' });
  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return res.status(400).json({ message: 'E-mail inválido' });
  if (!password || password.length < 6) return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
  if (!['ADMIN', 'CORRETOR', 'CLIENTE'].includes(role)) return res.status(400).json({ message: 'Cargo (role) inválido' });

  const userExists = db.users.find(u => u.email === email);
  if (userExists) return res.status(400).json({ message: 'E-mail já cadastrado' });

  const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, name, email, password, role };

  db.users.push(newUser);
  saveDB();
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword); // Response (201 Created) — sem expor password
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

// Cadastro de rotas (ESTRITO: Documentação Engeman Seção 3. Usuário - Base Path: /api/user)
app.get('/api/user/favorites', authenticateToken, getFavoritesFn);
app.post('/api/user/favorites/:propertyId', authenticateToken, postFavoriteFn);
app.delete('/api/user/favorites/:propertyId', authenticateToken, deleteFavoriteFn);

app.listen(PORT, () => {
  console.log(`\n🚀 [SIMULADOR ENGEMAN] On-Network em http://localhost:${PORT}`);
  console.log(`🔒 Mock Security: JWT Interceptor Ativado.`);
  console.log(`👥 Database: ${db.users.length} usuários e ${db.content.length} propriedades carregadas.\n`);
});

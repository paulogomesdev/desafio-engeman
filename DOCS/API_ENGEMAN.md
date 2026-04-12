# 📘 Documentação Oficial da API Engeman

> **Base URL:** `https://d-engeman.onrender.com`
> **Fonte:** PDF "Desafio Técnico – Desenvolvedor Front-end (Pedro)"
> **Última Atualização:** Abril 2026

---

## 1. Autenticação

**Base Path:** `/api/auth`

### POST /login

Autentica um usuário e retorna o token JWT.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Header de Autenticação (para todas as rotas protegidas):**
```
Authorization: Bearer <token>
```

---

### POST /register

Registra um novo usuário.

**Request Body (RegisterDTO):**
```json
{
  "name": "João Silva",        // min 3, max 100 caracteres, não vazio
  "email": "joao@example.com", // formato de e-mail válido, não vazio
  "password": "senhaSegura123" // min 6 caracteres, não vazio
}
```

**Response:** `200 OK` (sem body)

---

## 2. Propriedades

**Base Path:** `/api/property`

### GET /

Lista propriedades com paginação e filtros opcionais.

**Query Params (todos opcionais):**

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `name` | String | — | Filtro por nome |
| `type` | Enum | — | Tipo do imóvel |
| `minPrice` | Double | — | Preço mínimo |
| `maxPrice` | Double | — | Preço máximo |
| `minBedrooms` | Integer | — | Mínimo de quartos |
| `page` | Integer | `0` | Número da página |
| `size` | Integer | `10` | Itens por página |
| `sort` | String | `"id"` | Campo de ordenação |

**Enum `type`:**
```
RESIDENCIAL | COMERCIAL | TERRENO | INDUSTRIAL | OUTROS
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Apartamento no Centro",
      "description": "Lindo apartamento com 3 quartos.",
      "type": "RESIDENCIAL",
      "value": 350000.00,
      "area": 85,
      "bedrooms": 3,
      "address": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "active": true,
      "brokerId": 2,
      "brokerName": "Corretor Silva",
      "imageUrls": "https://img1.com,https://img2.com"
    }
  ],
  "pageable": { "..." : "..." },
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

**Objeto Property (campos retornados):**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Long | ID único gerado |
| `name` | String | Nome do imóvel |
| `description` | String | Descrição detalhada |
| `type` | Enum | Tipo (RESIDENCIAL, COMERCIAL, etc.) |
| `value` | Double | Valor de venda |
| `area` | Integer | Área em m² |
| `bedrooms` | Integer | Número de quartos |
| `address` | String | Endereço completo |
| `city` | String | Cidade |
| `state` | String | UF (Estado) |
| `active` | Boolean | Status ativo/inativo |
| `brokerId` | Long | ID do corretor responsável |
| `brokerName` | String | Nome do corretor |
| `imageUrls` | String | URLs de imagens separadas por vírgula |

---

### GET /{id}

Busca os detalhes de uma propriedade específica.

**Path Variable:** `id` (Long)

**Response (200 OK):** mesmo objeto da lista acima.

---

### GET /getUserProperties

Lista todas as propriedades cadastradas pelo corretor logado.

**Requer:** Autenticação JWT

**Response (200 OK):** lista do mesmo objeto de propriedade.

---

### POST /

Cria uma nova propriedade.

**Requer:** Autenticação JWT

**Request Body (PropertyCreateDTO):**
```json
{
  "name": "Casa de Praia",             // min 10, max 100 caracteres, não nulo/vazio
  "description": "Excelente vista.",    // não vazio
  "type": "RESIDENCIAL",               // não nulo (Enum)
  "value": 500000.00,                  // não nulo, positivo
  "area": 120,                         // não nulo, positivo
  "bedrooms": 4,                       // não nulo, positivo
  "address": "Av. Beira Mar, 100",     // não vazio
  "city": "Rio de Janeiro",            // não vazio
  "state": "RJ",                       // não vazio
  "imageUrls": "https://img.com/1.jpg" // não vazio
}
```

> ⚠️ **NÃO inclui:** `active`, `brokerId`, `brokerName` — esses são definidos pelo backend.

**Response (201 Created):** objeto da propriedade com ID gerado (mesmo formato do GET).

---

### PUT /{id}

Atualiza uma propriedade existente.

**Requer:** Autenticação JWT

**Path Variable:** `id` (Long)

**Request Body (PropertyUpdateDTO) — todos os campos são OPCIONAIS:**
```json
{
  "name": "Casa de Praia Atualizada",  // min 10, max 100 caracteres
  "description": "Nova descrição.",
  "type": "RESIDENCIAL",
  "value": 480000.00,                  // positivo
  "area": 125,                         // positivo
  "bedrooms": 5,                       // positivo
  "address": "Av. Beira Mar, 102",
  "city": "Rio de Janeiro",
  "state": "RJ",
  "brokerId": 2                        // Long — permite reatribuir corretor
}
```

> ⚠️ **NÃO inclui:** `active`, `imageUrls`, `brokerName` — esses NÃO fazem parte do UpdateDTO.

**Response (201 Created):** objeto da propriedade atualizado.

---

### DELETE /{id}

Deleta uma propriedade.

**Requer:** Autenticação JWT + privilégios (dono ou ADMIN)

**Path Variable:** `id` (Long)

**Response:** `204 No Content`

---

### PATCH /status/{id}

Altera o status (ativo/inativo) de uma propriedade.

**Requer:** Autenticação JWT

**Path Variable:** `id` (Long)

**Response (200 OK):** objeto da propriedade atualizado com a flag `active` alternada.

---

## 3. Usuário

**Base Path:** `/api/user`

### GET /

Retorna os dados do usuário autenticado (getMe).

**Requer:** Autenticação JWT

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "CORRETOR"
}
```

---

### PUT /update

Atualiza os dados do usuário logado.

**Requer:** Autenticação JWT

**Request Body (UserUpdateDTO) — campos OPCIONAIS:**
```json
{
  "name": "João Santos Silva",   // min 3, max 100 caracteres
  "password": "novaSenhaSec"     // min 6 caracteres
}
```

**Response (201 Created):** objeto do usuário atualizado.

---

### POST /create

Cria um novo usuário com função específica.

**Requer:** Autenticação JWT + Permissão de ADMIN (`hasRole('ADMIN')`)

**Request Body (UserCreateDTO):**
```json
{
  "name": "Admin Sistema",       // min 3, max 100 caracteres, não vazio
  "email": "admin@example.com",  // formato de e-mail válido, não vazio
  "password": "senhaForteAdmin", // min 6 caracteres, não vazio
  "role": "ADMIN"                // não nulo (Enum)
}
```

**Enum `role`:**
```
ADMIN | CORRETOR | CLIENTE
```

**Response (201 Created):** objeto do usuário recém-criado.

---

### GET /favorites

Lista as propriedades favoritadas pelo usuário logado.

**Requer:** Autenticação JWT

**Response (200 OK):** lista de propriedades (mesmo formato de `/api/property`).

---

### POST /favorites/{propertyId}

Adiciona uma propriedade aos favoritos do usuário logado.

**Requer:** Autenticação JWT

**Path Variable:** `propertyId` (Long)

**Response:** `204 No Content`

---

### DELETE /favorites/{propertyId}

Remove uma propriedade dos favoritos do usuário.

**Requer:** Autenticação JWT

**Path Variable:** `propertyId` (Long)

**Response:** `204 No Content`

---

## 4. Usuários Padrão

| Role | Email | Senha | Permissões |
|------|-------|-------|------------|
| **ADMIN** | `admin@imobiliaria.com` | `123456` | Criar novos usuários (admins/corretores), cadastrar e gerenciar qualquer imóvel |
| **CORRETOR** | `corretor@imobiliaria.com` | `123456` | Cadastrar novos imóveis e gerenciar apenas os imóveis criados por ele |
| **CLIENTE** | `cliente@gmail.com` | `123456` | Apenas visualizar imóveis, filtrar e favoritar |

---

## 5. Resumo dos DTOs (Quick Reference)

### PropertyCreateDTO (POST)
| Campo | Obrigatório | Validação |
|-------|-------------|-----------|
| name | ✅ | min 10, max 100 chars |
| description | ✅ | não vazio |
| type | ✅ | Enum |
| value | ✅ | positivo |
| area | ✅ | positivo |
| bedrooms | ✅ | positivo |
| address | ✅ | não vazio |
| city | ✅ | não vazio |
| state | ✅ | não vazio |
| imageUrls | ✅ | não vazio |

### PropertyUpdateDTO (PUT)
| Campo | Obrigatório | Validação |
|-------|-------------|-----------|
| name | ❌ | min 10, max 100 chars |
| description | ❌ | — |
| type | ❌ | Enum |
| value | ❌ | positivo |
| area | ❌ | positivo |
| bedrooms | ❌ | positivo |
| address | ❌ | — |
| city | ❌ | — |
| state | ❌ | — |
| brokerId | ❌ | Long |

### RegisterDTO (POST /auth/register)
| Campo | Obrigatório | Validação |
|-------|-------------|-----------|
| name | ✅ | min 3, max 100 chars |
| email | ✅ | formato de e-mail válido |
| password | ✅ | min 6 chars |

### UserUpdateDTO (PUT /user/update)
| Campo | Obrigatório | Validação |
|-------|-------------|-----------|
| name | ❌ | min 3, max 100 chars |
| password | ❌ | min 6 chars |

### UserCreateDTO (POST /user/create)
| Campo | Obrigatório | Validação |
|-------|-------------|-----------|
| name | ✅ | min 3, max 100 chars |
| email | ✅ | formato de e-mail válido |
| password | ✅ | min 6 chars |
| role | ✅ | Enum (ADMIN, CORRETOR, CLIENTE) |

---

> **Este documento é a fonte de verdade para validações de conformidade.**
> Qualquer divergência entre o código e esta spec deve ser tratada como bug.

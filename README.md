# Desafio Engeman 🏘️

Uma plataforma premium de gestão e listagem de imóveis industriais e residenciais, desenvolvida com foco em alta performance, segurança e uma experiência de usuário (UX) excepcional.

---

## 🚀 Sobre o Projeto

O projeto foi concebido como um desafio técnico para criar uma interface de gestão imobiliária. O sistema permite a listagem pública de imóveis com filtros avançados, além de uma área administrativa protegida para corretores e administradores gerenciarem seus inventários.

### 💡 A Solução de Mock API
Devido a instabilidades técnicas na API oficial da Engeman durante o período de desenvolvimento, implementamos um **Simulador de Backend (Mock API)** robusto. 
- Ele replica 100% dos métodos (GET, POST, PUT, DELETE, PATCH) da especificação oficial.
- Utiliza persistência local em JSON.
- Garante que o desenvolvimento do Frontend não fosse interrompido por falhas de infraestrutura externa.

---

## 🛠️ Stack Tecnológica

O projeto utiliza o que há de mais moderno no ecossistema Web de 2025:

- **Core**: [React 18+](https://react.dev/) com [Vite](https://vitejs.dev/) (Build ultra-rápida).
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) (Design systems via CSS-first).
- **Gestão de Estado**: [React Context API](https://react.dev/learn/passing-data-deeply-with-context) & [React Query (TanStack)](https://tanstack.com/query/latest) para cache e sincronização de dados.
- **Navegação**: [React Router 7](https://reactrouter.com/).
- **Comunicação**: [Axios](https://axios-http.com/) com Interceptors para gestão de JWT.
- **Imagens**: Integração direta com [Cloudinary](https://cloudinary.com/) para upload e otimização.
- **Mapas**: [Leaflet](https://leafletjs.com/) para visualização de localização.

---

## ⚙️ Configuração e Instalação

O projeto está dividido em duas pastas principais: `frontend` e `backend`.

### 🪟 Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### 1. Backend (Simulador)
```bash
cd backend
npm install
npm start
```
*O servidor rodará em `http://localhost:3001`.*

### 2. Frontend
```bash
cd frontend
npm install
```

**Configuração do Ambiente:**
Antes de rodar, copie o arquivo `.env.example` para `.env.local` e preencha as variáveis necessárias (URLs da API, Chaves do Cloudinary, etc).

```bash
cp .env.example .env.local
npm run dev
```
*O frontend rodará em `http://localhost:5173`.*

---

## 🛡️ Gestão de Ambiente (.env)

O projeto utiliza uma arquitetura baseada em variáveis de ambiente para garantir segurança e flexibilidade:
- `VITE_API_USE_MOCK`: Alterna instantaneamente entre o Simulador Local e a API de Produção.
- `VITE_API_PRODUCTION_URL`: Endpoint oficial da Engeman.
- `VITE_CLOUDINARY_*`: Credenciais para upload de imagens.

---

## 👨‍💻 Desenvolvedor
**Pedro Paulo Gomes de Souza**
*IDE: Antigravity AI (Google DeepMind)*

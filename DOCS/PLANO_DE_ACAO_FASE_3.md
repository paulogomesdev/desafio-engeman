# 🚀 Plano de Ação: Fase 3 — Área Autenticada e Favoritos
**Projeto**: Imobiliária Hub  
**Escopo**: Autenticação, Gerenciamento de Perfil e Sistema de Favoritos.

---

## 1. Objetivos da Fase
Implementar o ecossistema de acesso restrito do usuário, garantindo a persistência da identidade (JWT) e a interatividade com os anúncios através de favoritos, respeitando os contratos da API real.

---

## 2. Cronograma de Implementação

### Passo 1: Infraestrutura de Segurança & Estado
*   **AuthContext**: Criar o provedor de estado global (Context API) para gerenciar o login, logout e informações do usuário.
*   **Persistência**: Implementar lógica de salvamento e recuperação do token JWT via `localStorage`.
*   **Interceptor de API**: Configurar o Axios para injetar o header `Authorization: Bearer <token>` em todas as requisições se um token existir.
*   **Gating de Rotas**: Criar o componente `ProtectedRoute` para blindar as páginas `/perfil`, `/favoritos` e `/minhas-propriedades`.

### Passo 2: UX de Acesso (Login & Register)
*   **Interface de Autenticação**: Criar as páginas `/login` e `/registro` seguindo o design *industrial-clean* (fundo sólido, bordas finas, tipografia Jakarta).
*   **Header Dinâmico**: 
    *   Substituir o botão "Corretor" pelo dropdown **"Minha Conta"** quando autenticado.
    *   Adicionar ícone de autenticação (user-circle/shield) conforme solicitado.

### Passo 3: Gerenciamento de Perfil (User Account)
*   **Página "Meu Perfil"**: Implementar o consumo do endpoint `GET /api/user/` (`getMe`).
*   **Atualização de Dados**: Formulário para edição de nome e troca de senha (opcional), consumindo `PUT /api/user/update`.
*   **Feedback Visual**: Micro-interações de "Sucesso" ou "Erro" ao salvar alterações.

### Passo 4: Motor de Favoritos (Interaction)
*   **Endpoint Integration**: Implementar as chamadas para `POST /favorites/{id}` e `DELETE /favorites/{id}`.
*   **Visual Toggle**: Adicionar o ícone de coração nos cards de imóveis e na página de detalhes, com estado reativo (coração preenchido se o imóvel for favorito).
*   **Página "Meus Favoritos"**: Listagem dedicada que consome `GET /api/user/favorites`.

---

## 3. Conformidade Técnica (Checklist PDF)
- [ ] Persistência de Token JWT via Header Authorization.
- [ ] Telas de Login e Registro funcionais.
- [ ] Proteção de rotas privadas.
- [ ] UI de Perfil com atualização de nome e senha.
- [ ] Sistema de favoritar/desfavoritar integrado aos cards.

---

## 4. Estratégia de Mock (Fase 3)
Enquanto a API real estiver instável, o sistema simulará um **Login Mock**:
- Aceitará qualquer credencial válida (formato e-mail).
- Armazenará um token fictício.
- Permitirá navegar por todas as páginas privadas como se estivesse conectado.

---
**Documento de Planejamento gerado por Antigravity.**

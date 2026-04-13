# Manifesto de Engenharia

> **"Mais que código: uma jornada de engenharia compartilhada."**

Este documento define os princípios fundamentais que guiarão o desenvolvimento deste projeto. Ele serve como nossa bússola técnica e pedagógica, garantindo que o **Desenvolvedor** tenha total domínio e responsabilidade sobre o produto final.

---

## 1. Princípios de Desenvolvimento

### 🚀 Otimização & Alta Performance
Não aceitaremos desperdício de recursos. Cada Hook, re-render e requisição deve ser pensado para a máxima eficiência. Utilizaremos memoização estratégica e lazy loading onde couber.

### 🧩 Modularidade Atômica & Reúso
Seguiremos a filosofia de componentes pequenos, especializados e altamente reutilizáveis (DRY). A arquitetura deve ser centrada em uma biblioteca de componentes interna que facilite a manutenção e escala.

### 🧠 Intencionalidade no Código
Cada linha de código deve ter um propósito claro. Não aceitaremos "código mágico". Se uma função existe, devemos saber por que ela existe, como ela funciona e quais são seus efeitos colaterais.

### 📱 Padronização de Componentes Híbridos (Mobile-First)
Para componentes que unificam as interfaces Mobile e Desktop no mesmo arquivo, utilizaremos obrigatoriamente a separação visual por comentários com emojis. Isso garante escaneabilidade imediata do código:

*   **Mobile**: `{/* 📱 Interface Mobile (Descrição do Aspecto) */}`
*   **Desktop**: `{/* 🛡️ Interface Desktop (Descrição do Aspecto) */}`

Este padrão deve ser seguido em todos os componentes de `features/` que possuem layouts divergentes por breakpoint.

---

## 🏗️ Pilares da Nossa Engenharia

### 1. O Código como Livro Aberto
Nós não trabalhamos com "caixas pretas". Cada componente, Hook ou serviço criado será acompanhado de uma explicação **End-to-End**. 

- **O quê?** (A funcionalidade)
- **Como?** (A implementação técnica)
- **Por quê?** (A decisão arquitetural e o impacto na performance)

### 2. Fundamentos sobre Abstrações
Embora usemos ferramentas modernas, priorizaremos o entendimento dos fundamentos:
  - **Tailwind CSS v4** para agilidade de design e consistência de tokens.
  - **Hooks Nativos** para domínio do ciclo de vida e estado.
  - **JavaScript Moderno** para manipulação eficiente de dados.

### 3. UX Premium & "Wow Factor"
Não entregaremos apenas um site funcional. Aplicaremos os padrões de design da nossa biblioteca `.agent`, garantindo:
- **Resiliência Visual**: Skeleton loadings, tratativa de erros amigável.
- **Interatividade**: Micro-animações e feedbacks imediatos.
- **SEO & Performance**: Core Web Vitals no centro da estratégia.

---

## 🎯 O Desafio: Real Estate Hub

Nosso objetivo é construir um sistema robusto de gestão imobiliária capaz de lidar com autenticação JWT, filtragem complexa e gestão de estados autenticados.

### 🧩 Módulos Principais
1.  **Motor de Busca & Filtros**: Implementação de `debounce`, paginação e sincronização de estado com a URL (`querystring`).
2.  **Fluxo de Autenticação**: Sistema seguro de login/registro com persistência de JWT e rotas protegidas por Roles (ADMIN, CORRETOR, CLIENTE).
3.  **Gestão de Imóveis**: CRUD completo para corretores e admins, com integração de upload e galeria de imagens.

---

## 🎓 Metodologia de Mentoria

| Fase | Ação | Mentoria Focada |
| :--- | :--- | :--- |
| **I. Setup** | Inicialização com Vite + Estrutura Modular. | Por que Vite? Organização de pastas escalável. |
| **II. Core** | Autenticação e Context API. | Segurança no Client, JWT e Interceptors. |
| **III. Data** | Listagem, Filtros e Sincronização. | Otimização de busca, Performance do DOM. |
| **IV. Advanced** | CRUD e Áreas Protegidas. | Gestão de Formulários, Feedback ao Usuário. |

---

## 🛠️ Stack Técnica Consolidada

- **Frontend**: React 18+ (Vite)
- **Estilo**: Tailwind CSS (v4 standard)
- **Estado**: React Context & Hooks
- **Navegação**: React Router (com guardas de rota)
- **API**: Axios (com interceptores para JWT)

---

*Desenvolvedor: Pedro Paulo Gomes de Souza | Assistência: Antigravity AI*

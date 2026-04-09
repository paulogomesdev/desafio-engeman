# 🎨 Industrial Clean Style Guide - Imobiliária Hub

> **Single Source of Truth** para design e arquitetura visual.
> Este documento deve ser consultado por agentes antes de iniciar qualquer novo módulo UI.

## 🏛️ 1. Identidade Visual
- **Tipografia**: `font-jakarta` (Plus Jakarta Sans).
- **Escala**: Títulos `text-3xl+`, navegação `text-xs/sm`.
- **Bordas**: `rounded-xl` para botões, `rounded-2xl` para containers/cards.
- **Grids**: Desktop em 12 colunas. Mídia em proporção 3:2.

## 🎨 2. Paleta de Cores (Tailwind)
- **Primary**: `blue-600` (#2563eb) - Foco, Links, Ícones.
- **Success**: `emerald-500` (#10b981) - WhatsApp, Disponibilidade, Conversão.
- **Danger**: `red-500` (#ef4444) - Favoritos (Active).
- **Slate System**: 
  - `slate-900`: Texto principal.
  - `slate-400/500`: Texto secundário/Breadcrumbs.
  - `slate-100/200`: Bordas, Dividisores e Backgrounds sutis.

## 📐 3. Padrões de Layout
- **Unified Header**: Breadcrumbs (esquerda) e Ações (Compartilhar/Favoritar - direita) na mesma linha horizontal.
- **Sidebars**: Sempre `sticky`, padding `p-10`, borda `border-slate-200`, sombra `shadow-2xl shadow-slate-200/20`.
- **Tags**: Abaixo do título principal. Borda fina, fundo pastel, texto `font-black text-[10px]`.

## 🚀 4. Regras de Ouro para Agentes
1. **Zero Fake Data**: Exibir apenas o que vier do `useQuery`. Ocultar se nulo.
2. **Componentes Puros**: Usar os tokens acima, evitar CSS ad-hoc.
3. **Foco Industrial**: Espaçamentos largos e linhas limpas. Sem gradientes complexos ou sombras coloridas.

---
*Ultima atualização: Abril 2026*

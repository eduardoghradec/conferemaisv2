# Confere+

> Gerencie seus projetos e notas fiscais com design premium e animações fluidas.

App mobile-first construído com Next.js 16 — design laranja & preto, viewport 430px, persistência local.

---

## Features

- ✅ Criar, editar e deletar projetos
- 🎨 6 cores customizáveis por projeto
- 📄 Adicionar, editar, visualizar e remover NFs (PDF) dentro de cada projeto
- 👁 Visualizador de PDF embutido com botão de download
- 💾 Persistência automática no `localStorage`
- ✨ Animações spring com Framer Motion
- 📱 Layout mobile-first (max 430px)

---

## Stack

| Lib | Versão | Uso |
|---|---|---|
| Next.js | 16.2.6 | Framework (App Router) |
| React | 19.2.4 | UI |
| TypeScript | 5.x | Tipagem |
| Tailwind CSS | 4.x | Estilo |
| Framer Motion | 12.x | Animações |
| Zustand | 5.x | Estado global + persist |
| Lucide React | 1.x | Ícones |
| nanoid | 5.x | Geração de IDs |

---

## Setup

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # build de produção
```

> Simule iPhone 14 no DevTools (390×844) para a experiência completa.

---

## Estrutura

```
confere-plus/
├── app/
│   ├── layout.tsx              Root layout, fonte, viewport
│   ├── page.tsx                Home screen — lista de projetos
│   ├── globals.css             Tailwind + tokens CSS
│   └── projeto/[id]/
│       └── page.tsx            Tela de detalhes — gestão de NFs
├── components/
│   ├── layout/                 MobileFrame, Header
│   ├── projects/               ProjectCard, ProjectList, ProjectModal, DeleteConfirm
│   ├── nf/                     NFCard, NFList, NFModal, NFViewer, DeleteNFConfirm, EmptyNFState
│   └── ui/                     Button, Input, FAB, EmptyState
├── store/
│   └── useProjectStore.ts      CRUD de projetos e NFs + localStorage
├── types/
│   ├── project.ts              Project type + PROJECT_COLORS
│   └── nf.ts                   NF type
└── lib/
    └── utils.ts                cn(), formatDate(), formatFileSize()
```

---

## Modelos de dados

```ts
type Project = {
  id: string           // nanoid
  name: string         // obrigatório, max 60 chars
  description?: string // opcional, max 200 chars
  color: string        // hex de PROJECT_COLORS
  createdAt: string    // ISO 8601
  updatedAt: string    // ISO 8601
}

type NF = {
  id: string           // nanoid
  projectId: string    // referência ao projeto pai
  name: string         // nome ou número da NF, obrigatório
  description?: string // observações opcionais
  fileData: string     // PDF em base64
  fileName: string     // nome original do arquivo
  fileSize: number     // tamanho em bytes (máx 3 MB)
  uploadedAt: string   // ISO 8601
  updatedAt: string    // ISO 8601
}
```

Tudo fica em `localStorage` sob a chave `confere-plus-projects`.

---

## Fluxo de navegação

```
/                        ← lista de projetos
  └─ toque no card
       ↓
/projeto/[id]            ← detalhes + NFs do projeto
  ├─ FAB → NFModal       ← adicionar NF (upload PDF)
  ├─ 👁 → NFViewer       ← visualizar PDF em full-screen
  ├─ ✏️ → NFModal        ← editar NF
  └─ 🗑 → DeleteNFConfirm ← confirmar remoção
```

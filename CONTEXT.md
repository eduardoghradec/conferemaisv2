# Contexto do Codebase — Confere+

Guia para devs e agentes de IA navegando ou expandindo o projeto.

---

## Responsabilidades

| Camada | Arquivo | O que faz |
|---|---|---|
| Tipos — Projeto | `types/project.ts` | Tipagem `Project` e array `PROJECT_COLORS` |
| Tipos — NF | `types/nf.ts` | Tipagem `NF`, `NFItem` (inclui `codigoProduto?`), `NFEmitente` |
| Estado | `store/useProjectStore.ts` | CRUD de projetos **e** NFs — única fonte de verdade |
| Utilidades | `lib/utils.ts` | `cn()`, `formatDate()`, `formatFileSize()` |
| Parser PDF | `lib/parsePdfNF.ts` | Extrai emitente, itens, volumes e `codigoProduto` de DANFEs |
| Shell | `components/layout/MobileFrame.tsx` | Centraliza viewport 430px |
| Tela principal | `app/page.tsx` | Lista de projetos; orquestra modals e navegação |
| Tela de detalhe projeto | `app/projeto/[id]/page.tsx` | NFs do projeto; orquestra modals de NF |
| Tela de detalhe NF | `app/projeto/[id]/nf/[nfId]/page.tsx` | Conferência de itens; switcher Lista / Câmera |

---

## Padrões estabelecidos

**Estado global** → sempre via `useProjectStore`. Não criar Context ou estado local para dados de projeto/NF.

**Estado de UI** (modal aberto, item sendo editado) → `useState` local no page correspondente. Não subir para a store.

**Animações** → Framer Motion com spring physics:
- Entrada de cards: `stiffness: 300, damping: 30`
- Botões/FAB: `stiffness: 400, damping: 20`
- Bottom sheets: `stiffness: 320, damping: 32`
- Delete confirm / pop-ins: `stiffness: 400, damping: 28`
- Saída de cards: `AnimatePresence mode="popLayout"`

**Classnames condicionais** → sempre `cn()` de `lib/utils.ts`. Nunca template strings com lógica.

**Ícones** → somente `lucide-react`. Não misturar outras libs de ícone.

**IDs** → `nanoid()`. Nunca `Math.random()` ou `Date.now()`.

**Arquivos PDF** → armazenados como base64 na store (campo `fileData`). Limite: 3 MB por arquivo. Visualização via `URL.createObjectURL()` — nunca referenciar o base64 diretamente num `<img>` ou `<iframe src>`.

---

## Como adicionar uma nova feature

1. **Novo campo no projeto** → adicionar em `types/project.ts` + atualizar `createProject` e `updateProject` em `store/useProjectStore.ts` + atualizar form em `ProjectModal.tsx`

2. **Novo campo na NF** → adicionar em `types/nf.ts` + atualizar `addNF` e `updateNF` em `store/useProjectStore.ts` + atualizar form em `NFModal.tsx`

3. **Nova tela** → criar `app/[rota]/page.tsx` + adicionar `'use client'` se precisar de interatividade + envolver com `<MobileFrame>`

4. **Novo componente UI** → criar em `components/ui/`, usar `cn()` para classes, `motion.div` para animações

5. **Nova ação na store** → adicionar função dentro do `create()` em `useProjectStore.ts`. O `persist` middleware persiste tudo automaticamente

---

## Estrutura de componentes NF

```
components/nf/
├── NFCard.tsx          Card individual com ações (ver, editar, remover)
├── NFList.tsx          Lista animada com AnimatePresence
├── NFModal.tsx         Bottom sheet — adicionar / editar NF + upload PDF
├── NFViewer.tsx        Overlay full-screen para visualizar PDF
├── NFItemCard.tsx      Card de item da NF (status pendente/confirmado; hint de toque)
├── NFItemDetail.tsx    Bottom sheet de detalhe do item (toggle de status)
├── CameraMode.tsx      Overlay de câmera com scanner animado e campos placeholder
├── DeleteNFConfirm.tsx Dialog de confirmação de remoção
└── EmptyNFState.tsx    Estado vazio com CTA
```

---

## Modos de conferência (tela NF)

A tela `/projeto/[id]/nf/[nfId]` oferece dois modos selecionados por um switcher fixo no rodapé:

| Modo | Componente | Comportamento |
|---|---|---|
| **Lista** | `NFItemCard` + `NFItemDetail` | Toque no card confirma o item; badge "Toque p/ confirmar" no pendente |
| **Câmera** | `CameraMode` | Preview ao vivo (`getUserMedia`), overlay de scanner animado, campos placeholder para leitura futura |

`CameraMode` para o stream da câmera (`track.stop()`) ao fechar para evitar vazamento de recursos.

---

## O que NÃO fazer

- ❌ Não criar uma segunda store Zustand — expandir a existente
- ❌ Não usar `useEffect` para sincronizar a store com `localStorage` — o middleware `persist` já cuida disso
- ❌ Não criar componentes com estado de projeto/NF fora do page correspondente sem motivo claro
- ❌ Não importar `nanoid` fora da store ou do `parsePdfNF.ts` (único outro uso legítimo)
- ❌ Não adicionar cor de projeto hardcoded — usar `PROJECT_COLORS` de `types/project.ts`
- ❌ Não colocar lógica de negócio dentro de componentes de UI (`components/ui/`)
- ❌ Não usar data URI (`data:application/pdf;base64,...`) direto num `<iframe src>` — usar `URL.createObjectURL()` para arquivos grandes
- ❌ Não aceitar PDFs maiores que 3 MB — o `localStorage` tem limite de ~5–10 MB

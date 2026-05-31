# Sistema de Design — Confere+

---

## Paleta de cores

| Token CSS | Hex | Uso |
|---|---|---|
| `--color-primary` | `#FF6500` | Laranja principal — botões, bordas ativas, badges |
| `--color-primary-light` | `#FF8C35` | Fim do gradiente laranja |
| `--color-bg` | `#080808` | Background geral |
| `--color-surface` | `#141414` | Cards, modais |
| `--color-surface-elevated` | `#1E1E1E` | Inputs, botões elevados |
| `--color-border` | `#2A2A2A` | Bordas e divisórias |
| `--color-text-1` | `#FFFFFF` | Texto principal |
| `--color-text-2` | `#A0A0A0` | Labels, subtítulos |
| `--color-text-3` | `#555555` | Placeholders, texto desabilitado |

**Gradiente primário:** `linear-gradient(135deg, #FF6500, #FF8C35)` → FAB, botão primary, logo  
**Glow laranja:** `box-shadow: 0 0 24px rgba(255,101,0,0.25)` → elementos em destaque

---

## Tipografia

**Fonte:** Plus Jakarta Sans (Google Fonts)  
**Pesos usados:** 400, 500, 600, 700, 800  
**Locale:** `pt-BR`

| Uso | Classe Tailwind |
|---|---|
| Título de tela | `text-lg font-bold` |
| Nome de projeto/NF no card | `text-base font-bold` |
| Descrição / body | `text-sm font-medium` |
| Labels / meta | `text-xs font-semibold` |
| Placeholders | `text-sm` + `text-[#555555]` |

---

## Espaçamento & Forma

- **Border radius de cards:** `rounded-2xl` (16px)
- **Border radius de inputs/botões:** `rounded-xl` (12px)
- **Border radius do FAB:** `rounded-full`
- **Padding horizontal padrão:** `px-5` (20px)
- **Gap entre cards:** `gap-3` (12px)
- **Bottom padding da lista** (espaço pro FAB): `pb-28`

---

## Animações (Framer Motion)

| Elemento | Spring settings |
|---|---|
| Cards — entrada | `stiffness: 300, damping: 30` + `delay: index * 0.06s` |
| Cards — saída | `opacity: 0, y: -16, scale: 0.95` |
| Bottom sheet | `stiffness: 320, damping: 32` |
| FAB | `stiffness: 400, damping: 20, delay: 0.3s` |
| Badges / pop-ins | `stiffness: 500, damping: 25` |
| Delete confirm | `stiffness: 400, damping: 28` |
| EmptyState icon | `y: [0, -8, 0]`, duração 3s, loop infinito |
| NFViewer | `opacity: 0 → 1`, duração 0.2s |

**`AnimatePresence mode`:** `"popLayout"` nas listas de projetos e NFs → permite layout shifts suaves ao remover itens

---

## Componentes UI

### Button — variantes

| Variante | Aparência | Uso |
|---|---|---|
| `primary` | Gradiente laranja, glow sutil | Ação principal (Criar, Salvar, Adicionar NF) |
| `ghost` | Transparente, borda `#2A2A2A` | Cancelar, ações secundárias |
| `danger` | Fundo vermelho/10, borda vermelho/20 | Deletar / Remover |

### Input

- Background: `#1E1E1E` | Borda default: `#2A2A2A`
- Focus: borda `#FF6500` + ring `#FF6500/30`
- Erro: borda `red-500/60` + ring `red-500/20`
- Label: uppercase, `text-xs`, `text-[#A0A0A0]`, `tracking-wider`

### Área de upload PDF (NFModal)

- Estado vazio: fundo `#1E1E1E`, borda `#2A2A2A`, ícone `Upload` em `#555555`
- Estado com arquivo: fundo `rgba(255,101,0,0.06)`, borda `rgba(255,101,0,0.3)`, ícone `FileText` em `#FF6500`
- Erro: borda `rgba(239,68,68,0.5)` + mensagem com ícone `AlertCircle`
- Limite: 3 MB por arquivo; apenas `application/pdf`

### NFViewer

- Fundo `#080808` full-screen (z-index 70 — acima de tudo)
- Header com: botão fechar (←), nome + nome do arquivo, botão download (laranja)
- PDF renderizado em `<iframe>` via `URL.createObjectURL()` a partir do base64
- Fecha com tecla `Escape`

---

## Borda esquerda colorida (cards de projeto)

Cards de projeto têm `w-1` absoluto na borda esquerda com a cor do projeto.  
Cards de NF usam `linear-gradient(180deg, #FF6500, #FF8C35)` fixo.

---

## Cores de projeto (PROJECT_COLORS)

```
#FF6500  laranja   (primary)
#3B82F6  azul
#10B981  verde
#8B5CF6  roxo
#F59E0B  âmbar
#EF4444  vermelho
```

Definidas em `types/project.ts`. Sempre usar este array — nunca cores hardcoded fora dele.

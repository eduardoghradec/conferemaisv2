'use client'

// pdfjs-dist usa DOMMatrix e outras APIs de browser na inicialização do módulo.
// O import estático causaria "DOMMatrix is not defined" no SSR do Next.js.
// Por isso usamos dynamic import dentro da função, garantindo que só rode no browser.

import { nanoid } from 'nanoid'
import type { NFItem, NFEmitente } from '@/types/nf'

// ── Tipos públicos ───────────────────────────────────────────────────────────

export type ParsedNF = {
  emitente: NFEmitente
  dataEmissao: string
  nfNumero: string
  itens: NFItem[]
  volumes: number
  quantidadeTotal: number
}

// ── Tipos internos ───────────────────────────────────────────────────────────

interface PosPt {
  str: string
  x: number
  y: number
}

interface TextLine {
  y: number
  text: string
}

// ── Constantes ───────────────────────────────────────────────────────────────

const CNPJ_RE     = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/
const DATE_RE     = /\b(\d{2}\/\d{2}\/\d{4})\b/
const NCM_RE      = /\b(\d{8})\b/

const UNIT_LIST   = [
  'UN','KG','CX','PC','MT','LT','TON','M2','M3','PAR',
  'FD','DZ','GL','SC','G','MG','ML','CM','MM','CT','CAR',
  'ENV','MON','AMPOLA','PECA','METRO',
]
const UNIT_RE_STR = `\\b(${UNIT_LIST.join('|')})\\b`
const QTD_UNIT_RE = new RegExp(`(\\d{1,10}[.,]\\d{1,6}|\\d{1,10})\\s*${UNIT_RE_STR}`, 'i')

// Detecta linhas que começam com código de produto alfanumérico (ex: HSDM08.9107, HSAC06.3892)
const PROD_CODE_RE = /^([A-Z]{2,}[A-Z0-9]*[.\-]\d[A-Z0-9.]*)\s+/i

// Labels que NÃO são o nome do emitente
const SKIP_LABELS = [
  'DANFE','NF-E','NF-e','NOTA FISCAL','DOCUMENTO AUXILIAR',
  'EMISSÃO','SAÍDA','ENTRADA','SÉRIE','NÚMERO','CHAVE',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCNPJ(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length !== 14) return raw
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

function parseDecimal(str: string): number {
  // "1.234,56" → 1234.56  |  "1,5000" → 1.5  |  "10" → 10
  const s = str.trim()
  if (/^\d+$/.test(s)) return parseInt(s, 10)
  // Se tem vírgula, ela é decimal (padrão BR)
  if (s.includes(',')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'))
  }
  return parseFloat(s)
}

// ── Extração de linhas do PDF ─────────────────────────────────────────────────

async function extractLines(base64: string): Promise<TextLine[]> {
  // Dynamic import: carrega pdfjs-dist apenas no browser (evita DOMMatrix SSR error)
  const pdfjsLib = await import('pdfjs-dist')
  // Worker servido localmente (public/pdf.worker.min.mjs) — sem dependência de CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

  const binary = atob(base64)
  const data   = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i)

  const pdf = await pdfjsLib.getDocument({ data }).promise
  const positioned: PosPt[] = []

  for (let p = 1; p <= pdf.numPages; p++) {
    const page     = await pdf.getPage(p)
    const viewport = page.getViewport({ scale: 1 })
    const tc       = await page.getTextContent()

    for (const item of tc.items) {
      // Compatível com pdfjs v4 e v5 — verifica se é TextItem
      if (!('str' in item) || typeof (item as { str: string }).str !== 'string') continue
      const ti  = item as { str: string; transform: number[] }
      const str = ti.str.replace(/\s+/g, ' ').trim()
      if (!str) continue

      positioned.push({
        str,
        x: ti.transform[4],
        // PDF usa y crescente de baixo para cima; invertemos para leitura top→bottom
        y: viewport.height - ti.transform[5],
      })
    }
  }

  if (positioned.length === 0) return []

  // Agrupa por y com tolerância de 4 pt
  const TOL   = 4
  const lineMap = new Map<number, PosPt[]>()

  for (const pt of positioned) {
    const rounded = Math.round(pt.y / TOL) * TOL
    let placed    = false

    for (const [key, list] of lineMap) {
      if (Math.abs(key - rounded) <= TOL) {
        list.push(pt)
        placed = true
        break
      }
    }
    if (!placed) lineMap.set(rounded, [pt])
  }

  // Ordena itens dentro de cada linha por x, depois linhas por y
  const lines: TextLine[] = []
  const sortedY = Array.from(lineMap.keys()).sort((a, b) => a - b)

  for (const y of sortedY) {
    const sorted = lineMap.get(y)!.sort((a, b) => a.x - b.x)
    const text   = sorted.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim()
    if (text) lines.push({ y, text })
  }

  return lines
}

// ── Parsers de itens ──────────────────────────────────────────────────────────

// Layout com código de produto como identificador de linha (ex: HOUSE AMBIENTES LTDA)
function buildCodeItem(num: number, codigo: string, rest: string, ncm: string): NFItem {
  const ncmPos    = rest.indexOf(ncm)
  const descricao = rest.slice(0, ncmPos).trim() || `Item ${num}`

  // Após NCM: "000 6101 UN 1,0000 ..."
  const afterNcm   = rest.slice(ncmPos + ncm.length).trim()
  const qtdM       = afterNcm.match(QTD_UNIT_RE)
  const quantidade = qtdM ? parseDecimal(qtdM[1]) : 0
  const unidade    = qtdM ? qtdM[2].toUpperCase() : 'UN'

  return {
    id: nanoid(),
    numero: num,
    descricao,
    ncm,
    codigoProduto: codigo,
    quantidade,
    unidade,
    status: 'pendente',
  }
}

function parseCodeLayoutItems(lines: TextLine[]): NFItem[] {
  const result: NFItem[] = []
  let num = 1
  let pendingCode: string | null = null
  let pendingDesc = ''

  for (const line of lines) {
    const { text } = line

    // Pula cabeçalhos de tabela repetidos entre páginas
    if (/descri[çc][ãa]o\s+(do\s+)?produto/i.test(text)) continue

    // Para em seções pós-itens
    if (/dados\s+adicionais|informações\s+complementares|reservado\s+ao\s+fisco|transportador.*volume/i.test(text)) break

    const codeMatch = text.match(PROD_CODE_RE)

    if (codeMatch) {
      const codigo = codeMatch[1]
      const rest   = text.slice(codeMatch[0].length).trim()
      const ncmM   = rest.match(NCM_RE)

      if (ncmM) {
        result.push(buildCodeItem(num++, codigo, rest, ncmM[1]))
        pendingCode = null
        pendingDesc = ''
      } else {
        // Descrição continua na próxima linha
        pendingCode = codigo
        pendingDesc = rest
      }
    } else if (pendingCode !== null) {
      // Linha de continuação da descrição anterior
      const combined = (pendingDesc + ' ' + text).trim()
      const ncmM = combined.match(NCM_RE)
      if (ncmM) {
        result.push(buildCodeItem(num++, pendingCode, combined, ncmM[1]))
        pendingCode = null
        pendingDesc = ''
      } else {
        pendingDesc = combined
      }
    }
  }
  return result
}

// Layout com numeração sequencial (1, 2, 3…) — layout padrão original
function parseNumberLayoutItems(itemLines: TextLine[]): NFItem[] {
  const itens: NFItem[] = []
  let expectedNum = 1

  for (const line of itemLines) {
    const { text } = line

    if (
      itens.length > 0 &&
      /dados\s+do(s)?\s+(vol|transport|fisco|tribut)/i.test(text)
    ) break

    const numMatch = text.match(/^(\d{1,4})\b/)
    if (!numMatch) continue
    const num = parseInt(numMatch[1], 10)
    if (num !== expectedNum) continue

    const rest = text.slice(numMatch[0].length).trim()

    const ncmMatch = rest.match(NCM_RE)
    const ncm      = ncmMatch ? ncmMatch[1] : ''

    let quantidade = 0
    let unidade    = 'UN'
    const qtdMatch = rest.match(QTD_UNIT_RE)
    if (qtdMatch) {
      quantidade = parseDecimal(qtdMatch[1])
      unidade    = qtdMatch[2].toUpperCase()
    } else {
      const decMatch = rest.match(/\b(\d+[.,]\d{3,6})\b/)
      if (decMatch) quantidade = parseDecimal(decMatch[1])
    }

    let descricao = ''
    if (ncm && rest.includes(ncm)) {
      const ncmPos = rest.indexOf(ncm)
      const before = rest.slice(0, ncmPos).trim()
      descricao = before.replace(/^\S+\s+/, '').trim()
    }
    if (!descricao) {
      descricao = rest.split(/\s{2,}|\|/)[0].replace(/^\S+\s+/, '').trim()
    }
    if (!descricao) descricao = `Item ${num}`

    let codigoProduto: string | undefined
    const codMatch = rest.match(/^(\S+)\s+/)
    if (codMatch && codMatch[1] !== ncm && !/^\d{1,4}$/.test(codMatch[1])) {
      codigoProduto = codMatch[1]
    }

    itens.push({
      id: nanoid(),
      numero: num,
      descricao,
      ncm,
      codigoProduto,
      quantidade,
      unidade,
      status: 'pendente',
    })
    expectedNum++
  }
  return itens
}

// ── Parser principal ──────────────────────────────────────────────────────────

/**
 * Extrai dados estruturados de um DANFE (PDF da NF-e).
 * Retorna null se o PDF não contiver texto extraível ou não parecer uma NF.
 */
export async function parsePdfNF(base64: string): Promise<ParsedNF | null> {
  if (typeof window === 'undefined') return null

  try {
    const lines = await extractLines(base64)
    if (lines.length === 0) return null

    const fullText = lines.map(l => l.text).join('\n')

    // ── CNPJ do emitente (1ª ocorrência) ─────────────────────────
    const cnpjMatch = fullText.match(CNPJ_RE)
    const cnpjFormatted = cnpjMatch ? formatCNPJ(cnpjMatch[0]) : ''

    // ── Nome do emitente ──────────────────────────────────────────
    // Linhas em CAIXA ALTA antes do 1º CNPJ, descartando labels conhecidos
    let emitenteName = ''
    const cnpjLineIdx = lines.findIndex(l => CNPJ_RE.test(l.text))
    if (cnpjLineIdx > 0) {
      const window5 = lines.slice(Math.max(0, cnpjLineIdx - 8), cnpjLineIdx)
      const candidates = window5
        .map(l => l.text)
        .filter(t =>
          t.length >= 5 &&
          /[A-ZÁÉÍÓÚÇÃÕ]{3}/.test(t) &&
          !SKIP_LABELS.some(skip => t.toUpperCase().includes(skip.toUpperCase()))
        )
      if (candidates.length > 0) {
        emitenteName = candidates.reduce((a, b) => b.length > a.length ? b : a)
      }
    }

    // ── Data de emissão ───────────────────────────────────────────
    let dataEmissao = ''
    const emissaoIdx = lines.findIndex(l => /emiss[ãa]o/i.test(l.text))
    if (emissaoIdx >= 0) {
      for (let i = emissaoIdx; i < Math.min(emissaoIdx + 4, lines.length); i++) {
        const m = lines[i].text.match(DATE_RE)
        if (m) { dataEmissao = m[1]; break }
      }
    }
    if (!dataEmissao) {
      const m = fullText.match(DATE_RE)
      if (m) dataEmissao = m[1]
    }

    // ── Número da NF ──────────────────────────────────────────────
    let nfNumero = ''
    const nfNumMatch = fullText.match(/n[ºo°]\.?\s*:?\s*(\d[\d.]{4,})/i)
    if (nfNumMatch) {
      nfNumero = nfNumMatch[1].replace(/\./g, '')
    }

    // ── Seção de itens ────────────────────────────────────────────
    const headerIdx = lines.findIndex(l =>
      /descri[çc][ãa]o\s+(do\s+)?produto/i.test(l.text) ||
      /c[oó]d(\.?\s*|\s+)(do\s+)?produto/i.test(l.text) ||
      /produtos?\s*[/\/]\s*servi[çc]os?/i.test(l.text)
    )
    const itemLines = headerIdx >= 0 ? lines.slice(headerIdx + 1) : lines

    // Detecta se o layout usa códigos de produto no lugar de números sequenciais
    const sample     = itemLines.slice(0, 15)
    const codeHits   = sample.filter(l => PROD_CODE_RE.test(l.text)).length
    const numberHits = sample.filter(l => /^\d{1,4}\b/.test(l.text)).length
    const isCodeLayout = codeHits > numberHits

    const itens: NFItem[] = isCodeLayout
      ? parseCodeLayoutItems(itemLines)
      : parseNumberLayoutItems(itemLines)

    // ── Volumes ───────────────────────────────────────────────────
    let volumes = 0
    const volLine = lines.find(l => /quant\.?\s*(volume|vol\.)/i.test(l.text))
    if (volLine) {
      const m = volLine.text.match(/(\d+)/)
      if (m) volumes = parseInt(m[1], 10)
    }

    // Fallback: layout HOUSE AMBIENTES usa "N VOLUME(S)" na seção de transportador
    if (!volumes) {
      const transportIdx = lines.findIndex(l => /transportador.*volume/i.test(l.text))
      if (transportIdx >= 0) {
        const transportText = lines.slice(transportIdx, transportIdx + 25).map(l => l.text).join(' ')
        const m = transportText.match(/(\d+)\s*volume/i) || transportText.match(/volume[^0-9]*(\d+)/i)
        if (m) volumes = parseInt(m[1], 10)
      }
    }

    if (!cnpjFormatted && !emitenteName && itens.length === 0) return null

    const quantidadeTotal = itens.reduce((s, i) => s + i.quantidade, 0)

    return {
      emitente: { nome: emitenteName, cnpj: cnpjFormatted },
      dataEmissao,
      nfNumero,
      itens,
      volumes,
      quantidadeTotal,
    }
  } catch (err) {
    console.error('[parsePdfNF]', err)
    return null
  }
}

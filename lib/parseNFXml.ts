'use client'

import { nanoid } from 'nanoid'
import type { NFItem, NFEmitente } from '@/types/nf'

export type ParsedNF = {
  emitente: NFEmitente
  dataEmissao: string
  nfNumero: string
  itens: NFItem[]
  volumes: number
  quantidadeTotal: number
}

/** Formata CNPJ raw (14 dígitos) para XX.XXX.XXX/XXXX-XX */
function formatCNPJ(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 14) return raw
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

/** Busca texto de um seletor CSS dentro do documento XML */
function getText(doc: Document, selector: string): string {
  return doc.querySelector(selector)?.textContent?.trim() ?? ''
}

/**
 * Faz o parse do XML NF-e (ou nfeProc) e retorna os dados estruturados.
 * Retorna null se o XML for inválido ou não contiver a tag infNFe.
 */
export function parseNFXml(xmlString: string): ParsedNF | null {
  if (typeof window === 'undefined') return null

  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  // Verifica erro de parse
  if (doc.querySelector('parsererror')) return null

  // Verifica se é uma NF-e
  const infNFe = doc.querySelector('infNFe')
  if (!infNFe) return null

  // ── Emitente ──────────────────────────────────────────────────────────────
  const nomeEmit = getText(doc, 'emit xNome') || getText(doc, 'emit xFant')
  const cnpjRaw  = getText(doc, 'emit CNPJ')

  // ── Identificação ─────────────────────────────────────────────────────────
  const dhEmi   = getText(doc, 'ide dhEmi') || getText(doc, 'ide dEmi')
  const nNF     = getText(doc, 'ide nNF')

  // ── Itens ─────────────────────────────────────────────────────────────────
  const detElements = Array.from(doc.querySelectorAll('det'))
  const itens: NFItem[] = detElements.map((det) => {
    const nItem     = parseInt(det.getAttribute('nItem') ?? '0', 10)
    const descricao = det.querySelector('prod xProd')?.textContent?.trim() ?? ''
    const ncm       = det.querySelector('prod NCM')?.textContent?.trim() ?? ''
    const qtdStr    = det.querySelector('prod qCom')?.textContent?.trim() ?? '0'
    const unidade   = det.querySelector('prod uCom')?.textContent?.trim() ?? 'UN'

    return {
      id: nanoid(),
      numero: nItem,
      descricao,
      ncm,
      quantidade: parseFloat(qtdStr) || 0,
      unidade,
      status: 'pendente',
    }
  })

  // ── Volumes ───────────────────────────────────────────────────────────────
  const qVolStr = getText(doc, 'vol qVol')
  const volumes = parseInt(qVolStr, 10) || 0

  // ── Quantidade total ──────────────────────────────────────────────────────
  const quantidadeTotal = itens.reduce((sum, item) => sum + item.quantidade, 0)

  return {
    emitente: {
      nome: nomeEmit,
      cnpj: formatCNPJ(cnpjRaw),
    },
    dataEmissao: dhEmi,
    nfNumero: nNF,
    itens,
    volumes,
    quantidadeTotal,
  }
}

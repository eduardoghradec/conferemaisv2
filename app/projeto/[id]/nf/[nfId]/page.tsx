'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Building2,
  CalendarDays,
  Package,
  CheckCircle2,
  Clock,
  Layers,
  FileSearch,
} from 'lucide-react'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { NFViewer } from '@/components/nf/NFViewer'
import { NFItemCard } from '@/components/nf/NFItemCard'
import { NFItemDetail } from '@/components/nf/NFItemDetail'
import { useProjectStore } from '@/store/useProjectStore'
import { formatDate } from '@/lib/utils'
import type { NFItem } from '@/types/nf'

export default function NFDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id    as string
  const nfId      = params.nfId as string

  const { projects, nfs, toggleNFItemStatus } = useProjectStore()

  const project = projects.find((p) => p.id === projectId) ?? null
  const nf      = nfs.find((n) => n.id === nfId)           ?? null

  // Redireciona se não existir
  useEffect(() => {
    if (!project || !nf) {
      router.replace('/')
    }
  }, [project, nf, router])

  // Estados de UI
  const [selectedItem, setSelectedItem] = useState<NFItem | null>(null)
  const [viewingPDF,   setViewingPDF]   = useState(false)

  if (!project || !nf) return null

  const itens          = nf.itens ?? []
  const confirmados    = itens.filter((i) => i.status === 'confirmado')
  const pendentes      = itens.filter((i) => i.status === 'pendente')

  // Versão viva do item selecionado (sincronizada com o store)
  const liveSelectedItem = selectedItem
    ? itens.find((i) => i.id === selectedItem.id) ?? null
    : null
  const totalConfirmed = confirmados.length
  const totalItems     = itens.length
  const progressPct    = totalItems > 0 ? (totalConfirmed / totalItems) * 100 : 0

  const allDone = totalItems > 0 && totalConfirmed === totalItems

  /** Toca em um item: se pendente, confirma imediatamente + abre detalhe */
  function handleItemTap(item: NFItem) {
    if (item.status === 'pendente') {
      toggleNFItemStatus(nf!.id, item.id)
    }
    // Usa a versão mais recente do item (pode ter sido atualizada pelo toggle acima)
    setSelectedItem(item)
  }

  /** Chamado pelo NFItemDetail para inverter o status */
  function handleToggleFromDetail(item: NFItem) {
    toggleNFItemStatus(nf!.id, item.id)
    // Fecha o modal ao desmarcar (confirmado → pendente)
    if (item.status === 'confirmado') {
      setSelectedItem(null)
    }
    // Se estava pendente e foi confirmado, o modal permanece aberto
    // mostrando o item já como confirmado (via liveSelectedItem)
  }

  const formattedDate = nf.dataEmissao
    ? (() => {
        try {
          return formatDate(nf.dataEmissao)
        } catch {
          return nf.dataEmissao
        }
      })()
    : null

  return (
    <MobileFrame>
      {/* Header sticky */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="sticky top-0 z-40 px-4 pb-4 header-safe-top bg-[#080808]/90 backdrop-blur-xl"
        style={{ borderBottom: '1px solid #2A2A2A' }}
      >
        <div className="flex items-center gap-3">
          {/* Botão voltar */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#141414] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#A0A0A0]" />
          </motion.button>

          {/* Nome da NF */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-4 h-4 text-[#FF6500] flex-shrink-0" />
            <h1 className="text-base font-bold text-white truncate leading-tight">
              {nf.name}
            </h1>
          </div>

          {/* Botão ver PDF */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setViewingPDF(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FF6500]/10 border border-[#FF6500]/30 hover:bg-[#FF6500]/20 transition-all cursor-pointer flex-shrink-0"
            title="Visualizar PDF"
          >
            <FileSearch className="w-4 h-4 text-[#FF6500]" />
          </motion.button>
        </div>
      </motion.header>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col pt-4 pb-10 gap-4 px-5">

        {/* ── Card: Identificação ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#141414', border: '1px solid #2A2A2A' }}
        >
          <div className="px-4 pt-4 pb-1 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#FF6500]" />
            <span className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
              Identificação
            </span>
          </div>

          <div className="px-4 pb-4 pt-2 flex flex-col gap-2.5">
            {/* Emitente */}
            {nf.emitente ? (
              <>
                <div>
                  <p className="text-xs text-[#555555] font-medium mb-0.5">Emitente</p>
                  <p className="text-base font-bold text-white leading-tight">
                    {nf.emitente.nome}
                  </p>
                </div>
                <div
                  className="h-px w-full"
                  style={{ background: '#2A2A2A' }}
                />
                <div>
                  <p className="text-xs text-[#555555] font-medium mb-0.5">CNPJ</p>
                  <p className="text-sm font-semibold text-white tracking-wide">
                    {nf.emitente.cnpj}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#555555] italic">
                Dados do emitente não disponíveis. Faça upload do XML NF-e ao editar.
              </p>
            )}

            {/* Data de emissão */}
            {formattedDate && (
              <>
                <div
                  className="h-px w-full"
                  style={{ background: '#2A2A2A' }}
                />
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-[#555555]" />
                  <div>
                    <p className="text-xs text-[#555555] font-medium">Data de emissão</p>
                    <p className="text-sm font-semibold text-white">{formattedDate}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* ── Card: Resumo ──────────────────────────────────────────── */}
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: 'easeOut' }}
            className="rounded-2xl overflow-hidden"
            style={{ background: '#141414', border: '1px solid #2A2A2A' }}
          >
            <div className="px-4 pt-4 pb-1 flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-[#FF6500]" />
              <span className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                Resumo
              </span>
            </div>

            <div className="px-4 pb-4 pt-2 flex flex-col gap-3">
              {/* Métricas */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#555555]" />
                  <span className="text-sm font-semibold text-white">
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                {(nf.volumes ?? 0) > 0 && (
                  <>
                    <span className="text-[#2A2A2A]">·</span>
                    <span className="text-sm font-semibold text-white">
                      {nf.volumes} {nf.volumes === 1 ? 'volume' : 'volumes'}
                    </span>
                  </>
                )}
                {(nf.quantidadeTotal ?? 0) > 0 && (
                  <>
                    <span className="text-[#2A2A2A]">·</span>
                    <span className="text-sm font-semibold text-white">
                      Total:{' '}
                      {nf.quantidadeTotal! % 1 === 0
                        ? nf.quantidadeTotal!.toFixed(0)
                        : nf.quantidadeTotal!.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}{' '}
                      un.
                    </span>
                  </>
                )}
              </div>

              {/* Barra de progresso */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#555555] font-medium">
                    {totalConfirmed} de {totalItems} confirmados
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: allDone ? '#10B981' : '#FF6500' }}
                  >
                    {Math.round(progressPct)}%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: '#2A2A2A' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                    style={{
                      background: allDone
                        ? '#10B981'
                        : 'linear-gradient(90deg, #FF6500, #FF8C35)',
                    }}
                  />
                </div>
              </div>

              {/* Badge "Tudo conferido" */}
              <AnimatePresence>
                {allDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{
                      background: 'rgba(16,185,129,0.10)',
                      border: '1px solid rgba(16,185,129,0.3)',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span className="text-sm font-bold text-[#10B981]">
                      Todos os itens conferidos!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── Sem itens (XML não carregado) ─────────────────────────── */}
        {totalItems === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col items-center gap-3 py-10 px-6 rounded-2xl text-center"
            style={{ background: '#141414', border: '1px solid #2A2A2A' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: '#1E1E1E' }}
            >
              <Package className="w-6 h-6 text-[#555555]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Nenhum item encontrado</p>
              <p className="text-xs text-[#555555] font-medium leading-relaxed">
                Os itens são extraídos automaticamente ao adicionar o PDF da NF. Se o PDF já foi adicionado, tente editar e re-selecionar o arquivo.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Seção: Confirmados ────────────────────────────────────── */}
        {confirmados.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-xs font-semibold text-[#10B981] uppercase tracking-wider">
                Confirmados ({confirmados.length})
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <AnimatePresence mode="popLayout">
                {confirmados.map((item, i) => (
                  <NFItemCard
                    key={item.id}
                    item={item}
                    index={i}
                    onTap={handleItemTap}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {/* ── Seção: Pendentes ──────────────────────────────────────── */}
        {pendentes.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                Pendentes ({pendentes.length})
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <AnimatePresence mode="popLayout">
                {pendentes.map((item, i) => (
                  <NFItemCard
                    key={item.id}
                    item={item}
                    index={i}
                    onTap={handleItemTap}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </main>

      {/* Visualizador de PDF */}
      <NFViewer
        nf={viewingPDF ? nf : null}
        onClose={() => setViewingPDF(false)}
      />

      {/* Detalhe do item */}
      <NFItemDetail
        item={liveSelectedItem}
        onClose={() => setSelectedItem(null)}
        onToggleStatus={handleToggleFromDetail}
      />
    </MobileFrame>
  )
}

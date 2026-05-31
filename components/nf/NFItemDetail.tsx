'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Clock, Package, Hash, BarChart3, Layers } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { NFItem } from '@/types/nf'

type NFItemDetailProps = {
  item: NFItem | null
  onClose: () => void
  onToggleStatus: (item: NFItem) => void
}

export function NFItemDetail({ item, onClose, onToggleStatus }: NFItemDetailProps) {
  if (!item) return null

  const isConfirmado = item.status === 'confirmado'
  const statusColor  = isConfirmado ? '#10B981' : '#F59E0B'

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  const qtdFormatted =
    item.quantidade % 1 === 0
      ? item.quantidade.toFixed(0)
      : item.quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 4 })

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[60] w-full max-w-[430px]"
          >
            <div
              className="rounded-t-3xl px-5 pt-5 pb-10"
              style={{
                background: '#141414',
                border: '1px solid #2A2A2A',
                borderBottom: 'none',
              }}
            >
              {/* Handle bar */}
              <div className="w-10 h-1 rounded-full bg-[#2A2A2A] mx-auto mb-5" />

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ background: `${statusColor}15`, color: statusColor }}
                  >
                    {item.numero}
                  </div>
                  <h2 className="text-lg font-bold text-white">Item #{item.numero}</h2>
                </div>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1E1E1E] border border-[#2A2A2A] cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#A0A0A0]" />
                </motion.button>
              </div>

              {/* Status badge */}
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-5"
                style={{
                  background: `${statusColor}10`,
                  border: `1px solid ${statusColor}35`,
                }}
              >
                {isConfirmado ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: statusColor }} />
                ) : (
                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: statusColor }} />
                )}
                <p className="text-sm font-bold" style={{ color: statusColor }}>
                  {isConfirmado ? 'Item confirmado' : 'Aguardando confirmação'}
                </p>
              </div>

              {/* Dados do item */}
              <div className="flex flex-col gap-3 mb-6">
                {/* Descrição */}
                <div
                  className="rounded-xl px-4 py-3.5"
                  style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-3.5 h-3.5 text-[#555555]" />
                    <span className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                      Descrição
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {item.descricao || '—'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* NCM */}
                  <div
                    className="rounded-xl px-4 py-3.5"
                    style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-3.5 h-3.5 text-[#555555]" />
                      <span className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                        NCM
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      {item.ncm || '—'}
                    </p>
                  </div>

                  {/* Quantidade */}
                  <div
                    className="rounded-xl px-4 py-3.5"
                    style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-3.5 h-3.5 text-[#555555]" />
                      <span className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                        Quantidade
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      {qtdFormatted}{' '}
                      <span className="text-[#A0A0A0] font-medium">{item.unidade}</span>
                    </p>
                  </div>
                </div>

                {/* Número do item */}
                <div
                  className="rounded-xl px-4 py-3"
                  style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#555555]" />
                    <span className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                      Número do item na NF
                    </span>
                    <span className="text-sm font-bold text-white ml-auto">#{item.numero}</span>
                  </div>
                </div>
              </div>

              {/* Botão de toggle de status */}
              {isConfirmado ? (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => onToggleStatus(item)}
                >
                  Desmarcar como pendente
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => onToggleStatus(item)}
                >
                  Confirmar item
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

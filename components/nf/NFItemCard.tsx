'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock } from 'lucide-react'
import type { NFItem } from '@/types/nf'

type NFItemCardProps = {
  item: NFItem
  index: number
  onTap: (item: NFItem) => void
}

export function NFItemCard({ item, index, onTap }: NFItemCardProps) {
  const isConfirmado = item.status === 'confirmado'

  const borderColor = isConfirmado ? '#10B981' : '#F59E0B'
  const bgColor     = isConfirmado ? 'rgba(16,185,129,0.04)' : 'rgba(245,158,11,0.04)'
  const glowColor   = isConfirmado
    ? 'linear-gradient(90deg, rgba(16,185,129,0.10), transparent)'
    : 'linear-gradient(90deg, rgba(245,158,11,0.10), transparent)'

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
        y: { duration: 0.3, ease: 'easeOut', delay: index * 0.04 },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onTap(item)}
      className="relative w-full rounded-2xl overflow-hidden text-left cursor-pointer"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}30`,
      }}
    >
      {/* Borda esquerda colorida */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: borderColor }}
      />

      {/* Glow no hover */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-16 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ background: glowColor }}
      />

      <div className="pl-5 pr-4 py-3.5 flex items-center gap-3">
        {/* Número do item */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{
            background: `${borderColor}15`,
            color: borderColor,
          }}
        >
          {item.numero}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate leading-tight mb-0.5">
            {item.descricao}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#555555] font-medium">
              NCM: {item.ncm || '—'}
            </span>
            <span className="text-[#2A2A2A]">·</span>
            <span className="text-xs text-[#A0A0A0] font-semibold">
              {item.quantidade % 1 === 0
                ? item.quantidade.toFixed(0)
                : item.quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}{' '}
              {item.unidade}
            </span>
          </div>
        </div>

        {/* Badge de status */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{
              background: `${borderColor}15`,
              border: `1px solid ${borderColor}40`,
            }}
          >
            {isConfirmado ? (
              <CheckCircle2 className="w-3 h-3" style={{ color: borderColor }} />
            ) : (
              <Clock className="w-3 h-3" style={{ color: borderColor }} />
            )}
            <span className="text-xs font-bold" style={{ color: borderColor }}>
              {isConfirmado ? 'OK' : 'Pendente'}
            </span>
          </div>
          {!isConfirmado && (
            <span className="text-[9px] text-[#555555] font-medium leading-none">
              Toque p/ confirmar
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

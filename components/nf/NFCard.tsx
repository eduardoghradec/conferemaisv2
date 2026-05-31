'use client'

import { motion } from 'framer-motion'
import { Eye, Pencil, Trash2, FileText, ChevronRight } from 'lucide-react'
import type { NF } from '@/types/nf'
import { formatDate, formatFileSize } from '@/lib/utils'

type NFCardProps = {
  nf: NF
  index: number
  onOpenDetail: (nf: NF) => void
  onView: (nf: NF) => void
  onEdit: (nf: NF) => void
  onDelete: (nf: NF) => void
}

export function NFCard({ nf, index, onOpenDetail, onView, onEdit, onDelete }: NFCardProps) {
  const itemCount        = nf.itens?.length ?? 0
  const confirmedCount   = nf.itens?.filter((i) => i.status === 'confirmado').length ?? 0
  const hasItems         = itemCount > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        y: { duration: 0.35, ease: 'easeOut', delay: index * 0.06 },
      }}
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: '#141414',
        border: '1px solid #2A2A2A',
      }}
      onClick={() => onOpenDetail(nf)}
      whileTap={{ scale: 0.98 }}
    >
      {/* Borda esquerda laranja */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: 'linear-gradient(180deg, #FF6500, #FF8C35)' }}
      />

      {/* Glow sutil no hover */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-16 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(90deg, rgba(255,101,0,0.12), transparent)',
        }}
      />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#FF6500] flex-shrink-0" />
              <h3 className="font-bold text-white text-base truncate leading-tight">
                {nf.name}
              </h3>
            </div>

            {/* Emitente se disponível, senão descrição */}
            {nf.emitente?.nome ? (
              <p className="text-sm text-[#A0A0A0] font-medium truncate ml-5">
                {nf.emitente.nome}
              </p>
            ) : nf.description ? (
              <p className="text-sm text-[#A0A0A0] line-clamp-2 leading-relaxed ml-5">
                {nf.description}
              </p>
            ) : (
              <p className="text-sm text-[#555555] italic ml-5">Sem descrição</p>
            )}

            <div className="flex items-center gap-2 mt-2.5 ml-5 flex-wrap">
              <span className="text-xs text-[#555555] font-medium">
                {formatFileSize(nf.fileSize)}
              </span>
              <span className="text-[#2A2A2A]">·</span>
              <span className="text-xs text-[#555555] font-medium">
                {formatDate(nf.updatedAt)}
              </span>
              {hasItems && (
                <>
                  <span className="text-[#2A2A2A]">·</span>
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: confirmedCount === itemCount ? '#10B981' : '#F59E0B',
                    }}
                  >
                    {confirmedCount}/{itemCount} itens
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            {/* Ver PDF */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation()
                onView(nf)
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#FF6500]/40 hover:bg-[#FF6500]/10 transition-all cursor-pointer"
              title="Visualizar PDF"
            >
              <Eye className="w-3.5 h-3.5 text-[#A0A0A0]" />
            </motion.button>

            {/* Editar */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation()
                onEdit(nf)
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#FF6500]/40 hover:bg-[#FF6500]/10 transition-all cursor-pointer"
              title="Editar NF"
            >
              <Pencil className="w-3.5 h-3.5 text-[#A0A0A0]" />
            </motion.button>

            {/* Remover */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(nf)
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1E1E1E] border border-[#2A2A2A] hover:border-red-500/40 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Remover NF"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#A0A0A0]" />
            </motion.button>
          </div>
        </div>

        {/* Chevron hint de que o card é clicável */}
        <div className="flex items-center gap-1 mt-2 ml-5">
          <ChevronRight className="w-3 h-3 text-[#2A2A2A]" />
          <span className="text-xs text-[#2A2A2A] font-medium">Ver detalhes</span>
        </div>
      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { FolderOpen } from 'lucide-react'

type EmptyStateProps = {
  onCreateClick: () => void
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center flex-1 px-8 py-16 text-center"
    >
      {/* Ícone animado */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative mb-6"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,101,0,0.15), rgba(255,140,53,0.08))',
            border: '1px solid rgba(255,101,0,0.2)',
          }}
        >
          <FolderOpen className="w-9 h-9 text-[#FF6500]" strokeWidth={1.5} />
        </div>
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-3xl blur-xl opacity-30"
          style={{ background: 'linear-gradient(135deg, #FF6500, #FF8C35)' }}
        />
      </motion.div>

      <h3 className="text-lg font-bold text-white mb-2">Nenhum projeto ainda</h3>
      <p className="text-sm text-[#555555] mb-8 leading-relaxed max-w-[240px]">
        Crie seu primeiro projeto e comece a organizar tudo que importa
      </p>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        onClick={onCreateClick}
        className="px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #FF6500, #FF8C35)',
          boxShadow: '0 4px 20px rgba(255,101,0,0.35)',
        }}
      >
        Criar projeto
      </motion.button>
    </motion.div>
  )
}

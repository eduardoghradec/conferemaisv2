'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

type FABProps = {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.08 }}
      onClick={onClick}
      className="fixed right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
      style={{
        bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(135deg, #FF6500, #FF8C35)',
        boxShadow: '0 8px 32px rgba(255, 101, 0, 0.45)',
      }}
    >
      <motion.div
        animate={{ rotate: 0 }}
        whileTap={{ rotate: 45 }}
        transition={{ duration: 0.15 }}
      >
        <Plus className="w-6 h-6 text-white stroke-[2.5]" />
      </motion.div>
    </motion.button>
  )
}

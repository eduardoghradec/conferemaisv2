'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Project } from '@/types/project'

type DeleteConfirmProps = {
  project: Project | null
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirm({ project, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center px-8">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-[320px] rounded-2xl p-5"
              style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
              }}
            >
              {/* Ícone */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              </div>

              {/* Texto */}
              <div className="text-center mb-6">
                <h3 className="font-bold text-white text-base mb-1.5">Deletar projeto?</h3>
                <p className="text-sm text-[#A0A0A0] leading-relaxed">
                  Você está prestes a deletar{' '}
                  <span className="font-semibold text-[#FF6500]">
                    &ldquo;{project.name}&rdquo;
                  </span>
                  . Essa ação não pode ser desfeita.
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button variant="danger" className="flex-1" onClick={onConfirm}>
                  Deletar
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

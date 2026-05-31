'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PROJECT_COLORS } from '@/types/project'
import type { Project } from '@/types/project'

type ProjectModalProps = {
  isOpen: boolean
  editingProject?: Project | null
  onClose: () => void
  onSubmit: (data: { name: string; description?: string; color: string }) => void
}

export function ProjectModal({ isOpen, editingProject, onClose, onSubmit }: ProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [nameError, setNameError] = useState('')

  // Preenche os campos ao editar
  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name)
      setDescription(editingProject.description ?? '')
      setColor(editingProject.color)
    } else {
      setName('')
      setDescription('')
      setColor(PROJECT_COLORS[0])
    }
    setNameError('')
  }, [editingProject, isOpen])

  function handleSubmit() {
    if (!name.trim()) {
      setNameError('O nome é obrigatório')
      return
    }
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    })
    onClose()
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  const isEditing = !!editingProject

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[430px]"
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
              <div className="w-10 h-1 rounded-full bg-[#2A2A2A] mx-auto mb-6" />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">
                  {isEditing ? 'Editar projeto' : 'Novo projeto'}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1E1E1E] border border-[#2A2A2A] cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#A0A0A0]" />
                </motion.button>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-4">
                <Input
                  label="Nome *"
                  placeholder="Ex: App de delivery..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (e.target.value.trim()) setNameError('')
                  }}
                  error={nameError}
                  autoFocus
                  maxLength={60}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
                    Descrição
                  </label>
                  <textarea
                    placeholder="Descreva o projeto brevemente..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3.5 rounded-xl text-white placeholder-[#555555] bg-[#1E1E1E] border border-[#2A2A2A] focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]/30 transition-all duration-200 text-sm font-medium resize-none"
                  />
                </div>

                {/* Paleta de cores */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
                    Cor do projeto
                  </label>
                  <div className="flex gap-3">
                    {PROJECT_COLORS.map((c) => (
                      <motion.button
                        key={c}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setColor(c)}
                        className="relative w-9 h-9 rounded-full cursor-pointer flex-shrink-0"
                        style={{ background: c }}
                      >
                        {color === c && (
                          <motion.div
                            layoutId="color-ring"
                            className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-[#141414]"
                            style={{ boxShadow: `0 0 0 2px ${c}` }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 mt-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={!name.trim()}
                  >
                    {isEditing ? 'Salvar' : 'Criar projeto'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

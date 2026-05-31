'use client'

import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import type { Project } from '@/types/project'
import { formatDate } from '@/lib/utils'

type ProjectCardProps = {
  project: Project
  index: number
  onOpen: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({ project, index, onOpen, onEdit, onDelete }: ProjectCardProps) {
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
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onOpen(project)}
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: '#141414',
        border: '1px solid #2A2A2A',
      }}
    >
      {/* Borda esquerda colorida */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: project.color }}
      />

      {/* Glow sutil */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-16 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `linear-gradient(90deg, ${project.color}18, transparent)`,
        }}
      />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: project.color }}
              />
              <h3 className="font-bold text-white text-base truncate leading-tight">
                {project.name}
              </h3>
            </div>

            {project.description ? (
              <p className="text-sm text-[#A0A0A0] line-clamp-2 leading-relaxed ml-4">
                {project.description}
              </p>
            ) : (
              <p className="text-sm text-[#555555] italic ml-4">Sem descrição</p>
            )}

            <p className="text-xs text-[#555555] mt-2.5 ml-4 font-medium">
              {formatDate(project.updatedAt)}
            </p>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation()
                onEdit(project)
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#FF6500]/40 hover:bg-[#FF6500]/10 transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-[#A0A0A0]" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(project)
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1E1E1E] border border-[#2A2A2A] hover:border-red-500/40 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#A0A0A0]" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

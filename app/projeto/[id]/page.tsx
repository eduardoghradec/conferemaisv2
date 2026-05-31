'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Receipt } from 'lucide-react'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { FAB } from '@/components/ui/FAB'
import { NFList } from '@/components/nf/NFList'
import { NFModal } from '@/components/nf/NFModal'
import { NFViewer } from '@/components/nf/NFViewer'
import { DeleteNFConfirm } from '@/components/nf/DeleteNFConfirm'
import { EmptyNFState } from '@/components/nf/EmptyNFState'
import { useProjectStore } from '@/store/useProjectStore'
import type { NF, NFItem, NFEmitente } from '@/types/nf'

export default function ProjetoPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params.id as string

  const { projects, nfs, addNF, updateNF, deleteNF, fetchData } = useProjectStore()

  useEffect(() => { fetchData() }, [])

  const project = projects.find((p) => p.id === id) ?? null

  // Redireciona se o projeto não existir
  useEffect(() => {
    if (!project) {
      router.replace('/')
    }
  }, [project, router])

  // NFs deste projeto
  const projectNFs = nfs.filter((nf) => nf.projectId === id)

  // Estados de UI
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNF,   setEditingNF]   = useState<NF | null>(null)
  const [deletingNF,  setDeletingNF]  = useState<NF | null>(null)
  const [viewingNF,   setViewingNF]   = useState<NF | null>(null)

  function handleOpenCreate() {
    setEditingNF(null)
    setIsModalOpen(true)
  }

  function handleOpenEdit(nf: NF) {
    setEditingNF(nf)
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setEditingNF(null)
  }

  function handleModalSubmit(data: {
    name: string
    description?: string
    fileData: string
    fileName: string
    fileSize: number
    emitente?: NFEmitente
    dataEmissao?: string
    itens: NFItem[]
    quantidadeTotal?: number
    volumes?: number
  }) {
    if (editingNF) {
      updateNF(editingNF.id, data)
    } else {
      addNF({ projectId: id, ...data })
    }
  }

  function handleDeleteConfirm() {
    if (deletingNF) {
      deleteNF(deletingNF.id)
      setDeletingNF(null)
    }
  }

  /** Navega para a tela de detalhes da NF */
  function handleOpenDetail(nf: NF) {
    router.push(`/projeto/${id}/nf/${nf.id}`)
  }

  if (!project) return null

  const nfCount = projectNFs.length

  return (
    <MobileFrame>
      {/* Header da tela de detalhes */}
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

          {/* Indicador de cor + nome */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: project.color }}
            />
            <h1 className="text-base font-bold text-white truncate leading-tight">
              {project.name}
            </h1>
          </div>

          {/* Badge com contagem de NFs */}
          <AnimatePresence mode="wait">
            {nfCount > 0 && (
              <motion.div
                key={nfCount}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141414] border border-[#2A2A2A] flex-shrink-0"
              >
                <Receipt className="w-3 h-3 text-[#FF6500]" />
                <span className="text-xs font-bold text-[#FF6500]">{nfCount}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Descrição do projeto */}
        {project.description && (
          <p className="text-xs text-[#555555] mt-2 ml-12 line-clamp-1 font-medium">
            {project.description}
          </p>
        )}
      </motion.header>

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col pt-4">
        {/* Label da seção */}
        {nfCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="px-5 mb-3"
          >
            <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
              {nfCount === 1 ? '1 nota fiscal' : `${nfCount} notas fiscais`}
            </p>
          </motion.div>
        )}

        {projectNFs.length === 0 ? (
          <EmptyNFState onAddClick={handleOpenCreate} />
        ) : (
          <NFList
            nfs={projectNFs}
            onOpenDetail={handleOpenDetail}
            onView={setViewingNF}
            onEdit={handleOpenEdit}
            onDelete={setDeletingNF}
          />
        )}
      </main>

      {/* FAB para adicionar NF */}
      <FAB onClick={handleOpenCreate} />

      {/* Modal de criação / edição */}
      <NFModal
        isOpen={isModalOpen}
        editingNF={editingNF}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
      />

      {/* Visualizador de PDF */}
      <NFViewer
        nf={viewingNF}
        onClose={() => setViewingNF(null)}
      />

      {/* Confirmação de remoção */}
      <DeleteNFConfirm
        nf={deletingNF}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingNF(null)}
      />
    </MobileFrame>
  )
}

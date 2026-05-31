'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Loader2 } from 'lucide-react'
import type { NF } from '@/types/nf'
import { useProjectStore } from '@/store/useProjectStore'

type NFViewerProps = {
  nf: NF | null
  onClose: () => void
}

function base64ToObjectUrl(base64: string): string {
  const byteString = atob(base64)
  const bytes = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

export function NFViewer({ nf, onClose }: NFViewerProps) {
  const { fetchNFFileData, nfs } = useProjectStore()
  const [isFetchingFile, setIsFetchingFile] = useState(false)

  // NF atualizada da store (pode ganhar fileData após o fetch lazy)
  const liveNF = nf ? (nfs.find((n) => n.id === nf.id) ?? nf) : null
  const fileData = liveNF?.fileData

  // Dispara fetch do fileData quando abrir e ele não estiver disponível
  useEffect(() => {
    if (!nf || fileData) return
    setIsFetchingFile(true)
    fetchNFFileData(nf.id).finally(() => setIsFetchingFile(false))
  }, [nf?.id, fileData, fetchNFFileData])

  const pdfUrl = useMemo(() => {
    if (!fileData) return ''
    return base64ToObjectUrl(fileData)
  }, [fileData])

  // Libera a object URL ao desmontar ou trocar de NF
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  // Fecha com ESC
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleDownload() {
    if (!liveNF || !pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = liveNF.fileName
    a.click()
  }

  return (
    <AnimatePresence>
      {nf && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex flex-col"
          style={{ background: '#080808' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 pt-12 pb-3 flex-shrink-0"
            style={{
              borderBottom: '1px solid #2A2A2A',
              background: '#080808/95',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Fechar */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#141414] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4 text-[#A0A0A0]" />
            </motion.button>

            {/* Nome */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{nf.name}</p>
              <p className="text-xs text-[#555555] truncate">{nf.fileName}</p>
            </div>

            {/* Download */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleDownload}
              disabled={!pdfUrl}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FF6500]/10 border border-[#FF6500]/30 hover:bg-[#FF6500]/20 transition-all cursor-pointer flex-shrink-0 disabled:opacity-40"
              title="Baixar PDF"
            >
              <Download className="w-4 h-4 text-[#FF6500]" />
            </motion.button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 relative">
            {isFetchingFile && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#FF6500] animate-spin" />
                  <p className="text-sm text-[#555555] font-medium">Carregando PDF…</p>
                </div>
              </div>
            )}
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className="absolute inset-0 w-full h-full border-0"
                title={nf.name}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

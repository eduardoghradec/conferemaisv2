'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatFileSize } from '@/lib/utils'
import { parsePdfNF } from '@/lib/parsePdfNF'
import type { ParsedNF } from '@/lib/parsePdfNF'
import type { NF, NFItem, NFEmitente } from '@/types/nf'

const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3 MB

type NFModalProps = {
  isOpen: boolean
  editingNF?: NF | null
  onClose: () => void
  onSubmit: (data: {
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
  }) => void
}

export function NFModal({ isOpen, editingNF, onClose, onSubmit }: NFModalProps) {
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [nameError,   setNameError]   = useState('')

  // Estado do arquivo PDF
  const [fileData, setFileData] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [fileError, setFileError] = useState('')

  // Estado da extração automática do PDF
  const [parsedNF,   setParsedNF]   = useState<ParsedNF | null>(null)
  const [isParsing,  setIsParsing]  = useState(false)
  const [parseError, setParseError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing    = !!editingNF

  // Ref sempre atualizado com o valor atual de `name` —
  // evita stale closure dentro do callback async do FileReader
  const nameRef = useRef(name)
  useEffect(() => { nameRef.current = name }, [name])

  // Preenche os campos ao editar
  useEffect(() => {
    if (editingNF) {
      setName(editingNF.name)
      setDescription(editingNF.description ?? '')
      setFileData(editingNF.fileData)
      setFileName(editingNF.fileName)
      setFileSize(editingNF.fileSize)
      // Reconstrói parsedNF a partir dos dados já salvos
      setParsedNF(
        editingNF.emitente
          ? {
              emitente:       editingNF.emitente,
              dataEmissao:    editingNF.dataEmissao ?? '',
              nfNumero:       editingNF.name,
              itens:          editingNF.itens,
              volumes:        editingNF.volumes ?? 0,
              quantidadeTotal: editingNF.quantidadeTotal ?? 0,
            }
          : null
      )
    } else {
      setName('')
      setDescription('')
      setFileData('')
      setFileName('')
      setFileSize(0)
      setParsedNF(null)
    }
    setNameError('')
    setFileError('')
    setParseError('')
    setIsParsing(false)
  }, [editingNF, isOpen])

  // ── Seleção do PDF ────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setFileError('Apenas arquivos PDF são aceitos')
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`Arquivo muito grande. Máximo: ${formatFileSize(MAX_FILE_SIZE)}`)
      e.target.value = ''
      return
    }

    setFileError('')
    setParseError('')
    setParsedNF(null)

    const reader = new FileReader()
    reader.onloadend = async () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]

      setFileData(base64)
      setFileName(file.name)
      setFileSize(file.size)

      // Auto-extração dos dados do DANFE
      setIsParsing(true)
      try {
        const parsed = await parsePdfNF(base64)
        if (parsed) {
          setParsedNF(parsed)
          // Usa nameRef.current (valor atual) em vez de `name` (closure stale)
          if (!nameRef.current.trim() && parsed.nfNumero) {
            setName(`NF-e ${parsed.nfNumero}`)
            setNameError('')
          }
        } else {
          setParseError('Dados não encontrados no PDF. Verifique o arquivo ou preencha manualmente.')
        }
      } catch {
        setParseError('Não foi possível ler os dados do PDF.')
      } finally {
        setIsParsing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit() {
    let hasError = false

    if (!name.trim()) {
      setNameError('O nome/número da NF é obrigatório')
      hasError = true
    }

    if (!fileData) {
      setFileError('Selecione um arquivo PDF')
      hasError = true
    }

    if (hasError) return

    onSubmit({
      name:            name.trim(),
      description:     description.trim() || undefined,
      fileData,
      fileName,
      fileSize,
      emitente:        parsedNF?.emitente,
      dataEmissao:     parsedNF?.dataEmissao,
      itens:           parsedNF?.itens ?? (isEditing ? editingNF?.itens ?? [] : []),
      quantidadeTotal: parsedNF?.quantidadeTotal,
      volumes:         parsedNF?.volumes,
    })
    onClose()
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  const hasFile    = !!fileData
  const hasData    = !!parsedNF?.emitente?.nome || (parsedNF?.itens?.length ?? 0) > 0
  const itemCount  = parsedNF?.itens?.length ?? 0

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
                  {isEditing ? 'Editar NF' : 'Nova NF'}
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
                {/* Nome / Número */}
                <Input
                  label="Nome / Nº da NF *"
                  placeholder="Ex: NF-e 000.123 ou Fornecedor X"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (e.target.value.trim()) setNameError('')
                  }}
                  error={nameError}
                  autoFocus
                  maxLength={80}
                />

                {/* Descrição */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
                    Descrição
                  </label>
                  <textarea
                    placeholder="Observações sobre esta NF..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    maxLength={200}
                    className="w-full px-4 py-3.5 rounded-xl text-white placeholder-[#555555] bg-[#1E1E1E] border border-[#2A2A2A] focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]/30 transition-all duration-200 text-sm font-medium resize-none"
                  />
                </div>

                {/* Upload PDF */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
                    Arquivo PDF {!isEditing && '*'}
                    {hasFile && !isParsing && (
                      <span className="text-[#555555] normal-case font-normal ml-1">
                        — dados extraídos automaticamente
                      </span>
                    )}
                  </label>

                  {/* Área de upload */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => !isParsing && fileInputRef.current?.click()}
                    className="relative w-full rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer"
                    style={{
                      background: hasFile
                        ? isParsing
                          ? 'rgba(255,101,0,0.04)'
                          : hasData
                          ? 'rgba(16,185,129,0.06)'
                          : parseError
                          ? 'rgba(245,158,11,0.06)'
                          : 'rgba(255,101,0,0.06)'
                        : '#1E1E1E',
                      borderColor: fileError
                        ? 'rgba(239,68,68,0.5)'
                        : hasFile
                        ? isParsing
                          ? 'rgba(255,101,0,0.25)'
                          : hasData
                          ? 'rgba(16,185,129,0.35)'
                          : parseError
                          ? 'rgba(245,158,11,0.35)'
                          : 'rgba(255,101,0,0.3)'
                        : '#2A2A2A',
                    }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      {hasFile ? (
                        <>
                          {/* Ícone dinâmico */}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: isParsing
                                ? 'rgba(255,101,0,0.12)'
                                : hasData
                                ? 'rgba(16,185,129,0.15)'
                                : parseError
                                ? 'rgba(245,158,11,0.15)'
                                : 'rgba(255,101,0,0.15)',
                            }}
                          >
                            {isParsing ? (
                              <Loader2
                                className="w-4 h-4 animate-spin"
                                style={{ color: '#FF6500' }}
                              />
                            ) : hasData ? (
                              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                            ) : (
                              <FileText
                                className="w-4 h-4"
                                style={{ color: parseError ? '#F59E0B' : '#FF6500' }}
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 text-left">
                            <p
                              className="text-sm font-semibold truncate"
                              style={{
                                color: hasData ? '#10B981' : parseError ? '#F59E0B' : 'white',
                              }}
                            >
                              {fileName}
                            </p>
                            <p className="text-xs" style={{ color: '#A0A0A0' }}>
                              {isParsing
                                ? 'Lendo NF...'
                                : hasData
                                ? `${formatFileSize(fileSize)} · ${itemCount} ${itemCount === 1 ? 'item' : 'itens'} identificados · Toque para substituir`
                                : `${formatFileSize(fileSize)} · Toque para substituir`}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#2A2A2A] flex-shrink-0">
                            <Upload className="w-4 h-4 text-[#555555]" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-[#A0A0A0]">Selecionar PDF da NF</p>
                            <p className="text-xs text-[#555555]">Dados extraídos automaticamente · Máx. 3 MB</p>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.button>

                  {/* Erro de arquivo */}
                  {fileError && (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-red-400 font-medium">{fileError}</span>
                    </div>
                  )}

                  {/* Aviso de parse não-bloqueante */}
                  {parseError && !isParsing && (
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[#F59E0B] font-medium leading-relaxed">
                        {parseError}
                      </span>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Preview do emitente extraído */}
                <AnimatePresence>
                  {parsedNF?.emitente?.nome && !isParsing && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="rounded-xl px-4 py-3 flex flex-col gap-0.5"
                      style={{
                        background: 'rgba(16,185,129,0.06)',
                        border: '1px solid rgba(16,185,129,0.2)',
                      }}
                    >
                      <p className="text-xs font-semibold text-[#10B981] uppercase tracking-wider mb-1">
                        Emitente identificado
                      </p>
                      <p className="text-sm font-bold text-white truncate">
                        {parsedNF.emitente.nome}
                      </p>
                      {parsedNF.emitente.cnpj && (
                        <p className="text-xs text-[#A0A0A0] font-medium">
                          {parsedNF.emitente.cnpj}
                        </p>
                      )}
                      {parsedNF.itens.length > 0 && (
                        <p className="text-xs text-[#10B981]/70 font-medium mt-0.5">
                          {parsedNF.itens.length} {parsedNF.itens.length === 1 ? 'item' : 'itens'} ·{' '}
                          {parsedNF.volumes > 0 ? `${parsedNF.volumes} volumes · ` : ''}
                          Data: {parsedNF.dataEmissao || '—'}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botões */}
                <div className="flex gap-3 mt-2">
                  <Button variant="ghost" className="flex-1" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={!name.trim() || !fileData || isParsing}
                  >
                    {isParsing ? 'Aguarde...' : isEditing ? 'Salvar' : 'Adicionar NF'}
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

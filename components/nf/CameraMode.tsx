'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CameraOff,
  Barcode,
  Tag,
  FileText,
  ShoppingBag,
  Layers,
  Sparkles,
} from 'lucide-react'

type CameraModeProps = {
  isOpen: boolean
  onClose: () => void
}

type CameraState = 'requesting' | 'active' | 'denied' | 'error'

const PLACEHOLDER_FIELDS = [
  { icon: Barcode,    label: 'Código de Barras',  key: 'barcode' },
  { icon: Tag,        label: 'Cód. do Produto',   key: 'product' },
  { icon: FileText,   label: 'Descrição',          key: 'desc' },
  { icon: ShoppingBag, label: 'Pedido',            key: 'order' },
  { icon: Layers,     label: 'Volume',             key: 'volume' },
]

export function CameraMode({ isOpen, onClose }: CameraModeProps) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const [camState, setCamState] = useState<CameraState>('requesting')

  useEffect(() => {
    if (!isOpen) return

    setCamState('requesting')

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCamState('active')
      } catch (err) {
        const name = (err as Error).name
        setCamState(name === 'NotAllowedError' ? 'denied' : 'error')
      }
    }

    startCamera()

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [isOpen])

  // Sync stream to video element when both are ready
  useEffect(() => {
    if (camState === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [camState])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex flex-col max-w-[430px] mx-auto"
          style={{ background: '#080808' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid #1E1E1E' }}
          >
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#141414] border border-[#2A2A2A] cursor-pointer"
            >
              <X className="w-4 h-4 text-[#A0A0A0]" />
            </motion.button>

            <span className="text-sm font-bold text-white">Modo Câmera</span>

            {/* Espaço reservado para botão futuro (ex: lanterna) */}
            <div className="w-9 h-9" />
          </div>

          {/* Viewfinder */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            {/* Video element — sempre montado para receber o srcObject */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: camState === 'active' ? 'block' : 'none' }}
            />

            {/* Estados de câmera não-ativa */}
            {camState !== 'active' && (
              <div className="flex flex-col items-center gap-4 px-8 text-center z-10">
                {camState === 'requesting' && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 rounded-full border-2 border-[#2A2A2A] border-t-[#FF6500]"
                    />
                    <p className="text-sm text-[#A0A0A0] font-medium">
                      Solicitando acesso à câmera…
                    </p>
                  </>
                )}
                {camState === 'denied' && (
                  <>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      <CameraOff className="w-7 h-7 text-[#EF4444]" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white mb-1">
                        Câmera bloqueada
                      </p>
                      <p className="text-xs text-[#555555] leading-relaxed">
                        Permita o acesso à câmera nas configurações do navegador para usar o modo de leitura.
                      </p>
                    </div>
                  </>
                )}
                {camState === 'error' && (
                  <>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
                    >
                      <CameraOff className="w-7 h-7 text-[#F59E0B]" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white mb-1">
                        Câmera indisponível
                      </p>
                      <p className="text-xs text-[#555555] leading-relaxed">
                        Não foi possível acessar a câmera. Verifique se outro aplicativo está usando-a.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Overlay de scanner (visível apenas quando câmera ativa) */}
            {camState === 'active' && (
              <>
                {/* Fundo escuro ao redor do viewfinder */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Quadro do scanner */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-[72%] aspect-[3/2]">
                    {/* Cantos */}
                    {[
                      'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
                      'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
                      'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
                      'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
                    ].map((cls, i) => (
                      <div
                        key={i}
                        className={`absolute w-6 h-6 border-[#FF6500] ${cls}`}
                      />
                    ))}

                    {/* Linha de scan animada */}
                    <div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden rounded-lg">
                      <motion.div
                        className="absolute inset-x-0 h-px"
                        style={{
                          background: 'linear-gradient(90deg, transparent, #FF6500, transparent)',
                          boxShadow: '0 0 8px 2px rgba(255,101,0,0.4)',
                        }}
                        animate={{ y: ['0%', '100%'] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          ease: 'easeInOut',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Instrução */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                  <div
                    className="px-4 py-2 rounded-xl"
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <p className="text-xs text-[#A0A0A0] font-medium text-center">
                      Aponte para a etiqueta da mercadoria
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Painel inferior — campos placeholder */}
          <div
            className="flex-shrink-0 px-4 pt-4 pb-8"
            style={{ borderTop: '1px solid #1E1E1E', background: '#0D0D0D' }}
          >
            {/* Badge "em breve" */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                Detecção automática
              </span>
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,101,0,0.1)', border: '1px solid rgba(255,101,0,0.3)' }}
              >
                <Sparkles className="w-3 h-3 text-[#FF6500]" />
                <span className="text-[10px] font-bold text-[#FF6500]">Em breve</span>
              </div>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#141414', border: '1px solid #2A2A2A', opacity: 0.6 }}
            >
              {PLACEHOLDER_FIELDS.map(({ icon: Icon, label, key }, i) => (
                <div key={key}>
                  {i > 0 && <div className="mx-4 h-px bg-[#1E1E1E]" />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Icon className="w-3.5 h-3.5 text-[#555555] flex-shrink-0" />
                    <span className="text-xs font-medium text-[#555555] flex-1">{label}</span>
                    <span className="text-xs font-bold text-[#2A2A2A]">—</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

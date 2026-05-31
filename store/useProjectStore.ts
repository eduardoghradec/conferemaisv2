'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Project } from '@/types/project'
import type { NF, NFItem, NFEmitente } from '@/types/nf'

type AddNFInput = {
  projectId: string
  name: string
  description?: string
  fileData: string
  fileName: string
  fileSize: number
  // Dados do XML NF-e
  emitente?: NFEmitente
  dataEmissao?: string
  itens?: NFItem[]
  quantidadeTotal?: number
  volumes?: number
}

type UpdateNFInput = {
  name: string
  description?: string
  fileData?: string
  fileName?: string
  fileSize?: number
  // Dados do XML NF-e
  emitente?: NFEmitente
  dataEmissao?: string
  itens?: NFItem[]
  quantidadeTotal?: number
  volumes?: number
}

type ProjectStore = {
  // ── Projetos ──────────────────────────────────────────────────
  projects: Project[]
  createProject: (data: { name: string; description?: string; color: string }) => void
  updateProject: (id: string, data: { name: string; description?: string; color: string }) => void
  deleteProject: (id: string) => void

  // ── NFs ───────────────────────────────────────────────────────
  nfs: NF[]
  addNF: (data: AddNFInput) => void
  updateNF: (id: string, data: UpdateNFInput) => void
  deleteNF: (id: string) => void
  toggleNFItemStatus: (nfId: string, itemId: string) => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      nfs: [],

      // ── Projetos ─────────────────────────────────────────────

      createProject: ({ name, description, color }) =>
        set((state) => ({
          projects: [
            {
              id: nanoid(),
              name,
              description,
              color,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state.projects,
          ],
        })),

      updateProject: (id, { name, description, color }) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, name, description, color, updatedAt: new Date().toISOString() }
              : p
          ),
        })),

      // Cascade delete: remove todas as NFs do projeto ao deletá-lo
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          nfs: state.nfs.filter((nf) => nf.projectId !== id),
        })),

      // ── NFs ──────────────────────────────────────────────────

      addNF: ({ projectId, name, description, fileData, fileName, fileSize, emitente, dataEmissao, itens, quantidadeTotal, volumes }) =>
        set((state) => ({
          nfs: [
            {
              id: nanoid(),
              projectId,
              name,
              description,
              fileData,
              fileName,
              fileSize,
              uploadedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              emitente,
              dataEmissao,
              itens: itens ?? [],
              quantidadeTotal,
              volumes,
            },
            ...state.nfs,
          ],
        })),

      updateNF: (id, { name, description, fileData, fileName, fileSize, emitente, dataEmissao, itens, quantidadeTotal, volumes }) =>
        set((state) => ({
          nfs: state.nfs.map((nf) =>
            nf.id === id
              ? {
                  ...nf,
                  name,
                  description,
                  ...(fileData   !== undefined && { fileData }),
                  ...(fileName   !== undefined && { fileName }),
                  ...(fileSize   !== undefined && { fileSize }),
                  ...(emitente   !== undefined && { emitente }),
                  ...(dataEmissao !== undefined && { dataEmissao }),
                  ...(itens      !== undefined && { itens }),
                  ...(quantidadeTotal !== undefined && { quantidadeTotal }),
                  ...(volumes    !== undefined && { volumes }),
                  updatedAt: new Date().toISOString(),
                }
              : nf
          ),
        })),

      deleteNF: (id) =>
        set((state) => ({
          nfs: state.nfs.filter((nf) => nf.id !== id),
        })),

      /** Inverte o status de um item específico dentro de uma NF */
      toggleNFItemStatus: (nfId, itemId) =>
        set((state) => ({
          nfs: state.nfs.map((nf) =>
            nf.id === nfId
              ? {
                  ...nf,
                  itens: nf.itens.map((item) =>
                    item.id === itemId
                      ? { ...item, status: item.status === 'pendente' ? 'confirmado' : 'pendente' }
                      : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : nf
          ),
        })),
    }),
    {
      name: 'confere-plus-projects',
    }
  )
)

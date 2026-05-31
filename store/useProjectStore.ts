'use client'

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types/project'
import type { NF, NFItem, NFEmitente } from '@/types/nf'

// ── Supabase row shapes ────────────────────────────────────────────────────────

type ProjectRow = {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

type NFRow = {
  id: string
  project_id: string
  user_id: string
  name: string
  description: string | null
  file_data: string
  file_name: string
  file_size: number
  uploaded_at: string
  updated_at: string
  emitente: NFEmitente | null
  data_emissao: string | null
  itens: NFItem[]
  quantidade_total: number | null
  volumes: number | null
}

// ── Mappers ────────────────────────────────────────────────────────────────────

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapNF(row: NFRow): NF {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description ?? undefined,
    fileData: row.file_data,
    fileName: row.file_name,
    fileSize: row.file_size,
    uploadedAt: row.uploaded_at,
    updatedAt: row.updated_at,
    emitente: row.emitente ?? undefined,
    dataEmissao: row.data_emissao ?? undefined,
    itens: row.itens ?? [],
    quantidadeTotal: row.quantidade_total ?? undefined,
    volumes: row.volumes ?? undefined,
  }
}

// ── Input types ────────────────────────────────────────────────────────────────

type AddNFInput = {
  projectId: string
  name: string
  description?: string
  fileData: string
  fileName: string
  fileSize: number
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
  emitente?: NFEmitente
  dataEmissao?: string
  itens?: NFItem[]
  quantidadeTotal?: number
  volumes?: number
}

// ── Store type ─────────────────────────────────────────────────────────────────

type ProjectStore = {
  projects: Project[]
  nfs: NF[]
  isLoading: boolean

  fetchData: () => Promise<void>

  createProject: (data: { name: string; description?: string; color: string }) => Promise<void>
  updateProject: (id: string, data: { name: string; description?: string; color: string }) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  addNF: (data: AddNFInput) => Promise<void>
  updateNF: (id: string, data: UpdateNFInput) => Promise<void>
  deleteNF: (id: string) => Promise<void>
  toggleNFItemStatus: (nfId: string, itemId: string) => Promise<void>
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useProjectStore = create<ProjectStore>()((set, get) => ({
  projects: [],
  nfs: [],
  isLoading: false,

  // ── Fetch ──────────────────────────────────────────────────────────────────

  fetchData: async () => {
    set({ isLoading: true })
    const supabase = createClient()

    const [{ data: projectRows }, { data: nfRows }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('nfs').select('*').order('uploaded_at', { ascending: false }),
    ])

    set({
      projects: (projectRows as ProjectRow[] ?? []).map(mapProject),
      nfs: (nfRows as NFRow[] ?? []).map(mapNF),
      isLoading: false,
    })
  },

  // ── Projetos ───────────────────────────────────────────────────────────────

  createProject: async ({ name, description, color }) => {
    const id = nanoid()
    const now = new Date().toISOString()
    const optimistic: Project = { id, name, description, color, createdAt: now, updatedAt: now }

    set((s) => ({ projects: [optimistic, ...s.projects] }))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('projects').insert({
      id,
      user_id: user!.id,
      name,
      description: description ?? null,
      color,
      created_at: now,
      updated_at: now,
    })

    if (error) {
      set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }))
    }
  },

  updateProject: async (id, { name, description, color }) => {
    const now = new Date().toISOString()
    const prev = get().projects.find((p) => p.id === id)

    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, name, description, color, updatedAt: now } : p
      ),
    }))

    const supabase = createClient()
    const { error } = await supabase
      .from('projects')
      .update({ name, description: description ?? null, color, updated_at: now })
      .eq('id', id)

    if (error && prev) {
      set((s) => ({ projects: s.projects.map((p) => (p.id === id ? prev : p)) }))
    }
  },

  deleteProject: async (id) => {
    const prevProjects = get().projects
    const prevNFs = get().nfs

    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      nfs: s.nfs.filter((nf) => nf.projectId !== id),
    }))

    const supabase = createClient()
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      set({ projects: prevProjects, nfs: prevNFs })
    }
  },

  // ── NFs ───────────────────────────────────────────────────────────────────

  addNF: async ({ projectId, name, description, fileData, fileName, fileSize, emitente, dataEmissao, itens, quantidadeTotal, volumes }) => {
    const id = nanoid()
    const now = new Date().toISOString()
    const optimistic: NF = {
      id, projectId, name, description, fileData, fileName, fileSize,
      uploadedAt: now, updatedAt: now,
      emitente, dataEmissao,
      itens: itens ?? [],
      quantidadeTotal, volumes,
    }

    set((s) => ({ nfs: [optimistic, ...s.nfs] }))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('nfs').insert({
      id,
      project_id: projectId,
      user_id: user!.id,
      name,
      description: description ?? null,
      file_data: fileData,
      file_name: fileName,
      file_size: fileSize,
      uploaded_at: now,
      updated_at: now,
      emitente: emitente ?? null,
      data_emissao: dataEmissao ?? null,
      itens: itens ?? [],
      quantidade_total: quantidadeTotal ?? null,
      volumes: volumes ?? null,
    })

    if (error) {
      set((s) => ({ nfs: s.nfs.filter((nf) => nf.id !== id) }))
    }
  },

  updateNF: async (id, { name, description, fileData, fileName, fileSize, emitente, dataEmissao, itens, quantidadeTotal, volumes }) => {
    const now = new Date().toISOString()
    const prev = get().nfs.find((nf) => nf.id === id)

    set((s) => ({
      nfs: s.nfs.map((nf) =>
        nf.id === id
          ? {
              ...nf,
              name,
              description,
              ...(fileData !== undefined && { fileData }),
              ...(fileName !== undefined && { fileName }),
              ...(fileSize !== undefined && { fileSize }),
              ...(emitente !== undefined && { emitente }),
              ...(dataEmissao !== undefined && { dataEmissao }),
              ...(itens !== undefined && { itens }),
              ...(quantidadeTotal !== undefined && { quantidadeTotal }),
              ...(volumes !== undefined && { volumes }),
              updatedAt: now,
            }
          : nf
      ),
    }))

    const supabase = createClient()
    const { error } = await supabase
      .from('nfs')
      .update({
        name,
        description: description ?? null,
        ...(fileData !== undefined && { file_data: fileData }),
        ...(fileName !== undefined && { file_name: fileName }),
        ...(fileSize !== undefined && { file_size: fileSize }),
        ...(emitente !== undefined && { emitente }),
        ...(dataEmissao !== undefined && { data_emissao: dataEmissao }),
        ...(itens !== undefined && { itens }),
        ...(quantidadeTotal !== undefined && { quantidade_total: quantidadeTotal }),
        ...(volumes !== undefined && { volumes }),
        updated_at: now,
      })
      .eq('id', id)

    if (error && prev) {
      set((s) => ({ nfs: s.nfs.map((nf) => (nf.id === id ? prev : nf)) }))
    }
  },

  deleteNF: async (id) => {
    const prevNFs = get().nfs

    set((s) => ({ nfs: s.nfs.filter((nf) => nf.id !== id) }))

    const supabase = createClient()
    const { error } = await supabase.from('nfs').delete().eq('id', id)

    if (error) {
      set({ nfs: prevNFs })
    }
  },

  toggleNFItemStatus: async (nfId, itemId) => {
    const nf = get().nfs.find((n) => n.id === nfId)
    if (!nf) return

    const updatedItens = nf.itens.map((item) =>
      item.id === itemId
        ? { ...item, status: item.status === 'pendente' ? 'confirmado' : 'pendente' }
        : item
    ) as NFItem[]

    const now = new Date().toISOString()

    set((s) => ({
      nfs: s.nfs.map((n) =>
        n.id === nfId ? { ...n, itens: updatedItens, updatedAt: now } : n
      ),
    }))

    const supabase = createClient()
    await supabase
      .from('nfs')
      .update({ itens: updatedItens, updated_at: now })
      .eq('id', nfId)
  },
}))

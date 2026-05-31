'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { Header } from '@/components/layout/Header'
import { ProjectList } from '@/components/projects/ProjectList'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { DeleteConfirm } from '@/components/projects/DeleteConfirm'
import { EmptyState } from '@/components/ui/EmptyState'
import { FAB } from '@/components/ui/FAB'
import { useProjectStore } from '@/store/useProjectStore'
import type { Project } from '@/types/project'

export default function HomePage() {
  const router = useRouter()
  const { projects, createProject, updateProject, deleteProject, fetchData } = useProjectStore()

  useEffect(() => { fetchData() }, [])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

  function handleOpenCreate() {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  function handleOpenEdit(project: Project) {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setEditingProject(null)
  }

  function handleModalSubmit(data: { name: string; description?: string; color: string }) {
    if (editingProject) {
      updateProject(editingProject.id, data)
    } else {
      createProject(data)
    }
  }

  function handleDeleteConfirm() {
    if (deletingProject) {
      deleteProject(deletingProject.id)
      setDeletingProject(null)
    }
  }

  function handleOpenProject(project: Project) {
    router.push(`/projeto/${project.id}`)
  }

  return (
    <MobileFrame>
      <Header projectCount={projects.length} />

      <main className="flex-1 flex flex-col">
        {projects.length === 0 ? (
          <EmptyState onCreateClick={handleOpenCreate} />
        ) : (
          <ProjectList
            projects={projects}
            onOpen={handleOpenProject}
            onEdit={handleOpenEdit}
            onDelete={setDeletingProject}
          />
        )}
      </main>

      <FAB onClick={handleOpenCreate} />

      <ProjectModal
        isOpen={isModalOpen}
        editingProject={editingProject}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
      />

      <DeleteConfirm
        project={deletingProject}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProject(null)}
      />
    </MobileFrame>
  )
}

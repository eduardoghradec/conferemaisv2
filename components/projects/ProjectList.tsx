'use client'

import { AnimatePresence } from 'framer-motion'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types/project'

type ProjectListProps = {
  projects: Project[]
  onOpen: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectList({ projects, onOpen, onEdit, onDelete }: ProjectListProps) {
  return (
    <div className="flex flex-col gap-3 px-5 pb-28">
      <AnimatePresence mode="popLayout">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

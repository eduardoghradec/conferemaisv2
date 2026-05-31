export type Project = {
  id: string
  name: string
  description?: string
  color: string
  createdAt: string
  updatedAt: string
}

export const PROJECT_COLORS = [
  '#FF6500', // laranja (primary)
  '#3B82F6', // azul
  '#10B981', // verde
  '#8B5CF6', // roxo
  '#F59E0B', // âmbar
  '#EF4444', // vermelho
]

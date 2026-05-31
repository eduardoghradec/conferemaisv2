export type NFItemStatus = 'pendente' | 'confirmado'

export type NFItem = {
  id: string
  numero: number
  descricao: string
  ncm: string
  codigoProduto?: string
  quantidade: number
  unidade: string
  status: NFItemStatus
}

export type NFEmitente = {
  nome: string
  cnpj: string
}

export type NF = {
  id: string
  projectId: string
  name: string
  description?: string
  fileData?: string  // base64 encoded PDF — carregado sob demanda
  fileName: string   // nome original do arquivo
  fileSize: number   // tamanho em bytes
  uploadedAt: string // ISO 8601
  updatedAt: string  // ISO 8601
  // Dados extraídos do XML NF-e
  emitente?: NFEmitente
  dataEmissao?: string
  itens: NFItem[]
  quantidadeTotal?: number
  volumes?: number
}

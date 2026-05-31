import { Skeleton } from '@/components/ui/Skeleton'

export function NFCardSkeleton() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden pl-5 pr-4 py-4"
      style={{ background: '#141414', border: '1px solid #2A2A2A' }}
    >
      {/* Borda lateral laranja */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-[#2A2A2A]" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Nome */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-3.5 h-3.5 rounded-sm flex-shrink-0" />
            <Skeleton className="h-4 w-44 rounded-md" />
          </div>
          {/* Emitente */}
          <Skeleton className="h-3.5 w-48 ml-5 rounded-md" />
          {/* Metadados */}
          <div className="flex items-center gap-2 mt-0.5 ml-5">
            <Skeleton className="h-3 w-14 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-8 h-8 rounded-xl" />
        </div>
      </div>

      {/* Hint "Ver detalhes" */}
      <div className="flex items-center gap-1 mt-2 ml-5">
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
    </div>
  )
}

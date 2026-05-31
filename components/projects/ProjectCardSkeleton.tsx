import { Skeleton } from '@/components/ui/Skeleton'

export function ProjectCardSkeleton() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden pl-5 pr-4 py-4"
      style={{ background: '#141414', border: '1px solid #2A2A2A' }}
    >
      {/* Borda lateral */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-[#2A2A2A]" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Nome */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 w-40 rounded-md" />
          </div>
          {/* Descrição */}
          <Skeleton className="h-3.5 w-56 ml-4 rounded-md" />
          {/* Data */}
          <Skeleton className="h-3 w-24 ml-4 mt-0.5 rounded-md" />
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-8 h-8 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

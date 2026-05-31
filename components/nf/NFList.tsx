'use client'

import { AnimatePresence } from 'framer-motion'
import { NFCard } from './NFCard'
import type { NF } from '@/types/nf'

type NFListProps = {
  nfs: NF[]
  onOpenDetail: (nf: NF) => void
  onView: (nf: NF) => void
  onEdit: (nf: NF) => void
  onDelete: (nf: NF) => void
}

export function NFList({ nfs, onOpenDetail, onView, onEdit, onDelete }: NFListProps) {
  return (
    <div className="flex flex-col gap-3 px-5 pb-28">
      <AnimatePresence mode="popLayout">
        {nfs.map((nf, index) => (
          <NFCard
            key={nf.id}
            nf={nf}
            index={index}
            onOpenDetail={onOpenDetail}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

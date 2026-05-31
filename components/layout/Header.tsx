'use client'

import { motion } from 'framer-motion'

type HeaderProps = {
  projectCount: number
}

export function Header({ projectCount }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-40 px-5 pb-4 header-safe-top bg-[#080808]/90 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#FF6500] to-[#FF8C35] bg-clip-text text-transparent">
              Confere
            </h1>
            <span className="text-2xl font-extrabold text-white">+</span>
          </div>
          <p className="text-xs text-[#555555] mt-0.5 font-medium">
            Seus projetos em um só lugar
          </p>
        </div>

        {projectCount > 0 && (
          <motion.div
            key={projectCount}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#141414] border border-[#2A2A2A]"
          >
            <span className="text-sm font-bold text-[#FF6500]">{projectCount}</span>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

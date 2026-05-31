'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'md' && 'px-5 py-3.5 text-sm',
        size === 'sm' && 'px-3.5 py-2 text-xs',
        variant === 'primary' && [
          'text-white',
          'bg-gradient-to-r from-[#FF6500] to-[#FF8C35]',
          'shadow-lg shadow-orange-500/25',
          'hover:shadow-xl hover:shadow-orange-500/35',
          'hover:brightness-110',
        ],
        variant === 'ghost' && [
          'text-[#A0A0A0] bg-transparent border border-[#2A2A2A]',
          'hover:bg-[#1E1E1E] hover:text-white hover:border-[#3A3A3A]',
        ],
        variant === 'danger' && [
          'text-red-400 bg-red-500/10 border border-red-500/20',
          'hover:bg-red-500/20 hover:text-red-300',
        ],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  )
}

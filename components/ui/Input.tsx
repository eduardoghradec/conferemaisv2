'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3.5 rounded-xl text-white placeholder-[#555555]',
            'bg-[#1E1E1E] border border-[#2A2A2A]',
            'focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]/30',
            'transition-all duration-200 text-sm font-medium',
            error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-400 font-medium">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

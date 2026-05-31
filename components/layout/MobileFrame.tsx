'use client'

export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080808] flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen flex flex-col overflow-hidden bg-[#080808]">
        {children}
      </div>
    </div>
  )
}

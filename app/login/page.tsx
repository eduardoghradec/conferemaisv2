'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    router.replace('/')
    router.refresh()
  }

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#FF6500] to-[#FF8C35] bg-clip-text text-transparent">
              Confere
            </h1>
            <span className="text-3xl font-extrabold text-white">+</span>
          </div>
          <p className="text-sm text-[#555555] mt-1.5 font-medium">
            Entre para acessar seus projetos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            error={error}
            required
          />

          <Button type="submit" loading={loading} className="w-full mt-2">
            Entrar
          </Button>
        </form>

        {/* Link para cadastro */}
        <p className="text-center text-sm text-[#555555] mt-6 font-medium">
          Não tem conta?{' '}
          <Link
            href="/signup"
            className="text-[#FF6500] hover:text-[#FF8C35] transition-colors font-semibold"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </MobileFrame>
  )
}

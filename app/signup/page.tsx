'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Se a confirmação de e-mail estiver desabilitada, o usuário já está logado
    if (data.session) {
      router.replace('/')
      router.refresh()
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <MobileFrame>
        <div className="flex-1 flex flex-col justify-center px-6 py-10">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#FF6500]/10 border border-[#FF6500]/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Confirme seu e-mail
            </h2>
            <p className="text-sm text-[#555555] font-medium leading-relaxed">
              Enviamos um link de confirmação para{' '}
              <span className="text-[#A0A0A0]">{email}</span>. Acesse seu e-mail
              para ativar sua conta.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-[#FF6500] hover:text-[#FF8C35] transition-colors text-sm font-semibold"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </MobileFrame>
    )
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
            Crie sua conta para começar
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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            error={error}
            required
          />

          <Button type="submit" loading={loading} className="w-full mt-2">
            Criar conta
          </Button>
        </form>

        {/* Link para login */}
        <p className="text-center text-sm text-[#555555] mt-6 font-medium">
          Já tem conta?{' '}
          <Link
            href="/login"
            className="text-[#FF6500] hover:text-[#FF8C35] transition-colors font-semibold"
          >
            Entrar
          </Link>
        </p>
      </div>
    </MobileFrame>
  )
}

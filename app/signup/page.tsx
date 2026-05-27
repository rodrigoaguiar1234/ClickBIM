'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/src/lib/supabase/client'
import { Eye, EyeOff, Zap, Loader2, CheckCircle2 } from 'lucide-react'

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormValues) => {
    setAuthError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    })
    if (error) {
      setAuthError(error.message)
      return
    }
    setSuccess(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F172A' }}>
      <div className="w-full max-w-md px-8 py-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#F97316' }}
            >
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">ClickBIM</h1>
          </div>
          <p className="text-slate-400 text-sm">EnergiaBIM – Gestão de Projetos BIM</p>
        </div>

        {success ? (
          <div
            className="rounded-2xl p-8 text-center shadow-2xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-14 h-14 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Verifique seu e-mail</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#F97316' }}
            >
              Ir para o login
            </Link>
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 shadow-2xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h2 className="text-xl font-semibold text-white mb-1">Criar conta</h2>
            <p className="text-slate-400 text-sm mb-6">Comece a usar o ClickBIM gratuitamente</p>

            {authError && (
              <div className="mb-5 rounded-lg px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Nome completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="João Silva"
                  className={`w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${
                    errors.fullName
                      ? 'border-red-500/60 bg-red-500/5 ring-red-500/30'
                      : 'focus:ring-orange-500/40'
                  }`}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: errors.fullName ? undefined : '1px solid rgba(255,255,255,0.10)',
                  }}
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  className={`w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${
                    errors.email
                      ? 'border-red-500/60 bg-red-500/5 ring-red-500/30'
                      : 'focus:ring-orange-500/40'
                  }`}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: errors.email ? undefined : '1px solid rgba(255,255,255,0.10)',
                  }}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    className={`w-full rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${
                      errors.password
                        ? 'border-red-500/60 bg-red-500/5 ring-red-500/30'
                        : 'focus:ring-orange-500/40'
                    }`}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: errors.password ? undefined : '1px solid rgba(255,255,255,0.10)',
                    }}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    className={`w-full rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${
                      errors.confirmPassword
                        ? 'border-red-500/60 bg-red-500/5 ring-red-500/30'
                        : 'focus:ring-orange-500/40'
                    }`}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: errors.confirmPassword ? undefined : '1px solid rgba(255,255,255,0.10)',
                    }}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                style={{ backgroundColor: '#F97316' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Já tem uma conta?{' '}
          <Link
            href="/login"
            className="font-medium transition-colors hover:text-orange-400"
            style={{ color: '#F97316' }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

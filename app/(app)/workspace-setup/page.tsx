'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Loader2 } from 'lucide-react'
import { createClient } from '@/src/lib/supabase/client'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const workspaceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(80, 'Nome muito longo'),
  slug: z
    .string()
    .min(2, 'Slug deve ter ao menos 2 caracteres')
    .max(50, 'Slug muito longo')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
})

type WorkspaceFormValues = z.infer<typeof workspaceSchema>

export default function WorkspaceSetupPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [slugEdited, setSlugEdited] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: '', slug: '' },
  })

  const nameValue = watch('name')

  useEffect(() => {
    if (!slugEdited && nameValue) {
      setValue('slug', slugify(nameValue), { shouldValidate: false })
    }
  }, [nameValue, slugEdited, setValue])

  const onSubmit = async (data: WorkspaceFormValues) => {
    setFormError(null)
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setFormError('Sessão expirada. Faça login novamente.')
      return
    }

    // Insert workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name: data.name,
        slug: data.slug,
        owner_id: user.id,
      })
      .select()
      .single()

    if (wsError) {
      if (wsError.code === '23505') {
        setFormError('Este slug já está em uso. Escolha outro.')
      } else {
        setFormError(wsError.message)
      }
      return
    }

    // Insert workspace member as owner
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      setFormError(memberError.message)
      return
    }

    router.push(`/${data.slug}`)
    router.refresh()
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

        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-1">Criar seu Workspace</h2>
          <p className="text-slate-400 text-sm mb-6">
            Um workspace é onde você e seu time gerenciam projetos e tarefas.
          </p>

          {formError && (
            <div className="mb-5 rounded-lg px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Workspace name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Nome do Workspace
              </label>
              <input
                id="name"
                type="text"
                placeholder="EnergiaBIM"
                autoFocus
                className={`w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${
                  errors.name
                    ? 'border-red-500/60 bg-red-500/5 ring-red-500/30'
                    : 'focus:ring-orange-500/40'
                }`}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: errors.name ? undefined : '1px solid rgba(255,255,255,0.10)',
                }}
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-slate-300 mb-1.5">
                URL do Workspace
              </label>
              <div
                className="flex items-center rounded-lg overflow-hidden"
                style={{
                  border: errors.slug ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.10)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                }}
              >
                <span
                  className="px-3 py-2.5 text-sm text-slate-500 border-r shrink-0"
                  style={{ borderColor: 'rgba(255,255,255,0.10)' }}
                >
                  clickbim.app/
                </span>
                <input
                  id="slug"
                  type="text"
                  placeholder="meu-workspace"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  {...register('slug', {
                    onChange: () => setSlugEdited(true),
                  })}
                />
              </div>
              {errors.slug ? (
                <p className="mt-1.5 text-xs text-red-400">{errors.slug.message}</p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-600">
                  Usado na URL. Não pode ser alterado depois.
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99] mt-2"
              style={{ backgroundColor: '#F97316' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando workspace...
                </>
              ) : (
                'Criar Workspace'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

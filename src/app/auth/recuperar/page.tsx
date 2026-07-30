'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Brain, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/perfil/cambiar-password`,
    })
    if (error) { toast.error(error.message); setLoading(false) }
    else setSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sage-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Revisa tu email</h2>
              <p className="text-gray-500 text-sm mb-6">Enviamos un enlace de recuperación a <strong>{email}</strong></p>
              <Link href="/auth/login" className="btn-primary justify-center">Volver al login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">Recuperar contraseña</h2>
              <p className="text-gray-500 text-sm mb-6">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="tu@email.com" required />
                <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar enlace
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                <Link href="/auth/login" className="text-primary-600 font-medium">Volver al login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

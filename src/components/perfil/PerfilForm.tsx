'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profesional } from '@/types'

export default function PerfilForm({ profesional }: { profesional: Profesional }) {
  const [loading, setLoading] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)
  const [form, setForm] = useState({
    nombre: profesional?.nombre || '',
    apellido: profesional?.apellido || '',
    telefono: profesional?.telefono || '',
    especialidad: profesional?.especialidad || '',
    matricula: profesional?.matricula || '',
  })
  const [pass, setPass] = useState({ nueva: '', confirmar: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profesionales').update(form).eq('id', profesional.id)
    if (error) toast.error(error.message)
    else toast.success('Perfil actualizado')
    setLoading(false)
  }

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault()
    if (pass.nueva !== pass.confirmar) return toast.error('Las contraseñas no coinciden')
    if (pass.nueva.length < 8) return toast.error('Mínimo 8 caracteres')
    setLoadingPass(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pass.nueva })
    if (error) toast.error(error.message)
    else { toast.success('Contraseña actualizada'); setPass({ nueva: '', confirmar: '' }) }
    setLoadingPass(false)
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="card p-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-700">{profesional?.nombre?.[0]}{profesional?.apellido?.[0]}</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{profesional.nombre} {profesional.apellido}</p>
          <p className="text-sm text-gray-500">{profesional.email}</p>
        </div>
      </div>

      {/* Datos */}
      <form onSubmit={handleSave} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Datos profesionales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input name="apellido" value={form.apellido} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N° Matrícula</label>
            <input name="matricula" value={form.matricula} onChange={handleChange} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
            <input name="especialidad" value={form.especialidad} onChange={handleChange} className="input-field" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar cambios
          </button>
        </div>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={handleCambiarPassword} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><KeyRound className="w-4 h-4" />Cambiar contraseña</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <input type="password" value={pass.nueva} onChange={e => setPass(p => ({...p, nueva: e.target.value}))} className="input-field" placeholder="Mín. 8 caracteres" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
          <input type="password" value={pass.confirmar} onChange={e => setPass(p => ({...p, confirmar: e.target.value}))} className="input-field" placeholder="Repetir contraseña" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={loadingPass}>
            {loadingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Cambiar contraseña
          </button>
        </div>
      </form>
    </div>
  )
}

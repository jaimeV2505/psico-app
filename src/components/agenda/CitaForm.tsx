'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Cita } from '@/types'

interface Props {
  cita?: Partial<Cita>
  pacientes: { id: string; nombre: string; apellido: string }[]
  profesionalId: string
  modo: 'nuevo' | 'editar'
  pacientePreseleccionado?: string
}

export default function CitaForm({ cita, pacientes, profesionalId, modo, pacientePreseleccionado }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    titulo: cita?.titulo || '',
    paciente_id: cita?.paciente_id || pacientePreseleccionado || '',
    fecha: cita?.fecha || new Date().toISOString().split('T')[0],
    hora_inicio: cita?.hora_inicio || '09:00',
    hora_fin: cita?.hora_fin || '10:00',
    estado: cita?.estado || 'pendiente',
    modalidad: cita?.modalidad || 'presencial',
    notas: cita?.notas || '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo || !form.fecha) return toast.error('Título y fecha son requeridos')
    setLoading(true)
    const supabase = createClient()
    const payload = {
      ...form,
      profesional_id: profesionalId,
      paciente_id: form.paciente_id || null,
    }
    let error
    if (modo === 'nuevo') {
      const res = await supabase.from('citas').insert(payload)
      error = res.error
      if (!error) { toast.success('Cita agendada'); router.push('/agenda'); router.refresh() }
    } else {
      const res = await supabase.from('citas').update(payload).eq('id', cita!.id!)
      error = res.error
      if (!error) { toast.success('Cita actualizada'); router.push('/agenda'); router.refresh() }
    }
    if (error) { toast.error(error.message); setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título / motivo *</label>
        <input name="titulo" value={form.titulo} onChange={handleChange} className="input-field" placeholder="Ej: Sesión individual, Evaluación inicial..." required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
        <select name="paciente_id" value={form.paciente_id} onChange={handleChange} className="input-field">
          <option value="">— Sin paciente asociado —</option>
          {pacientes.map(p => (
            <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
        <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="input-field" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
          <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
          <input type="time" name="hora_fin" value={form.hora_fin} onChange={handleChange} className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange} className="input-field">
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
            <option value="no_asistio">No asistió</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
          <select name="modalidad" value={form.modalidad} onChange={handleChange} className="input-field">
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea name="notas" value={form.notas} onChange={handleChange} rows={3} className="input-field" placeholder="Observaciones adicionales..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {modo === 'nuevo' ? 'Agendar cita' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

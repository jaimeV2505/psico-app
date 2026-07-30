'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Sesion } from '@/types'

interface Props {
  pacienteId: string
  profesionalId: string
  sesion?: Partial<Sesion>
  modo: 'nuevo' | 'editar'
}

export default function SesionForm({ pacienteId, profesionalId, sesion, modo }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fecha: sesion?.fecha || new Date().toISOString().split('T')[0],
    duracion_min: sesion?.duracion_min?.toString() || '50',
    estado_emocional: sesion?.estado_emocional || '',
    tipo: sesion?.tipo || 'individual',
    modalidad: sesion?.modalidad || 'presencial',
    contenido: sesion?.contenido || '',
    avances: sesion?.avances || '',
    tareas_asignadas: sesion?.tareas_asignadas || '',
    proximos_objetivos: sesion?.proximos_objetivos || '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const payload = {
      paciente_id: pacienteId,
      profesional_id: profesionalId,
      fecha: form.fecha,
      duracion_min: parseInt(form.duracion_min) || 50,
      estado_emocional: form.estado_emocional || null,
      tipo: form.tipo,
      modalidad: form.modalidad,
      contenido: form.contenido || null,
      avances: form.avances || null,
      tareas_asignadas: form.tareas_asignadas || null,
      proximos_objetivos: form.proximos_objetivos || null,
    }

    let error
    if (modo === 'nuevo') {
      const res = await supabase.from('sesiones').insert(payload)
      error = res.error
      if (!error) { toast.success('Sesión registrada'); router.push(`/pacientes/${pacienteId}`); router.refresh() }
    } else {
      const res = await supabase.from('sesiones').update(payload).eq('id', sesion!.id!)
      error = res.error
      if (!error) { toast.success('Sesión actualizada'); router.push(`/pacientes/${pacienteId}/sesiones/${sesion!.id}`); router.refresh() }
    }
    if (error) { toast.error(error.message); setLoading(false) }
  }

  const emociones = [
    { value: 'muy_mal', label: '😞 Muy mal' },
    { value: 'mal', label: '😕 Mal' },
    { value: 'regular', label: '😐 Regular' },
    { value: 'bien', label: '🙂 Bien' },
    { value: 'muy_bien', label: '😊 Muy bien' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
            <input type="number" name="duracion_min" value={form.duracion_min} onChange={handleChange} className="input-field" min="5" max="180" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado emocional</label>
            <select name="estado_emocional" value={form.estado_emocional} onChange={handleChange} className="input-field">
              <option value="">— Seleccionar —</option>
              {emociones.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="input-field">
              <option value="individual">Individual</option>
              <option value="pareja">Pareja</option>
              <option value="familiar">Familiar</option>
              <option value="grupo">Grupo</option>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas de la sesión</label>
          <textarea name="contenido" value={form.contenido} onChange={handleChange} rows={6} className="input-field" placeholder="Descripción detallada del contenido trabajado en la sesión, técnicas aplicadas, estado general del paciente..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avances observados</label>
          <textarea name="avances" value={form.avances} onChange={handleChange} rows={3} className="input-field" placeholder="Progresos, logros o cambios positivos observados..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tareas asignadas</label>
          <textarea name="tareas_asignadas" value={form.tareas_asignadas} onChange={handleChange} rows={2} className="input-field" placeholder="Actividades o ejercicios para realizar entre sesiones..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos para próxima sesión</label>
          <textarea name="proximos_objetivos" value={form.proximos_objetivos} onChange={handleChange} rows={2} className="input-field" placeholder="Temas o metas a abordar en la próxima sesión..." />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Guardando...' : 'Guardar sesión'}
        </button>
      </div>
    </form>
  )
}

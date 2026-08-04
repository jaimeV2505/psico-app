'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { buscarCIE10, getNombreCIE10 } from '@/lib/cie10'
import type { Evolucion } from '@/types'

interface Props {
  pacienteId: string
  profesionalId: string
  evolucion?: Partial<Evolucion>
  modo: 'nuevo' | 'editar'
  onSuccess?: () => void
}

export default function EvolucionForm({ pacienteId, profesionalId, evolucion, modo, onSuccess }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cie10Query, setCie10Query] = useState(evolucion?.diagnostico_cie10 || '')
  const [cie10Sugerencias, setCie10Sugerencias] = useState<{ codigo: string; nombre: string }[]>([])

  const [form, setForm] = useState({
    fecha: evolucion?.fecha || new Date().toISOString().split('T')[0],
    evolucion: evolucion?.evolucion || '',
    examen_psicosemiologico: evolucion?.examen_psicosemiologico || '',
    diagnostico_cie10: evolucion?.diagnostico_cie10 || '',
    indicaciones: evolucion?.indicaciones || '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleCie10Change(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setCie10Query(value)
    if (value.length >= 2) {
      setCie10Sugerencias(buscarCIE10(value))
    } else {
      setCie10Sugerencias([])
    }
    setForm(prev => ({ ...prev, diagnostico_cie10: value }))
  }

  function seleccionarCie10(codigo: string, nombre: string) {
    setCie10Query(`${codigo} - ${nombre}`)
    setForm(prev => ({ ...prev, diagnostico_cie10: codigo }))
    setCie10Sugerencias([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const payload = {
      paciente_id: pacienteId,
      profesional_id: profesionalId,
      fecha: form.fecha,
      evolucion: form.evolucion || null,
      examen_psicosemiologico: form.examen_psicosemiologico || null,
      diagnostico_cie10: form.diagnostico_cie10 || null,
      indicaciones: form.indicaciones || null,
    }

    if (modo === 'nuevo') {
      const { error } = await supabase.from('evoluciones').insert(payload)
      if (error) { toast.error(error.message); setLoading(false) }
      else {
        toast.success('Evolución registrada')
        router.refresh()
        onSuccess?.()
      }
    } else {
      const { error } = await supabase.from('evoluciones').update(payload).eq('id', evolucion!.id!)
      if (error) { toast.error(error.message); setLoading(false) }
      else {
        toast.success('Evolución actualizada')
        router.refresh()
        onSuccess?.()
      }
    }
  }

  const L = ({ text }: { text: string }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">{text}</label>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <L text="Fecha" />
        <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="input-field" required />
      </div>

      <div>
        <L text="Evolución" />
        <textarea name="evolucion" value={form.evolucion} onChange={handleChange} rows={5} className="input-field" placeholder="Descripción de la evolución del paciente en esta sesión..." />
      </div>

      <div>
        <L text="Examen psicosemiológico" />
        <textarea name="examen_psicosemiologico" value={form.examen_psicosemiologico} onChange={handleChange} rows={4} className="input-field" placeholder="Estado mental: conciencia, orientación, atención, memoria, pensamiento, lenguaje, afecto..." />
      </div>

      {/* CIE-10 */}
      <div className="relative">
        <L text="Nuevo diagnóstico CIE-10 (opcional)" />
        <input
          type="text"
          value={cie10Query}
          onChange={handleCie10Change}
          placeholder="Ej: F41 o ansiedad..."
          className="input-field"
          autoComplete="off"
        />
        {form.diagnostico_cie10 && getNombreCIE10(form.diagnostico_cie10) && (
          <p className="text-xs text-primary-600 font-medium mt-1">
            ✓ {form.diagnostico_cie10} — {getNombreCIE10(form.diagnostico_cie10)}
          </p>
        )}
        {cie10Sugerencias.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {cie10Sugerencias.map(s => (
              <button
                key={s.codigo}
                type="button"
                onClick={() => seleccionarCie10(s.codigo, s.nombre)}
                className="w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <span className="text-xs font-bold text-primary-600 mr-2">{s.codigo}</span>
                <span className="text-sm text-gray-700">{s.nombre}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <L text="Indicaciones" />
        <textarea name="indicaciones" value={form.indicaciones} onChange={handleChange} rows={3} className="input-field" placeholder="Indicaciones terapéuticas para esta evolución..." />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => onSuccess?.()} className="btn-secondary">Cancelar</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Guardando...' : 'Guardar evolución'}
        </button>
      </div>
    </form>
  )
}
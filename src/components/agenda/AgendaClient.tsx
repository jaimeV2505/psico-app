'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Edit, Trash2, Loader2, X, Check } from 'lucide-react'
import { formatearFecha, formatearHora, ESTADO_CITA_COLORS, ESTADO_CITA_LABELS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Cita } from '@/types'

interface Props {
  citas: (Cita & { pacientes?: { id: string; nombre: string; apellido: string } })[]
  pacientes: { id: string; nombre: string; apellido: string }[]
  inicioSemana: string
  profesionalId: string
}

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

export default function AgendaClient({ citas, pacientes, inicioSemana, profesionalId }: Props) {
  const router = useRouter()
  const [semana, setSemana] = useState(new Date(inicioSemana))
  const [citasState, setCitas] = useState(citas)
  const [selected, setSelected] = useState<typeof citas[0] | null>(null)
  const [loading, setLoading] = useState(false)

  function getDias() {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(semana)
      d.setDate(semana.getDate() + i)
      return d
    })
  }

  function navegarSemana(delta: number) {
    const nueva = new Date(semana)
    nueva.setDate(semana.getDate() + delta * 7)
    setSemana(nueva)
    const params = new URLSearchParams({ semana: nueva.toISOString().split('T')[0] })
    router.push(`/agenda?${params}`)
  }

  function getCitasDia(dia: Date) {
    const key = dia.toISOString().split('T')[0]
    return citasState.filter(c => c.fecha === key)
  }

  async function cambiarEstado(citaId: string, estado: string) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('citas').update({ estado }).eq('id', citaId)
    if (error) toast.error(error.message)
    else {
      toast.success('Estado actualizado')
      setCitas(prev => prev.map(c => c.id === citaId ? { ...c, estado: estado as Cita['estado'] } : c))
      if (selected?.id === citaId) setSelected(prev => prev ? { ...prev, estado: estado as Cita['estado'] } : null)
    }
    setLoading(false)
  }

  async function eliminarCita(citaId: string) {
    if (!confirm('¿Eliminar esta cita?')) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('citas').delete().eq('id', citaId)
    if (error) toast.error(error.message)
    else {
      toast.success('Cita eliminada')
      setCitas(prev => prev.filter(c => c.id !== citaId))
      setSelected(null)
    }
    setLoading(false)
  }

  const hoyStr = new Date().toISOString().split('T')[0]
  const dias = getDias()
  const mesLabel = `${MESES[semana.getMonth()]} ${semana.getFullYear()}`

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="card p-4 flex items-center justify-between">
        <button onClick={() => navegarSemana(-1)} className="btn-secondary py-2 px-3">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-gray-900 capitalize">{mesLabel}</p>
          <p className="text-xs text-gray-500">
          {formatearFecha(dias[0].toISOString().split('T')[0])} — {formatearFecha(dias[6].toISOString().split('T')[0])}          </p>
        </div>
        <button onClick={() => navegarSemana(1)} className="btn-secondary py-2 px-3">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {dias.map((dia, i) => {
          const diaStr = dia.toISOString().split('T')[0]
          const esHoy = diaStr === hoyStr
          const citasDia = getCitasDia(dia)
          return (
            <div key={i} className={`card p-2 min-h-[120px] ${esHoy ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`}>
              <div className={`text-center mb-2 rounded-lg py-1 ${esHoy ? 'bg-primary-600' : ''}`}>
                <p className={`text-xs font-medium ${esHoy ? 'text-white' : 'text-gray-400'}`}>{DIAS[i]}</p>
                <p className={`text-sm font-bold ${esHoy ? 'text-white' : 'text-gray-700'}`}>{dia.getDate()}</p>
              </div>
              <div className="space-y-1">
                {citasDia.map(cita => (
                  <button
                    key={cita.id}
                    onClick={() => setSelected(cita)}
                    className={`w-full text-left px-1.5 py-1 rounded text-xs font-medium truncate border transition-all hover:opacity-90 ${
                      cita.estado === 'cancelada' ? 'bg-red-50 border-red-200 text-red-700 line-through' :
                      cita.estado === 'realizada' ? 'bg-green-50 border-green-200 text-green-700' :
                      cita.estado === 'confirmada' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      'bg-yellow-50 border-yellow-200 text-yellow-700'
                    }`}
                  >
                    {formatearHora(cita.hora_inicio)} {cita.titulo.slice(0, 12)}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cita detail panel */}
      {selected && (
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selected.titulo}</h3>
              <p className="text-gray-500 text-sm">
                {formatearFecha(selected.fecha)} · {formatearHora(selected.hora_inicio)} — {formatearHora(selected.hora_fin)}
                {selected.pacientes && ` · ${selected.pacientes.nombre} ${selected.pacientes.apellido}`}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`badge ${ESTADO_CITA_COLORS[selected.estado]}`}>{ESTADO_CITA_LABELS[selected.estado]}</span>
            <span className={`badge ${selected.modalidad === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{selected.modalidad}</span>
          </div>

          {selected.notas && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">{selected.notas}</p>
          )}

          {/* Acciones de estado */}
          <div className="flex flex-wrap gap-2 mb-4">
            <p className="text-xs text-gray-500 font-medium w-full">Cambiar estado:</p>
            {['pendiente','confirmada','realizada','no_asistio','cancelada'].map(e => (
              <button
                key={e}
                onClick={() => cambiarEstado(selected.id, e)}
                disabled={loading || selected.estado === e}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all disabled:opacity-50
                  ${selected.estado === e ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
              >
                {loading && selected.estado === e ? <Loader2 className="w-3 h-3 animate-spin inline" /> : null}
                {ESTADO_CITA_LABELS[e]}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            {selected.pacientes && (
              <Link href={`/pacientes/${selected.pacientes.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Ver paciente →
              </Link>
            )}
            <div className="flex gap-2 ml-auto">
              <Link href={`/agenda/${selected.id}/editar`} className="btn-secondary py-1.5 px-3 text-sm">
                <Edit className="w-3.5 h-3.5" />Editar
              </Link>
              <button onClick={() => eliminarCita(selected.id)} disabled={loading} className="btn-danger py-1.5 px-3 text-sm">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List view */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Todas las citas de la semana</h2>
        {citasState.length > 0 ? (
          <div className="space-y-2">
            {citasState.map(cita => (
              <button
                key={cita.id}
                onClick={() => setSelected(cita)}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="min-w-[80px] text-center bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">{formatearFecha(cita.fecha, { day:'2-digit', month:'short'})}</p>
                  <p className="text-sm font-bold text-gray-700">{formatearHora(cita.hora_inicio)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{cita.titulo}</p>
                  {cita.pacientes && <p className="text-xs text-gray-500">{cita.pacientes.nombre} {cita.pacientes.apellido}</p>}
                </div>
                <span className={`badge ${ESTADO_CITA_COLORS[cita.estado]} flex-shrink-0`}>{ESTADO_CITA_LABELS[cita.estado]}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Sin citas esta semana</p>
            <Link href="/agenda/nueva" className="text-xs text-primary-600 hover:underline mt-1 inline-block">Agendar una cita</Link>
          </div>
        )}
      </div>
    </div>
  )
}

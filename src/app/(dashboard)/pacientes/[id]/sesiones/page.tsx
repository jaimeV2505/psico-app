import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Clock } from 'lucide-react'
import { formatearFecha, ESTADO_EMOCIONAL_EMOJI, ESTADO_EMOCIONAL_LABELS } from '@/lib/utils'
import type { Sesion } from '@/types'

export default async function SesionesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: paciente } = await supabase.from('pacientes').select('id, nombre, apellido').eq('id', id).eq('profesional_id', user.id).single()
  if (!paciente) notFound()

  const { data: sesiones } = await supabase.from('sesiones').select('*').eq('paciente_id', id).order('fecha', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/pacientes/${id}`} className="btn-secondary py-2 px-3"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sesiones</h1>
            <p className="text-gray-500 text-sm">{paciente.nombre} {paciente.apellido} · {sesiones?.length ?? 0} sesiones</p>
          </div>
        </div>
        <Link href={`/pacientes/${id}/sesiones/nueva`} className="btn-primary">
          <Plus className="w-4 h-4" />Registrar sesión
        </Link>
      </div>

      {sesiones && sesiones.length > 0 ? (
        <div className="space-y-3">
          {sesiones.map((s: Sesion) => (
            <Link key={s.id} href={`/pacientes/${id}/sesiones/${s.id}`} className="card p-5 block hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">#{s.numero_sesion}</span>
                  <span className="text-sm font-medium text-gray-900">{formatearFecha(s.fecha)}</span>
                  {s.estado_emocional && (
                    <span title={ESTADO_EMOCIONAL_LABELS[s.estado_emocional]}>{ESTADO_EMOCIONAL_EMOJI[s.estado_emocional]}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{s.duracion_min} min</span>
                  <span className={`badge ${s.modalidad === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{s.modalidad}</span>
                  <span className="text-primary-600 font-medium group-hover:underline">Ver →</span>
                </div>
              </div>
              {s.contenido && <p className="text-sm text-gray-600 line-clamp-2">{s.contenido}</p>}
              {s.avances && <p className="text-xs text-green-700 bg-green-50 rounded px-2 py-1 mt-2 line-clamp-1">✓ {s.avances}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Sin sesiones</h3>
          <p className="text-gray-500 text-sm mb-4">Registra la primera sesión con este paciente</p>
          <Link href={`/pacientes/${id}/sesiones/nueva`} className="btn-primary">
            <Plus className="w-4 h-4" />Registrar sesión
          </Link>
        </div>
      )}
    </div>
  )
}

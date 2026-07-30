import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { formatearFecha, ESTADO_EMOCIONAL_EMOJI, ESTADO_EMOCIONAL_LABELS } from '@/lib/utils'
import DeleteSesionButton from '@/components/pacientes/DeleteSesionButton'
import SesionForm from '@/components/pacientes/SesionForm'

export default async function SesionDetailPage({ params }: { params: Promise<{ id: string; sesionId: string }> }) {
  const { id, sesionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: sesion } = await supabase.from('sesiones').select('*').eq('id', sesionId).eq('profesional_id', user.id).single()
  if (!sesion) notFound()

  const { data: paciente } = await supabase.from('pacientes').select('id, nombre, apellido').eq('id', id).single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/pacientes/${id}/sesiones`} className="btn-secondary py-2 px-3"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sesión #{sesion.numero_sesion}</h1>
            <p className="text-gray-500 text-sm">
              {paciente?.nombre} {paciente?.apellido} · {formatearFecha(sesion.fecha)}
              {sesion.estado_emocional && ` · ${ESTADO_EMOCIONAL_EMOJI[sesion.estado_emocional]} ${ESTADO_EMOCIONAL_LABELS[sesion.estado_emocional]}`}
            </p>
          </div>
        </div>
        <DeleteSesionButton sesionId={sesionId} pacienteId={id} />
      </div>
      <SesionForm pacienteId={id} profesionalId={user.id} sesion={sesion} modo="editar" />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import PacienteForm from '@/components/pacientes/PacienteForm'
import { ArrowLeft } from 'lucide-react'

export default async function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .eq('profesional_id', user.id)
    .single()

  if (!paciente) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/pacientes/${id}`} className="btn-secondary py-2 px-3">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar paciente</h1>
          <p className="text-gray-500 text-sm">{paciente.nombre} {paciente.apellido}</p>
        </div>
      </div>
      <PacienteForm paciente={paciente} profesionalId={user.id} modo="editar" />
    </div>
  )
}

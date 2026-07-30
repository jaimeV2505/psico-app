import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PacienteForm from '@/components/pacientes/PacienteForm'
import { ArrowLeft } from 'lucide-react'

export default async function NuevoPacientePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pacientes" className="btn-secondary py-2 px-3">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo paciente</h1>
          <p className="text-gray-500 text-sm">Completa los datos del paciente</p>
        </div>
      </div>
      <PacienteForm profesionalId={user.id} modo="nuevo" />
    </div>
  )
}

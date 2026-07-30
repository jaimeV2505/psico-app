import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CitaForm from '@/components/agenda/CitaForm'

export default async function NuevaCitaPage({ searchParams }: { searchParams: Promise<{ paciente?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: pacientes } = await supabase
    .from('pacientes').select('id, nombre, apellido').eq('profesional_id', user.id)
    .eq('estado', 'activo').order('apellido')

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/agenda" className="btn-secondary py-2 px-3"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva cita</h1>
          <p className="text-gray-500 text-sm">Agregar a la agenda</p>
        </div>
      </div>
      <CitaForm pacientes={pacientes || []} profesionalId={user.id} modo="nuevo" pacientePreseleccionado={params.paciente} />
    </div>
  )
}

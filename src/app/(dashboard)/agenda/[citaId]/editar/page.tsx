import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CitaForm from '@/components/agenda/CitaForm'

export default async function EditarCitaPage({ params }: { params: Promise<{ citaId: string }> }) {
  const { citaId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: cita } = await supabase.from('citas').select('*').eq('id', citaId).eq('profesional_id', user.id).single()
  if (!cita) notFound()

  const { data: pacientes } = await supabase.from('pacientes').select('id, nombre, apellido').eq('profesional_id', user.id).order('apellido')

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/agenda" className="btn-secondary py-2 px-3"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar cita</h1>
          <p className="text-gray-500 text-sm">{cita.titulo}</p>
        </div>
      </div>
      <CitaForm cita={cita} pacientes={pacientes || []} profesionalId={user.id} modo="editar" />
    </div>
  )
}

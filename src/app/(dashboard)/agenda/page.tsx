import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar } from 'lucide-react'
import { formatearFecha, formatearHora, ESTADO_CITA_COLORS, ESTADO_CITA_LABELS } from '@/lib/utils'
import type { Cita } from '@/types'
import AgendaClient from '@/components/agenda/AgendaClient'

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ semana?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get current week bounds
  const hoy = new Date()
  const inicioSemana = params.semana ? new Date(params.semana) : new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 1))
  inicioSemana.setHours(0,0,0,0)
  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 6)

  const { data: citas } = await supabase
    .from('citas')
    .select('*, pacientes(id, nombre, apellido)')
    .eq('profesional_id', user.id)
    .gte('fecha', inicioSemana.toISOString().split('T')[0])
    .lte('fecha', finSemana.toISOString().split('T')[0])
    .order('fecha')
    .order('hora_inicio')

  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido')
    .eq('profesional_id', user.id)
    .eq('estado', 'activo')
    .order('apellido')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 text-sm mt-0.5">{citas?.length ?? 0} citas esta semana</p>
        </div>
        <Link href="/agenda/nueva" className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      <AgendaClient
        citas={citas || []}
        pacientes={pacientes || []}
        inicioSemana={inicioSemana.toISOString()}
        profesionalId={user.id}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Calendar, TrendingUp, Clock, ChevronRight, UserPlus } from 'lucide-react'
import { formatearFecha, formatearHora, ESTADO_CITA_COLORS, ESTADO_CITA_LABELS } from '@/lib/utils'
import type { Cita, Paciente } from '@/types'
import GraficosSesiones from '@/components/dashboard/GraficosSesiones'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: totalPacientes },
    { count: pacientesActivos },
    { data: citasHoy },
    { data: proximasCitas },
    { data: ultimosPacientes },
    { count: sesionesEsteMes },
    { data: todasLasSesiones },
    { data: todosPacientes },
  ] = await Promise.all([
supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('profesional_id', user!.id).is('deleted_at', null),
    supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('profesional_id', user!.id).eq('estado', 'activo').is('deleted_at', null),
supabase.from('citas').select('*, pacientes(nombre, apellido)').eq('profesional_id', user!.id).eq('fecha', new Date().toISOString().split('T')[0]).order('hora_inicio'),
    supabase.from('citas').select('*, pacientes(nombre, apellido)').eq('profesional_id', user!.id).gte('fecha', new Date().toISOString().split('T')[0]).in('estado', ['pendiente', 'confirmada']).order('fecha').order('hora_inicio').limit(5),
supabase.from('pacientes').select('id, nombre, apellido, estado, created_at').eq('profesional_id', user!.id).is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
supabase.from('sesiones').select('*', { count: 'exact', head: true }).eq('profesional_id', user!.id).gte('fecha', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
    supabase.from('sesiones').select('fecha').eq('profesional_id', user!.id).gte('fecha', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]),
    supabase.from('pacientes').select('estado').eq('profesional_id', user!.id).is('deleted_at', null),
  ])

  const estadisticas = [
    { label: 'Total pacientes', value: totalPacientes ?? 0, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50', href: '/pacientes' },
    { label: 'Pacientes activos', value: pacientesActivos ?? 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', href: '/pacientes?estado=activo' },
    { label: 'Citas hoy', value: citasHoy?.length ?? 0, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50', href: '/agenda' },
    { label: 'Sesiones este mes', value: sesionesEsteMes ?? 0, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', href: '/pacientes' },
  ]

// Procesar sesiones por mes
  const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const sesionesPorMes = MESES_CORTOS.map((mes, i) => ({
    mes,
    sesiones: todasLasSesiones?.filter(s => new Date(s.fecha).getMonth() === i).length ?? 0
  }))

  // Procesar pacientes por estado
  const pacientesPorEstado = [
    { estado: 'Activo', cantidad: todosPacientes?.filter(p => p.estado === 'activo').length ?? 0, color: '#22c55e' },
    { estado: 'Alta', cantidad: todosPacientes?.filter(p => p.estado === 'alta').length ?? 0, color: '#3b82f6' },
    { estado: 'Derivado', cantidad: todosPacientes?.filter(p => p.estado === 'derivado').length ?? 0, color: '#f59e0b' },
    { estado: 'Inactivo', cantidad: todosPacientes?.filter(p => p.estado === 'inactivo').length ?? 0, color: '#9ca3af' },
  ]

  const fechaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de control</h1>
          <p className="text-gray-500 text-sm mt-0.5 capitalize">{fechaHoy}</p>
        </div>
        <Link href="/pacientes/nuevo" className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Nuevo paciente
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {estadisticas.map(stat => (
          <Link key={stat.label} href={stat.href} className="card p-5 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Citas de hoy */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Citas de hoy</h2>
            <Link href="/agenda" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver agenda →</Link>
          </div>
          {citasHoy && citasHoy.length > 0 ? (
            <div className="space-y-3">
              {citasHoy.map((cita: Cita & { pacientes?: { nombre: string; apellido: string } }) => (
                <div key={cita.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center min-w-[48px]">
                    <p className="text-sm font-bold text-primary-700">{formatearHora(cita.hora_inicio)}</p>
                    <p className="text-xs text-gray-400">{formatearHora(cita.hora_fin)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{cita.titulo}</p>
                    {cita.pacientes && (
                      <p className="text-xs text-gray-500">{cita.pacientes.nombre} {cita.pacientes.apellido}</p>
                    )}
                  </div>
                  <span className={`badge ${ESTADO_CITA_COLORS[cita.estado]}`}>{ESTADO_CITA_LABELS[cita.estado]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Sin citas para hoy</p>
              <Link href="/agenda/nueva" className="text-xs text-primary-600 hover:underline mt-1 inline-block">Agendar una cita</Link>
            </div>
          )}
        </div>

        {/* Últimos pacientes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pacientes recientes</h2>
            <Link href="/pacientes" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos →</Link>
          </div>
          {ultimosPacientes && ultimosPacientes.length > 0 ? (
            <div className="space-y-2">
              {ultimosPacientes.map((p) => (
                <Link key={p.id} href={`/pacientes/${p.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-700">{p.nombre[0]}{p.apellido[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 truncate">{p.nombre} {p.apellido}</p>
                  <p className="text-xs text-gray-400">{formatearFecha(p.created_at.split('T')[0])}</p>                  </div>
                  <span className={`badge ${p.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.estado}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Sin pacientes aún</p>
              <Link href="/pacientes/nuevo" className="text-xs text-primary-600 hover:underline mt-1 inline-block">Agregar primer paciente</Link>
            </div>
          )}
        </div>
      </div>

      {/* Próximas citas */}
      {proximasCitas && proximasCitas.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Próximas citas</h2>
            <Link href="/agenda" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver agenda →</Link>
          </div>
          <div className="space-y-2">
            {proximasCitas.map((cita: Cita & { pacientes?: { nombre: string; apellido: string } }) => (
              <div key={cita.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className="min-w-[90px] text-center bg-primary-50 rounded-lg py-1.5 px-2">
                  <p className="text-xs text-primary-500 font-medium">{formatearFecha(cita.fecha)}</p>
                  <p className="text-sm font-bold text-primary-700">{formatearHora(cita.hora_inicio)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{cita.titulo}</p>
                  {cita.pacientes && <p className="text-xs text-gray-500">{cita.pacientes.nombre} {cita.pacientes.apellido}</p>}
                </div>
                <span className={`badge ${ESTADO_CITA_COLORS[cita.estado]}`}>{ESTADO_CITA_LABELS[cita.estado]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <GraficosSesiones sesionesPorMes={sesionesPorMes} pacientesPorEstado={pacientesPorEstado} />
    </div>
  )
}

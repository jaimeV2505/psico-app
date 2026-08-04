import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Printer, Phone, Mail, MapPin,
  User, FileText, AlertCircle, Clock
} from 'lucide-react'
import {
  formatearFecha, calcularEdad, ESTADO_PACIENTE_COLORS, ESTADO_PACIENTE_LABELS,
  GENERO_LABELS
} from '@/lib/utils'
import type { Evolucion } from '@/types'
import DeletePacienteButton from '@/components/pacientes/DeletePacienteButton'
import AgregarEvolucionModal from '@/components/pacientes/AgregarEvolucionModal'
import { getNombreCIE10, getColorCIE10 } from '@/lib/cie10'

export default async function PacienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .eq('profesional_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!paciente) notFound()

  const { data: evoluciones } = await supabase
    .from('evoluciones')
    .select('*')
    .eq('paciente_id', id)
    .order('fecha', { ascending: false })

  const { data: proximasCitas } = await supabase
    .from('citas')
    .select('*')
    .eq('paciente_id', id)
    .gte('fecha', new Date().toISOString().split('T')[0])
    .order('fecha')
    .limit(3)

  const TextBlock = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div>
        <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</dt>
        <dd className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">{value}</dd>
      </div>
    ) : null

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div>
        <dt className="text-xs text-gray-400 font-medium">{label}</dt>
        <dd className="text-sm text-gray-900 mt-0.5">{value}</dd>
      </div>
    ) : null

  const diagnosticoColor = paciente.diagnostico_cie10 ? getColorCIE10(paciente.diagnostico_cie10) : null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/pacientes" className="btn-secondary py-2 px-3">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary-700">{paciente.nombre[0]}{paciente.apellido[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{paciente.nombre} {paciente.apellido}</h1>
                <span className={`badge ${ESTADO_PACIENTE_COLORS[paciente.estado]}`}>{ESTADO_PACIENTE_LABELS[paciente.estado]}</span>
                {paciente.diagnostico_cie10 && diagnosticoColor && (
                  <span className={`badge ${diagnosticoColor.bg} ${diagnosticoColor.text}`}>
                    {paciente.diagnostico_cie10} — {getNombreCIE10(paciente.diagnostico_cie10)}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                {paciente.fecha_nacimiento ? `${calcularEdad(paciente.fecha_nacimiento)} años` : ''}
                {paciente.obra_social ? ` · ${paciente.obra_social}` : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/pacientes/${id}/imprimir`} target="_blank" className="btn-secondary py-2 px-3">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </Link>
          <Link href={`/pacientes/${id}/editar`} className="btn-secondary py-2 px-3">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Editar</span>
          </Link>
          <DeletePacienteButton pacienteId={id} nombre={`${paciente.nombre} ${paciente.apellido}`} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Datos personales */}
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2"><User className="w-3.5 h-3.5" />Datos personales</h2>
            <dl className="space-y-3">
              <InfoRow label="DNI" value={paciente.dni} />
              <InfoRow label="Fecha de nacimiento" value={paciente.fecha_nacimiento ? `${formatearFecha(paciente.fecha_nacimiento)} (${calcularEdad(paciente.fecha_nacimiento)} años)` : null} />
              <InfoRow label="Género" value={paciente.genero ? GENERO_LABELS[paciente.genero] : null} />
              <InfoRow label="Ocupación" value={paciente.ocupacion} />
              <InfoRow label="Obra social" value={paciente.obra_social} />
              <InfoRow label="N° de afiliado" value={paciente.numero_afiliado} />
            </dl>
          </div>

          {/* Contacto */}
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2"><Phone className="w-3.5 h-3.5" />Contacto</h2>
            <div className="space-y-2">
              {paciente.telefono && (
                <a href={`tel:${paciente.telefono}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                  <Phone className="w-4 h-4 text-gray-400" />{paciente.telefono}
                </a>
              )}
              {paciente.email && (
                <a href={`mailto:${paciente.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                  <Mail className="w-4 h-4 text-gray-400" />{paciente.email}
                </a>
              )}
              {paciente.direccion && (
                <p className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />{paciente.direccion}
                </p>
              )}
            </div>
          </div>

          {/* Emergencia */}
          {paciente.contacto_emergencia_nombre && (
            <div className="card p-5">
              <h2 className="section-title flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" />Emergencia</h2>
              <dl className="space-y-2">
                <InfoRow label="Nombre" value={paciente.contacto_emergencia_nombre} />
                <InfoRow label="Teléfono" value={paciente.contacto_emergencia_telefono} />
                <InfoRow label="Relación" value={paciente.contacto_emergencia_relacion} />
              </dl>
            </div>
          )}

          {/* Próximas citas */}
          {proximasCitas && proximasCitas.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title flex items-center gap-2"><Clock className="w-3.5 h-3.5" />Próximas citas</h2>
              <div className="space-y-2">
                {proximasCitas.map(cita => (
                  <div key={cita.id} className="text-sm bg-primary-50 rounded-lg p-2.5">
                    <p className="font-medium text-primary-900">{formatearFecha(cita.fecha)}</p>
                    <p className="text-primary-700 text-xs">{cita.hora_inicio?.slice(0,5)} — {cita.hora_fin?.slice(0,5)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Historia clínica */}
          <div className="card p-6">
            <h2 className="section-title flex items-center gap-2"><FileText className="w-3.5 h-3.5" />Historia clínica</h2>
            <dl className="space-y-4">
              {paciente.diagnostico_cie10 && diagnosticoColor && (
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Diagnóstico CIE-10</dt>
                  <dd className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${diagnosticoColor.bg} ${diagnosticoColor.text}`}>
                      {paciente.diagnostico_cie10}
                    </span>
                    <span className="text-sm text-gray-700">{getNombreCIE10(paciente.diagnostico_cie10)}</span>
                  </dd>
                </div>
              )}
              <TextBlock label="Motivo de consulta" value={paciente.motivo_consulta} />
              <TextBlock label="Enfermedad actual" value={paciente.enfermedad_actual} />
              <TextBlock label="Examen psicosemiológico" value={paciente.examen_psicosemiologico} />
              <TextBlock label="Antecedentes personales" value={paciente.antecedentes_personales} />
              <TextBlock label="Antecedentes familiares" value={paciente.antecedentes_familiares} />
              <TextBlock label="Tratamientos previos" value={paciente.tratamientos_previos} />
              <TextBlock label="Indicaciones" value={paciente.indicaciones} />
              <TextBlock label="Objetivos terapéuticos" value={paciente.objetivos_terapeuticos} />
            </dl>
          </div>

          {/* Evoluciones - Timeline */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">Evoluciones {evoluciones && evoluciones.length > 0 && <span className="text-gray-400 font-normal">({evoluciones.length})</span>}</h2>
              <AgregarEvolucionModal pacienteId={id} profesionalId={user.id} />
            </div>

            {evoluciones && evoluciones.length > 0 ? (
              <div className="relative">
                {/* Línea vertical del timeline */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-100 to-transparent" />

                <div className="space-y-6">
                  {evoluciones.map((ev: Evolucion, index) => {
                    const color = ev.diagnostico_cie10
                      ? getColorCIE10(ev.diagnostico_cie10)
                      : { bg: 'bg-primary-100', text: 'text-primary-800', dot: 'bg-primary-400' }

                    return (
                      <div key={ev.id} className="relative pl-12">
                        {/* Punto del timeline */}
                        <div className={`absolute left-0 top-3 w-8 h-8 rounded-full ${color.bg} border-2 border-white shadow-md flex items-center justify-center z-10`}>
                          <div className={`w-3 h-3 rounded-full ${color.dot}`} />
                        </div>

                        {/* Número */}
                        <div className="absolute -left-1 top-0 w-10 text-center">
                          <span className="text-xs text-gray-400 font-medium">{evoluciones.length - index}</span>
                        </div>

                        {/* Card */}
                        <div className="card p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-800">{formatearFecha(ev.fecha)}</span>
                              {index === 0 && (
                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">Última</span>
                              )}
                            </div>
                            {ev.diagnostico_cie10 && (
                              <span className={`badge ${color.bg} ${color.text}`}>
                                {ev.diagnostico_cie10} — {getNombreCIE10(ev.diagnostico_cie10)}
                              </span>
                            )}
                          </div>

                          <div className="space-y-3">
                            {ev.evolucion && (
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Evolución</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ev.evolucion}</p>
                              </div>
                            )}
                            {ev.examen_psicosemiologico && (
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Examen psicosemiológico</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ev.examen_psicosemiologico}</p>
                              </div>
                            )}
                            {ev.indicaciones && (
                              <div className="bg-primary-50 rounded-lg p-3 border border-primary-100">
                                <p className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-1">Indicaciones</p>
                                <p className="text-sm text-primary-800 whitespace-pre-wrap leading-relaxed">{ev.indicaciones}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Sin evoluciones registradas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Printer, Plus, Phone, Mail, MapPin,
  Calendar, User, FileText, AlertCircle, Clock
} from 'lucide-react'
import {
  formatearFecha, calcularEdad, ESTADO_PACIENTE_COLORS, ESTADO_PACIENTE_LABELS,
  GENERO_LABELS
} from '@/lib/utils'
import type { Evolucion } from '@/types'
import DeletePacienteButton from '@/components/pacientes/DeletePacienteButton'
import AgregarEvolucionModal from '@/components/pacientes/AgregarEvolucionModal'
import { getNombreCIE10 } from '@/lib/cie10'

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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{paciente.nombre} {paciente.apellido}</h1>
                <span className={`badge ${ESTADO_PACIENTE_COLORS[paciente.estado]}`}>{ESTADO_PACIENTE_LABELS[paciente.estado]}</span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                {paciente.fecha_nacimiento ? `${calcularEdad(paciente.fecha_nacimiento)} años` : ''}
                {paciente.diagnostico_cie10 ? ` · ${paciente.diagnostico_cie10} — ${getNombreCIE10(paciente.diagnostico_cie10)}` : ''}
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
              {paciente.diagnostico_cie10 && (
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Diagnóstico CIE-10</dt>
                  <dd className="flex items-center gap-2">
                    <span className="badge bg-primary-100 text-primary-800">{paciente.diagnostico_cie10}</span>
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

          {/* Evoluciones */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Evoluciones</h2>
              <AgregarEvolucionModal pacienteId={id} profesionalId={user.id} />
            </div>
            {evoluciones && evoluciones.length > 0 ? (
              <div className="space-y-4">
                {evoluciones.map((ev: Evolucion) => (
                  <div key={ev.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                      <span className="text-sm font-bold text-gray-800">{formatearFecha(ev.fecha)}</span>
                      {ev.diagnostico_cie10 && (
                        <span className="badge bg-primary-100 text-primary-800">
                          {ev.diagnostico_cie10} — {getNombreCIE10(ev.diagnostico_cie10)}
                        </span>
                      )}
                    </div>
                    {ev.evolucion && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Evolución</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ev.evolucion}</p>
                      </div>
                    )}
                    {ev.examen_psicosemiologico && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Examen psicosemiológico</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ev.examen_psicosemiologico}</p>
                      </div>
                    )}
                    {ev.indicaciones && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Indicaciones</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ev.indicaciones}</p>
                      </div>
                    )}
                  </div>
                ))}
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
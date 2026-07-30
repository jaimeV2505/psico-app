import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Printer, Plus, Phone, Mail, MapPin,
  Calendar, User, FileText, AlertCircle, Clock
} from 'lucide-react'
import {
  formatearFecha, calcularEdad, ESTADO_PACIENTE_COLORS, ESTADO_PACIENTE_LABELS,
  GENERO_LABELS, ESTADO_CIVIL_LABELS, NIVEL_EDUCATIVO_LABELS,
  ESTADO_EMOCIONAL_EMOJI, ESTADO_EMOCIONAL_LABELS
} from '@/lib/utils'
import type { Sesion } from '@/types'
import DeletePacienteButton from '@/components/pacientes/DeletePacienteButton'

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

  const { data: sesiones } = await supabase
    .from('sesiones')
    .select('*')
    .eq('paciente_id', id)
    .order('fecha', { ascending: false })
    .limit(10)

  const { data: proximasCitas } = await supabase
    .from('citas')
    .select('*')
    .eq('paciente_id', id)
    .gte('fecha', new Date().toISOString().split('T')[0])
    .order('fecha')
    .limit(3)

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div>
        <dt className="text-xs text-gray-400 font-medium">{label}</dt>
        <dd className="text-sm text-gray-900 mt-0.5">{value}</dd>
      </div>
    ) : null

  const TextBlock = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div>
        <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</dt>
        <dd className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">{value}</dd>
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
                {paciente.diagnostico_descripcion ? ` · ${paciente.diagnostico_descripcion.slice(0, 60)}...` : ''}
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
              <InfoRow label="DNI / Cédula" value={paciente.dni} />
              <InfoRow label="Fecha de nacimiento" value={paciente.fecha_nacimiento ? `${formatearFecha(paciente.fecha_nacimiento)} (${calcularEdad(paciente.fecha_nacimiento)} años)` : null} />
              <InfoRow label="Género" value={paciente.genero ? GENERO_LABELS[paciente.genero] : null} />
              <InfoRow label="Estado civil" value={paciente.estado_civil ? ESTADO_CIVIL_LABELS[paciente.estado_civil] : null} />
              <InfoRow label="Ocupación" value={paciente.ocupacion} />
              <InfoRow label="Nivel educativo" value={paciente.nivel_educativo ? NIVEL_EDUCATIVO_LABELS[paciente.nivel_educativo] : null} />
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
              {(paciente.direccion || paciente.ciudad) && (
                <p className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  {[paciente.direccion, paciente.ciudad].filter(Boolean).join(', ')}
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

          {/* Tratamiento */}
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />Tratamiento</h2>
            <dl className="space-y-2">
              <InfoRow label="Inicio" value={paciente.fecha_inicio_tratamiento ? formatearFecha(paciente.fecha_inicio_tratamiento) : null} />
              <InfoRow label="Sesiones realizadas" value={sesiones ? `${sesiones.length}` : '0'} />
            </dl>
          </div>

          {/* Próximas citas */}
          {proximasCitas && proximasCitas.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title flex items-center gap-2"><Clock className="w-3.5 h-3.5" />Próximas citas</h2>
              <div className="space-y-2">
                {proximasCitas.map(cita => (
                  <div key={cita.id} className="text-sm bg-blue-50 rounded-lg p-2.5">
                    <p className="font-medium text-blue-900">{formatearFecha(cita.fecha)}</p>
                    <p className="text-blue-700 text-xs">{cita.hora_inicio?.slice(0,5)} — {cita.hora_fin?.slice(0,5)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column (historia clínica + sesiones) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Historia clínica */}
          <div className="card p-6">
            <h2 className="section-title flex items-center gap-2"><FileText className="w-3.5 h-3.5" />Historia clínica</h2>
            <dl className="space-y-4">
              {(paciente.diagnostico_cie || paciente.diagnostico_dsm) && (
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Diagnóstico</dt>
                  <dd className="flex gap-2 flex-wrap">
                    {paciente.diagnostico_cie && <span className="badge bg-purple-100 text-purple-800">CIE: {paciente.diagnostico_cie}</span>}
                    {paciente.diagnostico_dsm && <span className="badge bg-indigo-100 text-indigo-800">DSM: {paciente.diagnostico_dsm}</span>}
                  </dd>
                </div>
              )}
              <TextBlock label="Motivo de consulta" value={paciente.motivo_consulta} />
              <TextBlock label="Descripción diagnóstica" value={paciente.diagnostico_descripcion} />
              <TextBlock label="Antecedentes personales" value={paciente.antecedentes_personales} />
              <TextBlock label="Antecedentes familiares" value={paciente.antecedentes_familiares} />
              <TextBlock label="Tratamientos previos" value={paciente.tratamientos_previos} />
              <TextBlock label="Medicación actual" value={paciente.medicacion_actual} />
              <TextBlock label="Alergias" value={paciente.alergias} />
              <TextBlock label="Observaciones iniciales" value={paciente.observaciones_iniciales} />
              <TextBlock label="Objetivos terapéuticos" value={paciente.objetivos_terapeuticos} />
            </dl>
          </div>

          {/* Sesiones */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Últimas sesiones</h2>
              <Link href={`/pacientes/${id}/sesiones/nueva`} className="btn-primary py-1.5 px-3 text-sm">
                <Plus className="w-3.5 h-3.5" />
                Registrar sesión
              </Link>
            </div>
            {sesiones && sesiones.length > 0 ? (
              <div className="space-y-3">
                {sesiones.map((sesion: Sesion) => (
                  <div key={sesion.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                          Sesión #{sesion.numero_sesion}
                        </span>
                        <span className="text-sm text-gray-500">{formatearFecha(sesion.fecha)}</span>
                        {sesion.estado_emocional && (
                          <span className="text-sm" title={ESTADO_EMOCIONAL_LABELS[sesion.estado_emocional]}>
                            {ESTADO_EMOCIONAL_EMOJI[sesion.estado_emocional]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{sesion.duracion_min} min</span>
                        <span className={`badge ${sesion.modalidad === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {sesion.modalidad}
                        </span>
                        <Link href={`/pacientes/${id}/sesiones/${sesion.id}`} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                          Ver →
                        </Link>
                      </div>
                    </div>
                    {sesion.contenido && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{sesion.contenido}</p>
                    )}
                  </div>
                ))}
                <Link href={`/pacientes/${id}/sesiones`} className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium pt-2">
                  Ver todas las sesiones →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Sin sesiones registradas</p>
                <Link href={`/pacientes/${id}/sesiones/nueva`} className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                  Registrar primera sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import {
  formatearFecha, calcularEdad, GENERO_LABELS, ESTADO_CIVIL_LABELS,
  NIVEL_EDUCATIVO_LABELS, ESTADO_PACIENTE_LABELS, ESTADO_EMOCIONAL_EMOJI, ESTADO_EMOCIONAL_LABELS
} from '@/lib/utils'
import PrintButton from '@/components/pacientes/PrintButton'

export default async function ImprimirPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: paciente } = await supabase.from('pacientes').select('*').eq('id', id).eq('profesional_id', user.id).single()
  if (!paciente) notFound()

  const { data: sesiones } = await supabase.from('sesiones').select('*').eq('paciente_id', id).order('numero_sesion')
  const { data: profesional } = await supabase.from('profesionales').select('*').eq('id', user.id).single()

  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  const Seccion = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-3">{titulo}</h3>
      {children}
    </div>
  )

  const Campo = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div className="mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}: </span>
        <span className="text-sm text-gray-900">{value}</span>
      </div>
    ) : null

  const CampoBloque = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div className="mb-3">
        <p className="text-xs text-gray-500 font-medium mb-1">{label}:</p>
        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-gray-200">{value}</p>
      </div>
    ) : null

  return (
    <>
      <div className="no-print fixed top-4 right-4 z-10 flex gap-2">
        <PrintButton />
        <a href={`/pacientes/${id}`} className="btn-secondary py-2 px-4 text-sm">← Volver</a>
      </div>

      <div id="print-content" className="max-w-3xl mx-auto py-8 px-6 print:p-0 print:max-w-none font-sans">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historia Clínica</h1>
            <p className="text-gray-500 text-sm mt-1">Documento confidencial — uso exclusivo profesional</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p className="font-semibold text-gray-900">{profesional?.nombre} {profesional?.apellido}</p>
            {profesional?.especialidad && <p>{profesional.especialidad}</p>}
            {profesional?.matricula && <p>Mat. {profesional.matricula}</p>}
            <p className="mt-1">Emitido: {fecha}</p>
          </div>
        </div>

        {/* Paciente */}
        <div className="flex items-center gap-4 mb-8 bg-gray-50 rounded-xl p-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-gray-600">{paciente.nombre[0]}{paciente.apellido[0]}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{paciente.nombre} {paciente.apellido}</h2>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
              {paciente.fecha_nacimiento && <span>{formatearFecha(paciente.fecha_nacimiento)} · {calcularEdad(paciente.fecha_nacimiento)} años</span>}
              {paciente.dni && <span>DNI: {paciente.dni}</span>}
              <span>Estado: {ESTADO_PACIENTE_LABELS[paciente.estado]}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <Seccion titulo="Datos personales">
            <Campo label="Género" value={paciente.genero ? GENERO_LABELS[paciente.genero] : null} />
            <Campo label="Estado civil" value={paciente.estado_civil ? ESTADO_CIVIL_LABELS[paciente.estado_civil] : null} />
            <Campo label="Ocupación" value={paciente.ocupacion} />
            <Campo label="Nivel educativo" value={paciente.nivel_educativo ? NIVEL_EDUCATIVO_LABELS[paciente.nivel_educativo] : null} />
          </Seccion>
          <Seccion titulo="Contacto">
            <Campo label="Teléfono" value={paciente.telefono} />
            <Campo label="Email" value={paciente.email} />
            <Campo label="Dirección" value={paciente.direccion} />
            <Campo label="Ciudad" value={paciente.ciudad} />
          </Seccion>
        </div>

        {paciente.contacto_emergencia_nombre && (
          <Seccion titulo="Contacto de emergencia">
            <div className="grid grid-cols-3 gap-4">
              <Campo label="Nombre" value={paciente.contacto_emergencia_nombre} />
              <Campo label="Teléfono" value={paciente.contacto_emergencia_telefono} />
              <Campo label="Relación" value={paciente.contacto_emergencia_relacion} />
            </div>
          </Seccion>
        )}

        <Seccion titulo="Historia clínica">
          {(paciente.diagnostico_cie || paciente.diagnostico_dsm) && (
            <div className="mb-2 flex gap-3">
              {paciente.diagnostico_cie && <Campo label="CIE-11" value={paciente.diagnostico_cie} />}
              {paciente.diagnostico_dsm && <Campo label="DSM-5" value={paciente.diagnostico_dsm} />}
            </div>
          )}
          <CampoBloque label="Motivo de consulta" value={paciente.motivo_consulta} />
          <CampoBloque label="Descripción diagnóstica" value={paciente.diagnostico_descripcion} />
          <CampoBloque label="Antecedentes personales" value={paciente.antecedentes_personales} />
          <CampoBloque label="Antecedentes familiares" value={paciente.antecedentes_familiares} />
          <CampoBloque label="Tratamientos previos" value={paciente.tratamientos_previos} />
          <CampoBloque label="Medicación actual" value={paciente.medicacion_actual} />
          <CampoBloque label="Alergias" value={paciente.alergias} />
          <CampoBloque label="Observaciones iniciales" value={paciente.observaciones_iniciales} />
        </Seccion>

        <Seccion titulo="Plan terapéutico">
          <Campo label="Inicio del tratamiento" value={paciente.fecha_inicio_tratamiento ? formatearFecha(paciente.fecha_inicio_tratamiento) : null} />
          <CampoBloque label="Objetivos terapéuticos" value={paciente.objetivos_terapeuticos} />
        </Seccion>

        {/* Sesiones */}
        {sesiones && sesiones.length > 0 && (
          <Seccion titulo={`Registro de sesiones (${sesiones.length} total)`}>
            <div className="space-y-4">
              {sesiones.map(s => (
                <div key={s.id} className="border border-gray-200 rounded-lg p-4 break-inside-avoid">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-800">Sesión #{s.numero_sesion} — {formatearFecha(s.fecha)}</span>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {s.estado_emocional && <span>{ESTADO_EMOCIONAL_EMOJI[s.estado_emocional]} {ESTADO_EMOCIONAL_LABELS[s.estado_emocional]}</span>}
                      <span>{s.duracion_min} min · {s.modalidad}</span>
                    </div>
                  </div>
                  {s.contenido && <CampoBloque label="Contenido" value={s.contenido} />}
                  {s.avances && <CampoBloque label="Avances" value={s.avances} />}
                  {s.tareas_asignadas && <CampoBloque label="Tareas" value={s.tareas_asignadas} />}
                  {s.proximos_objetivos && <CampoBloque label="Próximos objetivos" value={s.proximos_objetivos} />}
                </div>
              ))}
            </div>
          </Seccion>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Historia clínica confidencial — {profesional?.nombre} {profesional?.apellido} {profesional?.matricula ? `· Mat. ${profesional.matricula}` : ''}</p>
          <p className="mt-1">Generado el {fecha} mediante PsicoApp</p>
        </div>
      </div>
    </>
  )
}

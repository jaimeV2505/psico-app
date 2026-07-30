export type Genero = 'masculino' | 'femenino' | 'no_binario' | 'otro' | 'prefiero_no_decir'
export type EstadoCivil = 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_libre' | 'separado'
export type NivelEducativo = 'sin_estudios' | 'primaria' | 'secundaria' | 'tecnico' | 'universitario' | 'posgrado'
export type EstadoPaciente = 'activo' | 'alta' | 'derivado' | 'inactivo'
export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'realizada' | 'no_asistio'
export type ModalidadCita = 'presencial' | 'online'
export type EstadoEmocional = 'muy_mal' | 'mal' | 'regular' | 'bien' | 'muy_bien'
export type TipoSesion = 'individual' | 'pareja' | 'familiar' | 'grupo'

export interface Profesional {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  especialidad?: string
  matricula?: string
  created_at: string
  updated_at: string
}

export interface Paciente {
  id: string
  profesional_id: string
  nombre: string
  apellido: string
  dni?: string
  fecha_nacimiento?: string
  genero?: Genero
  estado_civil?: EstadoCivil
  ocupacion?: string
  nivel_educativo?: NivelEducativo
  telefono?: string
  email?: string
  direccion?: string
  ciudad?: string
  contacto_emergencia_nombre?: string
  contacto_emergencia_telefono?: string
  contacto_emergencia_relacion?: string
  motivo_consulta?: string
  diagnostico_cie?: string
  diagnostico_dsm?: string
  diagnostico_descripcion?: string
  antecedentes_personales?: string
  antecedentes_familiares?: string
  tratamientos_previos?: string
  medicacion_actual?: string
  alergias?: string
  observaciones_iniciales?: string
  fecha_inicio_tratamiento?: string
  estado: EstadoPaciente
  objetivos_terapeuticos?: string
  created_at: string
  updated_at: string
  // joined
  sesiones?: Sesion[]
  citas?: Cita[]
  _count?: { sesiones: number }
}

export interface Sesion {
  id: string
  paciente_id: string
  profesional_id: string
  numero_sesion?: number
  fecha: string
  duracion_min?: number
  estado_emocional?: EstadoEmocional
  contenido?: string
  avances?: string
  tareas_asignadas?: string
  proximos_objetivos?: string
  tipo: TipoSesion
  modalidad: ModalidadCita
  created_at: string
  updated_at: string
  pacientes?: Pick<Paciente, 'id' | 'nombre' | 'apellido'>
}

export interface Cita {
  id: string
  paciente_id?: string
  profesional_id: string
  titulo: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: EstadoCita
  modalidad: ModalidadCita
  notas?: string
  created_at: string
  updated_at: string
  pacientes?: Pick<Paciente, 'id' | 'nombre' | 'apellido'>
}

export interface PacienteFilters {
  busqueda?: string
  estado?: EstadoPaciente | ''
  genero?: Genero | ''
  ciudad?: string
}

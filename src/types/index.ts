export type Genero = 'masculino' | 'femenino' | 'no_binario' | 'otro' | 'prefiero_no_decir'
export type EstadoPaciente = 'activo' | 'alta' | 'derivado' | 'inactivo'
export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'realizada' | 'no_asistio'
export type ModalidadCita = 'presencial' | 'online'

export interface Profesional {
  id: string
  nombre: string
  apellido: string
  email: string
  especialidad?: string
  matricula_nacional?: string
  matricula_provincial?: string
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
  ocupacion?: string
  telefono?: string
  email?: string
  direccion?: string
  obra_social?: string
  numero_afiliado?: string
  contacto_emergencia_nombre?: string
  contacto_emergencia_telefono?: string
  contacto_emergencia_relacion?: string
  motivo_consulta?: string
  enfermedad_actual?: string
  examen_psicosemiologico?: string
  diagnostico_cie10?: string
  antecedentes_personales?: string
  antecedentes_familiares?: string
  tratamientos_previos?: string
  indicaciones?: string
  objetivos_terapeuticos?: string
  fecha_inicio_tratamiento?: string
  estado: EstadoPaciente
  deleted_at?: string
  created_at: string
  updated_at: string
  evoluciones?: Evolucion[]
  citas?: Cita[]
}

export interface Evolucion {
  id: string
  paciente_id: string
  profesional_id: string
  fecha: string
  evolucion?: string
  examen_psicosemiologico?: string
  diagnostico_cie10?: string
  indicaciones?: string
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
}
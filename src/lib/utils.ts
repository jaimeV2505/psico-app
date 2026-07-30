import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const m = hoy.getMonth() - nacimiento.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

export function formatearFecha(fecha: string, opciones?: Intl.DateTimeFormatOptions): string {
  if (!fecha) return '—'
  const opts: Intl.DateTimeFormatOptions = opciones || {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opts)
}

export function formatearHora(hora: string): string {
  if (!hora) return '—'
  return hora.slice(0, 5)
}

export const GENERO_LABELS: Record<string, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  no_binario: 'No binario',
  otro: 'Otro',
  prefiero_no_decir: 'Prefiero no decir',
}

export const ESTADO_CIVIL_LABELS: Record<string, string> = {
  soltero: 'Soltero/a',
  casado: 'Casado/a',
  divorciado: 'Divorciado/a',
  viudo: 'Viudo/a',
  union_libre: 'Unión libre',
  separado: 'Separado/a',
}

export const NIVEL_EDUCATIVO_LABELS: Record<string, string> = {
  sin_estudios: 'Sin estudios',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  tecnico: 'Técnico',
  universitario: 'Universitario',
  posgrado: 'Posgrado',
}

export const ESTADO_PACIENTE_LABELS: Record<string, string> = {
  activo: 'Activo',
  alta: 'Alta',
  derivado: 'Derivado',
  inactivo: 'Inactivo',
}

export const ESTADO_PACIENTE_COLORS: Record<string, string> = {
  activo: 'bg-green-100 text-green-800',
  alta: 'bg-blue-100 text-blue-800',
  derivado: 'bg-yellow-100 text-yellow-800',
  inactivo: 'bg-gray-100 text-gray-600',
}

export const ESTADO_CITA_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  realizada: 'Realizada',
  no_asistio: 'No asistió',
}

export const ESTADO_CITA_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-blue-100 text-blue-800',
  cancelada: 'bg-red-100 text-red-800',
  realizada: 'bg-green-100 text-green-800',
  no_asistio: 'bg-gray-100 text-gray-600',
}

export const ESTADO_EMOCIONAL_LABELS: Record<string, string> = {
  muy_mal: 'Muy mal',
  mal: 'Mal',
  regular: 'Regular',
  bien: 'Bien',
  muy_bien: 'Muy bien',
}

export const ESTADO_EMOCIONAL_EMOJI: Record<string, string> = {
  muy_mal: '😞',
  mal: '😕',
  regular: '😐',
  bien: '🙂',
  muy_bien: '😊',
}

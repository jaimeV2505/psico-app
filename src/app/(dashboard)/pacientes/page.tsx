import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { UserPlus, Search, Filter } from 'lucide-react'
import { formatearFecha, calcularEdad, ESTADO_PACIENTE_COLORS, ESTADO_PACIENTE_LABELS } from '@/lib/utils'
import type { Paciente } from '@/types'

interface SearchParams { busqueda?: string; estado?: string; genero?: string }

export default async function PacientesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('pacientes')
    .select('*, sesiones(count)')
    .eq('profesional_id', user!.id)
    .order('apellido')

  if (params.estado) query = query.eq('estado', params.estado)
  if (params.genero) query = query.eq('genero', params.genero)
  if (params.busqueda) {
    query = query.or(`nombre.ilike.%${params.busqueda}%,apellido.ilike.%${params.busqueda}%,dni.ilike.%${params.busqueda}%,telefono.ilike.%${params.busqueda}%`)
  }

  const { data: pacientes } = await query

  const estados = ['activo', 'alta', 'derivado', 'inactivo']
  const generos = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'no_binario', label: 'No binario' },
    { value: 'otro', label: 'Otro' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pacientes?.length ?? 0} registros</p>
        </div>
        <Link href="/pacientes/nuevo" className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Nuevo paciente
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="busqueda"
              defaultValue={params.busqueda}
              placeholder="Buscar por nombre, DNI, teléfono..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select name="estado" defaultValue={params.estado || ''} className="input-field w-auto">
              <option value="">Todos los estados</option>
              {estados.map(e => <option key={e} value={e}>{ESTADO_PACIENTE_LABELS[e]}</option>)}
            </select>
            <select name="genero" defaultValue={params.genero || ''} className="input-field w-auto">
              <option value="">Todos los géneros</option>
              {generos.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <button type="submit" className="btn-primary px-4">
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
            {(params.busqueda || params.estado || params.genero) && (
              <Link href="/pacientes" className="btn-secondary px-4">Limpiar</Link>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      {pacientes && pacientes.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Paciente</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 hidden sm:table-cell">Edad</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 hidden md:table-cell">Teléfono</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 hidden lg:table-cell">Inicio trat.</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Estado</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pacientes.map((p: Paciente) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-700">{p.nombre[0]}{p.apellido[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.apellido}, {p.nombre}</p>
                          {p.dni && <p className="text-xs text-gray-400">DNI: {p.dni}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{p.fecha_nacimiento ? `${calcularEdad(p.fecha_nacimiento)} años` : '—'}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{p.telefono || '—'}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{p.fecha_inicio_tratamiento ? formatearFecha(p.fecha_inicio_tratamiento) : '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${ESTADO_PACIENTE_COLORS[p.estado]}`}>{ESTADO_PACIENTE_LABELS[p.estado]}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/pacientes/${p.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {params.busqueda || params.estado ? 'Sin resultados' : 'Sin pacientes aún'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {params.busqueda || params.estado ? 'Prueba con otros filtros' : 'Comienza registrando tu primer paciente'}
          </p>
          {!params.busqueda && !params.estado && (
            <Link href="/pacientes/nuevo" className="btn-primary">
              <UserPlus className="w-4 h-4" />
              Agregar paciente
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

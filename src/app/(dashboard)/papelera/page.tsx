import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatearFecha } from '@/lib/utils'
import RestaurarPacienteButton from '@/components/pacientes/RestaurarPacienteButton'
import { Trash2 } from 'lucide-react'

export default async function PapeleraPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido, dni, deleted_at')
    .eq('profesional_id', user.id)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Papelera</h1>
        <p className="text-gray-500 text-sm mt-0.5">Pacientes eliminados — podés restaurarlos en cualquier momento</p>
      </div>

      {pacientes && pacientes.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Paciente</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 hidden sm:table-cell">Eliminado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pacientes.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gray-500">{p.nombre[0]}{p.apellido[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.apellido}, {p.nombre}</p>
                        {p.dni && <p className="text-xs text-gray-400">DNI: {p.dni}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm text-gray-500">{formatearFecha(p.deleted_at.split('T')[0])}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <RestaurarPacienteButton pacienteId={p.id} nombre={`${p.nombre} ${p.apellido}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-16 text-center">
          <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Papelera vacía</h3>
          <p className="text-gray-500 text-sm">Los pacientes eliminados aparecerán aquí</p>
        </div>
      )}
    </div>
  )
}
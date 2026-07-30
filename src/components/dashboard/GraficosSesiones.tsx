'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

interface Props {
  sesionesPorMes: { mes: string; sesiones: number }[]
  pacientesPorEstado: { estado: string; cantidad: number; color: string }[]
}

export default function GraficosSesiones({ sesionesPorMes, pacientesPorEstado }: Props) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Sesiones por mes */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Sesiones por mes</h2>
        {sesionesPorMes.some(m => m.sesiones > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sesionesPorMes} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                formatter={(value) => [`${value} sesiones`, '']}
              />
              <Bar dataKey="sesiones" fill="#4668eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
            Sin sesiones registradas aún
          </div>
        )}
      </div>

      {/* Pacientes por estado */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Pacientes por estado</h2>
        {pacientesPorEstado.some(p => p.cantidad > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
  data={pacientesPorEstado.filter(p => p.cantidad > 0)}
  cx="50%"
  cy="50%"
  innerRadius={60}
  outerRadius={90}
  paddingAngle={3}
  dataKey="cantidad"
  nameKey="estado"
>
                {pacientesPorEstado.filter(p => p.cantidad > 0).map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                formatter={(value, name) => [`${value} pacientes`, name]}
              />
              <Legend
                formatter={(value) => <span style={{ fontSize: '12px', color: '#6b7280' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
            Sin pacientes registrados aún
          </div>
        )}
      </div>
    </div>
  )
}
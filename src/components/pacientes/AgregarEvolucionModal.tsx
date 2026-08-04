'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import EvolucionForm from './EvolucionForm'

interface Props {
  pacienteId: string
  profesionalId: string
}

export default function AgregarEvolucionModal({ pacienteId, profesionalId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary py-1.5 px-3 text-sm">
        <Plus className="w-3.5 h-3.5" />
        Agregar evolución
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Agregar evolución</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <EvolucionForm
                pacienteId={pacienteId}
                profesionalId={profesionalId}
                modo="nuevo"
                onSuccess={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
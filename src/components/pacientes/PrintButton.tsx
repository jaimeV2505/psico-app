'use client'
import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-primary py-2 px-4 text-sm">
      <Printer className="w-4 h-4" />
      Imprimir / Guardar PDF
    </button>
  )
}

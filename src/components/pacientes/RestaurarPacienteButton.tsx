'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RotateCcw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props { pacienteId: string; nombre: string }

export default function RestaurarPacienteButton({ pacienteId, nombre }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRestore() {
    if (!confirm(`¿Restaurar a ${nombre}?`)) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('pacientes')
      .update({ deleted_at: null })
      .eq('id', pacienteId)
    if (error) { toast.error(error.message); setLoading(false) }
    else { toast.success('Paciente restaurado'); router.refresh() }
  }

  return (
    <button onClick={handleRestore} disabled={loading} className="btn-secondary py-1.5 px-3 text-sm">
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
      Restaurar
    </button>
  )
}

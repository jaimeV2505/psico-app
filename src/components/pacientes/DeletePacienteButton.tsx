'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props { pacienteId: string; nombre: string }

export default function DeletePacienteButton({ pacienteId, nombre }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`¿Eliminar a ${nombre}? Podrás recuperarlo desde la papelera.`)) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('pacientes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', pacienteId)
    if (error) { toast.error(error.message); setLoading(false) }
    else { toast.success('Paciente eliminado'); router.push('/pacientes'); router.refresh() }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-danger py-2 px-3">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      <span className="hidden sm:inline">Eliminar</span>
    </button>
  )
}
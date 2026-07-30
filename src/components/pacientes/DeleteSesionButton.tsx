'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DeleteSesionButton({ sesionId, pacienteId }: { sesionId: string; pacienteId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('¿Eliminar esta sesión? No se puede deshacer.')) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('sesiones').delete().eq('id', sesionId)
    if (error) { toast.error(error.message); setLoading(false) }
    else { toast.success('Sesión eliminada'); router.push(`/pacientes/${pacienteId}/sesiones`); router.refresh() }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-danger py-2 px-3">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}

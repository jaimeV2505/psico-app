import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import type { Profesional } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profesional } = await supabase
    .from('profesionales')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profesional) redirect('/auth/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar profesional={profesional as Profesional} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}

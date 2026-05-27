import { redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import AppSidebar from '@/src/components/layout/AppSidebar'
import TopBar from '@/src/components/layout/TopBar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0F172A' }}>
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/app/admin/_components/AdminSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
      <AdminSidebar username={session.username} />
      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}

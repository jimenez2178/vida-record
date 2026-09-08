import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from '@/components/layout/SidebarNav'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'home' },
  { href: '/historial', label: 'Historial', icon: 'calendar' },
  { href: '/citas', label: 'Citas', icon: 'building' },
  { href: '/medicamentos', label: 'Medicamentos', icon: 'pill' },
  { href: '/estudios', label: 'Estudios', icon: 'beaker' },
  { href: '/indicadores', label: 'Indicadores', icon: 'chart' },
  { href: '/medicos', label: 'Médicos', icon: 'stethoscope' },
  { href: '/resumen-pdf', label: 'Resumen PDF', icon: 'document' },
] as const

const mobileNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'home' },
  { href: '/citas', label: 'Citas', icon: 'building' },
  { href: '/medicamentos', label: 'Medicamentos', icon: 'pill' },
  { href: '/estudios', label: 'Estudios', icon: 'beaker' },
  { href: '/configuracion', label: 'Config', icon: 'settings' },
] as const

type IconName =
  | 'home'
  | 'calendar'
  | 'building'
  | 'pill'
  | 'beaker'
  | 'chart'
  | 'stethoscope'
  | 'document'
  | 'settings'
  | 'logout'
  | 'heart'

function Icon({
  name,
  className = 'w-5 h-5',
}: {
  name: IconName
  className?: string
}) {
  const paths: Record<IconName, React.ReactNode> = {
    heart: (
      <path d="M12 21s-6.716-4.35-9.428-8.243C.29 9.516 1.13 5.6 4.5 4.257c2.02-.805 4.14-.09 5.5 1.53C11.36 4.167 13.48 3.452 15.5 4.257c3.37 1.343 4.21 5.259 1.928 8.5C18.716 16.65 12 21 12 21z" />
    ),
    home: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 21v-8.25a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25V21M3 9.75L12 3l9 6.75V19.5a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5V9.75z"
      />
    ),
    calendar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3.75 18.75V7.5a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v11.25m-16.5 0A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25m-16.5 0V11.25A2.25 2.25 0 016 9h12a2.25 2.25 0 012.25 2.25v7.5"
      />
    ),
    building: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 21V4.5A1.5 1.5 0 016 3h3.75a1.5 1.5 0 011.5 1.5V21m3.75 0V9.75a1.5 1.5 0 011.5-1.5h3.75a1.5 1.5 0 011.5 1.5V21M9 6.75h.008v.008H9V6.75zm0 3h.008v.008H9v-3zm0 3h.008v.008H9v-3zm3.75 3h.008v.008h-.008V15.75zm0 3h.008v.008h-.008V18.75z"
      />
    ),
    pill: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l7.5-7.5a3.182 3.182 0 014.5 4.5l-7.5 7.5a3.182 3.182 0 01-4.5-4.5zM9 8.25l6 6"
      />
    ),
    beaker: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5.106 14.4c-1.6 1.6-.464 4.35 1.804 4.35h10.18c2.268 0 3.404-2.75 1.804-4.35l-3.985-3.99a2.25 2.25 0 01-.659-1.591V3.104M8.25 3.104h7.5"
      />
    ),
    chart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    ),
    stethoscope: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 3.75v4.5a3 3 0 003 3v0a3 3 0 003-3v-4.5M9 15v-3.75M9 15a4.5 4.5 0 004.5 4.5v0A4.5 4.5 0 0018 15v-1.5m0 0a2.25 2.25 0 10-2.25-2.25c0 1.243 1.007 2.25 2.25 2.25z"
      />
    ),
    document: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 0H6.108c-1.135 0-2.098.847-2.245 1.98A48.424 48.424 0 003.75 12c0 1.153.082 2.287.24 3.395.147 1.133 1.11 1.98 2.245 1.98h.096m10.5-13.395c.53.034 1.058.078 1.583.132.75.075 1.35.68 1.37 1.435.024.926.03 1.849.024 2.766M9 12h6m-6 3h6m-6-6h1.5"
      />
    ),
    settings: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 3.75l.386 1.933a7.48 7.48 0 012.728 1.575l1.897-.633.75 1.3-1.464 1.318a7.53 7.53 0 010 3.155l1.464 1.318-.75 1.3-1.897-.633a7.48 7.48 0 01-2.728 1.575l-.386 1.933h-1.5l-.386-1.933a7.48 7.48 0 01-2.728-1.575l-1.897.633-.75-1.3 1.464-1.318a7.53 7.53 0 010-3.155L3.99 7.925l.75-1.3 1.897.633a7.48 7.48 0 012.728-1.575l.386-1.933h1.5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        />
      </>
    ),
    logout: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3"
      />
    ),
  }

  if (name === 'heart') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        {paths[name]}
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      {paths[name]}
    </svg>
  )
}

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardLayout({
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

  const displayName =
    user.user_metadata?.full_name?.toString() ||
    user.email?.split('@')[0] ||
    'Usuario'

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-blue-900 text-white">
        <div className="flex items-center gap-2 px-6 py-6">
          <Icon name="heart" className="w-7 h-7" />
          <span className="text-xl font-bold">VidaRecord</span>
        </div>

        <SidebarNav
          links={navItems.map((item) => ({
            href: item.href,
            label: item.label,
            icon: <Icon name={item.icon} />,
          }))}
        />

        <div className="px-3 py-4 border-t border-blue-800">
          <p className="px-3 pb-2 text-sm text-white/80 truncate">
            {displayName}
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/90 hover:bg-blue-800 transition-colors"
            >
              <Icon name="logout" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-10 bg-blue-900 text-white flex items-center justify-around py-2">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-white/90 hover:bg-blue-800 transition-colors"
          >
            <Icon name={item.icon} className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">{children}</main>
    </div>
  )
}

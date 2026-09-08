import { createClient } from '@/lib/supabase/server'
import AccountSettings from '@/components/settings/AccountSettings'

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  const [{ data: userRow }, { data: profile }] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, plan, plan_expires_at')
      .eq('id', authUser.id)
      .single(),
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', authUser.id)
      .eq('is_owner', true)
      .single(),
  ])

  if (!userRow || !profile) {
    return (
      <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md mx-auto">
          <p className="text-gray-800 font-semibold mb-2">
            No pudimos cargar tu cuenta
          </p>
          <p className="text-gray-500 text-sm">
            Intenta cerrar sesión y volver a entrar; si el problema persiste,
            contáctanos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
      <AccountSettings user={userRow} profile={profile} />
    </div>
  )
}

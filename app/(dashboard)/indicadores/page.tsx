import { createClient } from '@/lib/supabase/server'
import { getActiveProfileId } from '@/lib/profiles/getActiveProfileId'
import IndicatorsList from '@/components/health-indicators/IndicatorsList'

export default async function IndicadoresPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const profileId = await getActiveProfileId(supabase, user.id)

  if (!profileId) {
    return (
      <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md mx-auto">
          <p className="text-gray-800 font-semibold mb-2">
            No pudimos encontrar tu perfil
          </p>
          <p className="text-gray-500 text-sm">
            Algo salió mal al crear tu perfil médico principal. Intenta
            cerrar sesión y volver a entrar; si el problema persiste,
            contáctanos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
      <IndicatorsList profileId={profileId} userId={user.id} />
    </div>
  )
}

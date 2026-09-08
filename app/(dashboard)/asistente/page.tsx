import { createClient } from '@/lib/supabase/server'
import PremiumGate from '@/components/ui/PremiumGate'
import AssistantChat from '@/components/ai/AssistantChat'

export default async function AsistentePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [{ data: userRow }, { data: profile }] = await Promise.all([
    supabase.from('users').select('plan').eq('id', user.id).single(),
    supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_owner', true)
      .single(),
  ])

  if (userRow?.plan !== 'premium') {
    return (
      <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8 flex items-center justify-center">
        <PremiumGate
          featureName="Asistente IA"
          description="Conversa con un asistente que organiza y explica tu información médica personal."
        />
      </div>
    )
  }

  if (!profile) {
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
      <AssistantChat profileId={profile.id} userId={user.id} />
    </div>
  )
}

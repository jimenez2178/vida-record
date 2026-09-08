import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function PerfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, full_name, date_of_birth, gender, blood_type, allergies, medical_notes, emergency_contact_name, emergency_contact_phone'
    )
    .eq('user_id', user.id)
    .eq('is_owner', true)
    .single()

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
      <ProfileForm profile={profile} />
    </div>
  )
}

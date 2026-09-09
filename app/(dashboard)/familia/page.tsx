import { createClient } from '@/lib/supabase/server'
import PremiumGate from '@/components/ui/PremiumGate'
import FamilyList from '@/components/familia/FamilyList'
import type { FamilyProfile } from '@/components/familia/FamilyCard'

export default async function FamiliaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (userRow?.plan !== 'premium') {
    return (
      <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8 flex items-center justify-center">
        <PremiumGate
          featureName="Perfiles Familiares"
          description="Gestiona el historial médico de hasta 5 miembros de tu familia desde una sola cuenta."
        />
      </div>
    )
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select(
      'id, user_id, full_name, is_owner, relationship, date_of_birth, gender, blood_type, allergies, emergency_contact_name, emergency_contact_phone, avatar_url, created_at'
    )
    .eq('user_id', user.id)
    .order('is_owner', { ascending: false })
    .order('created_at', { ascending: true })

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
      <FamilyList
        profiles={(profiles as FamilyProfile[]) ?? []}
        userId={user.id}
        userPlan="premium"
      />
    </div>
  )
}

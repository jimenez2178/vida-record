import type { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function getActiveProfileId(
  supabase: SupabaseServerClient,
  userId: string
): Promise<string | null> {
  const { data: userRow } = await supabase
    .from('users')
    .select('active_profile_id')
    .eq('id', userId)
    .single()

  if (userRow?.active_profile_id) {
    const { data: activeProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userRow.active_profile_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (activeProfile) {
      return activeProfile.id
    }
  }

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('is_owner', true)
    .maybeSingle()

  return ownerProfile?.id ?? null
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type PlanType = 'free' | 'premium'

export type PlanCounts = {
  appointments: number
  medications: number
  studies: number
}

const LIMITS = {
  appointments: 5,
  medications: 5,
  studies: 5,
} as const

export function usePlan() {
  const supabase = createClient()

  const [plan, setPlan] = useState<PlanType>('free')
  const [counts, setCounts] = useState<PlanCounts>({
    appointments: 0,
    medications: 0,
    studies: 0,
  })

  const fetchPlan = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const [{ data: userRow }, { data: profile }] = await Promise.all([
      supabase.from('users').select('plan').eq('id', user.id).single(),
      supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_owner', true)
        .single(),
    ])

    setPlan((userRow?.plan as PlanType | undefined) ?? 'free')

    if (!profile) {
      setCounts({ appointments: 0, medications: 0, studies: 0 })
      return
    }

    const [
      { count: appointmentsCount },
      { count: medicationsCount },
      { count: studiesCount },
    ] = await Promise.all([
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', profile.id),
      supabase
        .from('medications')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', profile.id),
      supabase
        .from('studies')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', profile.id),
    ])

    setCounts({
      appointments: appointmentsCount ?? 0,
      medications: medicationsCount ?? 0,
      studies: studiesCount ?? 0,
    })
  }, [supabase])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  const isPremium = plan === 'premium'

  return {
    isPremium,
    plan,
    counts,
    limits: LIMITS,
    canAdd: {
      appointments: isPremium || counts.appointments < LIMITS.appointments,
      medications: isPremium || counts.medications < LIMITS.medications,
      studies: isPremium || counts.studies < LIMITS.studies,
    },
    refetch: fetchPlan,
  }
}

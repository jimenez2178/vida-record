import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date().toISOString()

  const { data: expiredUsers, error: selectError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('plan', 'premium')
    .lt('plan_expires_at', now)

  if (selectError) {
    return NextResponse.json({ error: 'No se pudo consultar usuarios' }, { status: 500 })
  }

  const expiredIds = (expiredUsers ?? []).map((u) => u.id)

  if (expiredIds.length === 0) {
    return NextResponse.json({ downgraded: 0 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ plan: 'free', plan_expires_at: null, paypal_subscription_id: null })
    .in('id', expiredIds)

  if (updateError) {
    return NextResponse.json({ error: 'No se pudo actualizar usuarios' }, { status: 500 })
  }

  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'expired' })
    .in('user_id', expiredIds)
    .eq('status', 'active')

  return NextResponse.json({ downgraded: expiredIds.length })
}

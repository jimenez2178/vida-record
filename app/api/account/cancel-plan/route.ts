import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { error: userError } = await supabase
    .from('users')
    .update({
      plan: 'free',
      plan_expires_at: null,
      paypal_subscription_id: null,
    })
    .eq('id', user.id)

  if (userError) {
    return NextResponse.json(
      { error: 'No se pudo cancelar el plan' },
      { status: 500 }
    )
  }

  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('user_id', user.id)
    .eq('status', 'active')

  return NextResponse.json({ success: true })
}

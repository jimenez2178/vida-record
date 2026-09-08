import { NextResponse } from 'next/server'
import { OrdersController, OrderStatus } from '@paypal/paypal-server-sdk'
import { paypalClient } from '@/lib/paypal/client'
import { createClient } from '@/lib/supabase/server'

const ordersController = new OrdersController(paypalClient)

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const orderID = body?.orderID

  if (!orderID || typeof orderID !== 'string') {
    return NextResponse.json({ error: 'orderID es requerido' }, { status: 400 })
  }

  try {
    const response = await ordersController.captureOrder({ id: orderID })

    if (response.result.status !== OrderStatus.Completed) {
      return NextResponse.json({ error: 'El pago no se completó' }, { status: 400 })
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const { error: userError } = await supabase
      .from('users')
      .update({
        plan: 'premium',
        plan_expires_at: expiresAt.toISOString(),
        paypal_subscription_id: orderID,
      })
      .eq('id', user.id)

    if (userError) {
      return NextResponse.json(
        { error: 'No se pudo actualizar el plan' },
        { status: 500 }
      )
    }

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        paypal_order_id: orderID,
        plan: 'premium',
        amount: 3.99,
        currency: 'USD',
        status: 'active',
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })

    if (subscriptionError) {
      return NextResponse.json(
        { error: 'No se pudo registrar la suscripción' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'No se pudo capturar el pago' },
      { status: 500 }
    )
  }
}

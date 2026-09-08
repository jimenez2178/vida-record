import { NextResponse } from 'next/server'
import {
  OrdersController,
  CheckoutPaymentIntent,
  PaypalExperienceUserAction,
} from '@paypal/paypal-server-sdk'
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

  if (body?.plan !== 'premium') {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!appUrl) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_APP_URL no está configurado' },
      { status: 500 }
    )
  }

  try {
    const response = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: 'USD',
              value: '3.99',
            },
            description: 'VidaRecord Premium — 1 mes',
          },
        ],
        paymentSource: {
          paypal: {
            experienceContext: {
              returnUrl: `${appUrl}/api/payments/success`,
              cancelUrl: `${appUrl}/configuracion?cancelled=true`,
              userAction: PaypalExperienceUserAction.PayNow,
            },
          },
        },
      },
    })

    const order = response.result
    const approvalLink = order.links?.find(
      (link) => link.rel === 'payer-action' || link.rel === 'approve'
    )

    if (!order.id || !approvalLink) {
      return NextResponse.json(
        { error: 'No se pudo generar el link de pago' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orderID: order.id,
      approvalUrl: approvalLink.href,
    })
  } catch (error) {
    console.error('PayPal create-order error:', error)
    return NextResponse.json(
      { error: 'No se pudo crear la orden de pago' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const orderID = url.searchParams.get('token')

  if (!orderID) {
    return NextResponse.redirect(
      new URL('/configuracion?cancelled=true', url.origin)
    )
  }

  const captureResponse = await fetch(
    new URL('/api/payments/capture', url.origin),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') ?? '',
      },
      body: JSON.stringify({ orderID }),
    }
  )

  if (!captureResponse.ok) {
    return NextResponse.redirect(
      new URL('/configuracion?cancelled=true', url.origin)
    )
  }

  return NextResponse.redirect(
    new URL('/configuracion?upgraded=true', url.origin)
  )
}

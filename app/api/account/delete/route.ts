import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: files } = await supabaseAdmin.storage
    .from('medical-documents')
    .list(user.id)

  if (files && files.length > 0) {
    const paths = files.map((file) => `${user.id}/${file.name}`)
    await supabaseAdmin.storage.from('medical-documents').remove(paths)
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
    user.id
  )

  if (deleteError) {
    return NextResponse.json(
      { error: 'No se pudo eliminar la cuenta' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

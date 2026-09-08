import { createClient } from '@/lib/supabase/server'
import DoctorsList from '@/components/doctors/DoctorsList'

export default async function MedicosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
      <DoctorsList userId={user.id} />
    </div>
  )
}

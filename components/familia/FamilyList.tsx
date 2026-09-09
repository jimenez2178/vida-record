'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FamilyCard, { type FamilyProfile } from './FamilyCard'
import FamilyModal from './FamilyModal'

const MAX_FAMILY_PROFILES = 5

export default function FamilyList({
  profiles,
  userId,
  userPlan,
}: {
  profiles: FamilyProfile[]
  userId: string
  userPlan: 'free' | 'premium'
}) {
  const router = useRouter()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<FamilyProfile | null>(
    null
  )

  const owner = profiles.find((p) => p.is_owner) ?? null
  const familyMembers = profiles.filter((p) => !p.is_owner)
  const atLimit = profiles.length >= MAX_FAMILY_PROFILES

  const openNewModal = () => {
    setEditingProfile(null)
    setModalOpen(true)
  }

  const openEditModal = (profile: FamilyProfile) => {
    setEditingProfile(profile)
    setModalOpen(true)
  }

  const handleDelete = () => {
    router.refresh()
  }

  const handleSuccess = () => {
    setModalOpen(false)
    setEditingProfile(null)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mi familia</h1>

        {atLimit ? (
          <span className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Límite alcanzado (5/5)
          </span>
        ) : (
          <button
            type="button"
            onClick={openNewModal}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
          >
            + Agregar familiar
          </button>
        )}
      </div>

      <div className="space-y-3">
        {owner && (
          <FamilyCard
            profile={owner}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}

        {familyMembers.map((profile) => (
          <FamilyCard
            key={profile.id}
            profile={profile}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {modalOpen && (
        <FamilyModal
          userId={userId}
          profile={editingProfile}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}

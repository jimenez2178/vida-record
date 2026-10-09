import InstallGuideButton from '@/components/pwa/InstallGuide'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex flex-col items-center justify-center gap-4 p-4">
      {children}
      <InstallGuideButton className="w-full max-w-md bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl py-3 transition-colors" />
    </div>
  )
}

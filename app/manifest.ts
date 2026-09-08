import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VidaRecord — Tu historial médico',
    short_name: 'VidaRecord',
    description:
      'Organiza tu historial médico personal y familiar en un solo lugar.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F9FAFB',
    theme_color: '#1E40AF',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

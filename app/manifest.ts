import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Educate MW',
    short_name: 'EducateMW',
    description: 'The ultimate learning companion for Malawian students.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#2563eb',
    icons: [
      {
        src: 'https://picsum.photos/seed/educatemw/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/educatemw/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}

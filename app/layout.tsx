import type {Metadata, Viewport} from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css'; // Global styles
import Script from 'next/script';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const viewport: Viewport = {
  themeColor: '#4f46e5', // Indigo-600
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Educate MW',
  description: 'The ultimate learning companion for Malawian students. Access past papers, quizzes, and premium content.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Educate MW',
    description: 'The ultimate learning companion for Malawian students.',
    url: 'https://educatemw.vercel.app',
    siteName: 'Educate MW',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_MW',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Educate MW',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans text-base md:text-lg bg-slate-50 text-slate-900`}>
        {children}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registration successful');
                    
                    // Check for updates every hour
                    setInterval(() => {
                      registration.update();
                    }, 3600000);

                    registration.onupdatefound = () => {
                      const installingWorker = registration.installing;
                      if (installingWorker == null) return;
                      installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                          if (navigator.serviceWorker.controller) {
                            // New content is available; please refresh.
                            console.log('New content is available; please refresh.');
                            if (window.confirm('A new version of Educate MW is available! Refresh now to get the latest features?')) {
                              window.location.reload();
                            }
                          } else {
                            // Content is cached for offline use.
                            console.log('Content is cached for offline use.');
                          }
                        }
                      };
                    };
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });

              // Handle controller change (e.g. after skipWaiting)
              let refreshing = false;
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                refreshing = true;
                window.location.reload();
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}

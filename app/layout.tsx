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
  title: 'Educate MW - Malawi\'s #1 MSCE Study App',
  description: 'Educate MW is the ultimate learning companion for Malawian students. Access thousands of MSCE past papers, study notes, interactive quizzes, and AI-powered tutoring. Join over 10,000 students acing their exams today.',
  keywords: ['MSCE Malawi', 'Malawi past papers', 'MSCE study notes', 'Malawi education app', 'MANEB past papers', 'MSCE quizzes', 'MSCE AI teacher'],
  authors: [{ name: 'Educate MW Team' }],
  creator: 'Educate MW',
  publisher: 'Educate MW',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Educate MW - Malawi\'s #1 MSCE Study App',
    description: 'Access thousands of MSCE past papers, study notes, and AI-powered tutoring. Join over 10,000 students acing their exams today.',
    url: 'https://educatemw.vercel.app',
    siteName: 'Educate MW',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Educate MW - MSCE Study App',
      },
    ],
    locale: 'en_MW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Educate MW - Malawi\'s #1 MSCE Study App',
    description: 'Access thousands of MSCE past papers, study notes, and AI-powered tutoring.',
    images: ['/og-image.svg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Educate MW',
  },
  alternates: {
    canonical: 'https://educatemw.vercel.app',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="google-site-verification" content="your-google-verification-code" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Catch chunk load errors (Unexpected token '<') and force reload
              window.addEventListener('error', function(e) {
                const msg = e.message || (e.error && e.error.message) || '';
                if (msg.includes("Unexpected token '<'") || msg.includes("SyntaxError")) {
                  if (!sessionStorage.getItem('chunk_reload')) {
                    sessionStorage.setItem('chunk_reload', 'true');
                    console.warn("Stale chunk detected, reloading...");
                    window.location.reload();
                  }
                }
              });

              // Catch dynamic import failures
              window.addEventListener('unhandledrejection', function(e) {
                const msg = e.reason && e.reason.message ? e.reason.message : '';
                if (msg.includes("Unexpected token '<'") || msg.includes("SyntaxError") || msg.includes("Failed to fetch dynamically imported module")) {
                  if (!sessionStorage.getItem('chunk_reload')) {
                    sessionStorage.setItem('chunk_reload', 'true');
                    console.warn("Dynamic import failed, reloading...");
                    window.location.reload();
                  }
                }
              });

              // Kill service workers aggressively
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  let shouldReload = false;
                  for(let registration of registrations) {
                    registration.unregister();
                    shouldReload = true;
                  }
                  if (shouldReload && !sessionStorage.getItem('sw_reload')) {
                    sessionStorage.setItem('sw_reload', 'true');
                    window.location.reload();
                  }
                });
                caches.keys().then(function(names) {
                  for (let name of names) caches.delete(name);
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans text-base md:text-lg bg-slate-50 text-slate-900`}>
        <noscript>
          <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc' }}>
            <h1>Educate MW - Malawi&apos;s #1 MSCE Study App</h1>
            <p>Educate MW is the ultimate learning companion for Malawian students. Access thousands of MSCE past papers, study notes, interactive quizzes, and AI-powered tutoring.</p>
            <p>Please enable JavaScript to use the full features of the app.</p>
            <ul>
              <li>MSCE Past Papers</li>
              <li>Study Notes</li>
              <li>Interactive Quizzes</li>
              <li>AI Teacher Assistance</li>
              <li>Student Community</li>
            </ul>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}

import React from 'react';

export const AppIcon = ({ size = 40, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="100" height="100" rx="24" fill="url(#logo_grad)" />
    <path 
      d="M30 35C30 32.2386 32.2386 30 35 30H65C67.7614 30 70 32.2386 70 35V65C70 67.7614 67.7614 70 65 70H35C32.2386 70 30 67.7614 30 65V35Z" 
      fill="white" 
      fillOpacity="0.2" 
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M50 25L25 37.5V62.5L50 75L75 62.5V37.5L50 25ZM50 32.5L67.5 41.25V58.75L50 67.5L32.5 58.75V41.25L50 32.5Z" 
      fill="white" 
    />
    <path 
      d="M50 45L40 40V55L50 60L60 55V40L50 45Z" 
      fill="white" 
    />
    <defs>
      <linearGradient id="logo_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
  </svg>
);

export const AppLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <AppIcon size={32} />
    <span className="font-black text-xl tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
      Educate MW
    </span>
  </div>
);

export const OGImage = () => (
  <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0F172A" />
    <circle cx="1100" cy="100" r="300" fill="#2563EB" fillOpacity="0.1" />
    <circle cx="100" cy="500" r="200" fill="#4F46E5" fillOpacity="0.1" />
    
    <g transform="translate(450, 150) scale(3)">
      <rect width="100" height="100" rx="24" fill="url(#og_grad)" />
      <path d="M50 25L25 37.5V62.5L50 75L75 62.5V37.5L50 25Z" fill="white" fillOpacity="0.2" />
      <path d="M50 32.5L67.5 41.25V58.75L50 67.5L32.5 58.75V41.25L50 32.5Z" fill="white" />
    </g>

    <text x="600" y="480" textAnchor="middle" fill="white" style={{ font: 'bold 80px sans-serif' }}>Educate MW</text>
    <text x="600" y="540" textAnchor="middle" fill="#94A3B8" style={{ font: '500 30px sans-serif', letterSpacing: '0.2em' }}>MALAWI&apos;S #1 STUDY PLATFORM</text>
    
    <defs>
      <linearGradient id="og_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
  </svg>
);

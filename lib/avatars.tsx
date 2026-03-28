import React from 'react';

export const AVATARS = [
  // Girls (5)
  {
    id: 'girl_1',
    gender: 'girl',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1_skin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFDBAC" />
            <stop offset="100%" stopColor="#F1C27D" />
          </linearGradient>
          <linearGradient id="g1_hair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3D2314" />
            <stop offset="100%" stopColor="#24140A" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="#FDF2F8" />
        <path d="M50 85C68 85 82 72 82 55C82 38 68 25 50 25C32 25 18 38 18 55C18 72 32 85 50 85Z" fill="url(#g1_skin)" />
        <path d="M20 45C20 25 35 10 50 10C65 10 80 25 80 45V65C80 75 70 85 50 85C30 85 20 75 20 65V45Z" fill="url(#g1_hair)" />
        <circle cx="40" cy="52" r="4" fill="#1A1A1A" />
        <circle cx="60" cy="52" r="4" fill="#1A1A1A" />
        <path d="M44 68C44 68 47 72 50 72C53 72 56 68 56 68" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="35" y="15" width="30" height="10" rx="5" fill="#F472B6" />
      </svg>
    )
  },
  {
    id: 'girl_2',
    gender: 'girl',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g2_skin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8BEAC" />
            <stop offset="100%" stopColor="#D08B5B" />
          </linearGradient>
          <linearGradient id="g2_hair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1A1A1A" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="#F5F3FF" />
        <path d="M50 82C65 82 78 70 78 55C78 40 65 28 50 28C35 28 22 40 22 55C22 70 35 82 50 82Z" fill="url(#g2_skin)" />
        <path d="M15 35C15 20 30 10 50 10C70 10 85 20 85 35V75C85 85 75 92 50 92C25 92 15 85 15 75V35Z" fill="url(#g2_hair)" />
        <circle cx="42" cy="55" r="3.5" fill="#1A1A1A" />
        <circle cx="58" cy="55" r="3.5" fill="#1A1A1A" />
        <path d="M45 70C45 70 48 74 50 74C52 74 55 70 55 70" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="25" cy="30" r="10" fill="#8B5CF6" />
        <circle cx="75" cy="30" r="10" fill="#8B5CF6" />
      </svg>
    )
  },
  {
    id: 'girl_3',
    gender: 'girl',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g3_skin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD1DC" />
            <stop offset="100%" stopColor="#E9967A" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="#ECFDF5" />
        <path d="M50 80C65 80 75 70 75 55C75 40 65 30 50 30C35 30 25 40 25 55C25 70 35 80 50 80Z" fill="url(#g3_skin)" />
        <path d="M20 30C20 15 35 5 50 5C65 5 80 15 80 30V60C80 75 70 85 50 85C30 85 20 75 20 60V30Z" fill="#D97706" />
        <circle cx="40" cy="52" r="3" fill="#1A1A1A" />
        <circle cx="60" cy="52" r="3" fill="#1A1A1A" />
        <path d="M46 68C46 68 48 71 50 71C52 71 54 68 54 68" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 30C20 30 35 20 50 20C65 20 80 30 80 30" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'girl_4',
    gender: 'girl',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#FFF7ED" />
        <path d="M50 85C68 85 82 72 82 55C82 38 68 25 50 25C32 25 18 38 18 55C18 72 32 85 50 85Z" fill="#C68642" />
        <path d="M10 40C10 20 30 10 50 10C70 10 90 20 90 40V80C90 90 80 95 50 95C20 95 10 90 10 80V40Z" fill="#2D3748" />
        <circle cx="42" cy="55" r="4" fill="#1A1A1A" />
        <circle cx="58" cy="55" r="4" fill="#1A1A1A" />
        <path d="M44 72C44 72 47 76 50 76C53 76 56 72 56 72" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 35C30 35 40 25 50 25C60 25 70 35 70 35" stroke="#1A202C" strokeWidth="6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'girl_5',
    gender: 'girl',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#EFF6FF" />
        <path d="M50 82C65 82 78 70 78 55C78 40 65 28 50 28C35 28 22 40 22 55C22 70 35 82 50 82Z" fill="#F3C892" />
        <path d="M20 20C20 10 35 5 50 5C65 5 80 10 80 20V50C80 65 70 75 50 75C30 75 20 65 20 50V20Z" fill="#4C1D95" />
        <circle cx="42" cy="50" r="3.5" fill="#1A1A1A" />
        <circle cx="58" cy="50" r="3.5" fill="#1A1A1A" />
        <path d="M45 65C45 65 48 69 50 69C52 69 55 65 55 65" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <rect x="40" y="5" width="20" height="15" rx="4" fill="#8B5CF6" />
      </svg>
    )
  },
  // Boys (5)
  {
    id: 'boy_1',
    gender: 'boy',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#F0FDF4" />
        <path d="M50 85C68 85 82 72 82 55C82 38 68 25 50 25C32 25 18 38 18 55C18 72 32 85 50 85Z" fill="#E0AC69" />
        <path d="M25 20C25 10 40 5 50 5C60 5 75 10 75 20V40H25V20Z" fill="#166534" />
        <circle cx="40" cy="55" r="4" fill="#1A1A1A" />
        <circle cx="60" cy="55" r="4" fill="#1A1A1A" />
        <path d="M44 72C44 72 47 76 50 76C53 76 56 72 56 72" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M35 20L50 10L65 20" stroke="#14532D" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'boy_2',
    gender: 'boy',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#FEF2F2" />
        <path d="M50 82C65 82 78 70 78 55C78 40 65 28 50 28C35 28 22 40 22 55C22 70 35 82 50 82Z" fill="#8D5524" />
        <path d="M30 15C30 10 40 5 50 5C60 5 70 10 70 15V35H30V15Z" fill="#991B1B" />
        <circle cx="42" cy="52" r="3.5" fill="#1A1A1A" />
        <circle cx="58" cy="52" r="3.5" fill="#1A1A1A" />
        <path d="M45 68C45 68 48 72 50 72C52 72 55 68 55 68" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        <rect x="35" y="10" width="30" height="8" rx="4" fill="#7F1D1D" />
      </svg>
    )
  },
  {
    id: 'boy_3',
    gender: 'boy',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#FFFBEB" />
        <path d="M50 80C65 80 75 70 75 55C75 40 65 30 50 30C35 30 25 40 25 55C25 70 35 80 50 80Z" fill="#F1C27D" />
        <path d="M20 25C20 15 35 10 50 10C65 10 80 15 80 25V45H20V25Z" fill="#B45309" />
        <circle cx="40" cy="52" r="3" fill="#1A1A1A" />
        <circle cx="60" cy="52" r="3" fill="#1A1A1A" />
        <path d="M46 68C46 68 48 71 50 71C52 71 54 68 54 68" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        <path d="M25 25L50 15L75 25" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'boy_4',
    gender: 'boy',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#F8FAFC" />
        <path d="M50 85C68 85 82 72 82 55C82 38 68 25 50 25C32 25 18 38 18 55C18 72 32 85 50 85Z" fill="#C68642" />
        <path d="M30 10C30 5 40 2 50 2C60 2 70 5 70 10V30H30V10Z" fill="#1E293B" />
        <circle cx="42" cy="55" r="4" fill="#1A1A1A" />
        <circle cx="58" cy="55" r="4" fill="#1A1A1A" />
        <path d="M44 72C44 72 47 76 50 76C53 76 56 72 56 72" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="40" y="5" width="20" height="10" rx="5" fill="#0F172A" />
      </svg>
    )
  },
  {
    id: 'boy_5',
    gender: 'boy',
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#F5F3FF" />
        <path d="M50 82C65 82 78 70 78 55C78 40 65 28 50 28C35 28 22 40 22 55C22 70 35 82 50 82Z" fill="#FFDBAC" />
        <path d="M20 20L50 5L80 20V40H20V20Z" fill="#6D28D9" />
        <circle cx="42" cy="52" r="3.5" fill="#1A1A1A" />
        <circle cx="58" cy="52" r="3.5" fill="#1A1A1A" />
        <path d="M45 68C45 68 48 72 50 72C52 72 55 68 55 68" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 20C30 20 40 10 50 10C60 10 70 20 70 20" stroke="#5B21B6" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  }
];

export function getAvatarById(id: string) {
  return AVATARS.find(a => a.id === id)?.svg || AVATARS[0].svg;
}

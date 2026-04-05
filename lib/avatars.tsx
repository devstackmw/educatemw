import React from 'react';
import Image from 'next/image';

export const AVATARS = [
  {
    id: 'boy_1',
    gender: 'boy',
    svg: (
      <div className="w-full h-full relative">
        <Image 
          src="https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=e0e7ff" 
          alt="Boy Avatar" 
          fill
          className="object-cover" 
          referrerPolicy="no-referrer"
        />
      </div>
    )
  },
  {
    id: 'girl_1',
    gender: 'girl',
    svg: (
      <div className="w-full h-full relative">
        <Image 
          src="https://api.dicebear.com/7.x/micah/svg?seed=Aneka&backgroundColor=fce7f3" 
          alt="Girl Avatar" 
          fill
          className="object-cover" 
          referrerPolicy="no-referrer"
        />
      </div>
    )
  }
];

export const getAvatarSvg = (id: string) => {
  return AVATARS.find(a => a.id === id)?.svg || AVATARS[0].svg;
};

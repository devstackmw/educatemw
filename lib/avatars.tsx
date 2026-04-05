import React from 'react';

export const AVATARS = [
  {
    id: 'boy_1',
    gender: 'boy',
    svg: (
      <img 
        src="https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=e0e7ff" 
        alt="Boy Avatar" 
        className="w-full h-full object-cover" 
        crossOrigin="anonymous"
      />
    )
  },
  {
    id: 'girl_1',
    gender: 'girl',
    svg: (
      <img 
        src="https://api.dicebear.com/7.x/micah/svg?seed=Aneka&backgroundColor=fce7f3" 
        alt="Girl Avatar" 
        className="w-full h-full object-cover" 
        crossOrigin="anonymous"
      />
    )
  }
];

export const getAvatarSvg = (id: string) => {
  return AVATARS.find(a => a.id === id)?.svg || AVATARS[0].svg;
};

'use client';

import { useEffect } from 'react';
import { soundManager } from '@/lib/soundManager';

export default function SoundProvider() {
  useEffect(() => {
    // Memastikan instance soundManager terinisialisasi dan siap menerima interaksi
    if (soundManager) {
      soundManager.getMusicVolume();
    }
  }, []);

  return null;
}

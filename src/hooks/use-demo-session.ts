import { useState, useEffect } from 'react';
import { isDemoSession } from '@/lib/demo-auth';

export function useDemoSession() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(isDemoSession());
  }, []);

  return { isDemo };
}

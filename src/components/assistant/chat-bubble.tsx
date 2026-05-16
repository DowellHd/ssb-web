'use client';

import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAssistantStore } from '@/stores/assistant-store';
import { useAssistantSettingsStore } from '@/stores/assistant-settings-store';
import { getCookieConsent } from '@/lib/cookie-consent';
import { cn } from '@/lib/utils';
import { AssistantHint } from './assistant-hint';
import { ChatPanel } from './chat-panel';

// Bubble size configurations
const BUBBLE_SIZES = {
  sm: { button: 'h-11 w-11', image: 44, icon: 'h-5 w-5' },
  default: { button: 'h-14 w-14', image: 56, icon: 'h-7 w-7' },
  lg: { button: 'h-16 w-16', image: 64, icon: 'h-8 w-8' },
} as const;

function useCookieBannerVisible() {
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    setBannerVisible(getCookieConsent() === null);

    const handler = () => setBannerVisible(getCookieConsent() === null);
    window.addEventListener('ssb:consent-changed', handler);
    return () => window.removeEventListener('ssb:consent-changed', handler);
  }, []);

  return bannerVisible;
}

export function ChatBubble() {
  const { isOpen, toggle, open } = useAssistantStore();
  const { bubbleSize, reducedMotion } = useAssistantSettingsStore();
  const [imageError, setImageError] = useState(false);
  const bannerVisible = useCookieBannerVisible();

  const sizeConfig = BUBBLE_SIZES[bubbleSize];

  // Shift bubble above the cookie banner when it's showing.
  // bottom-32 on mobile (banner stacks vertically), sm:bottom-20 on desktop.
  const bottomClass = bannerVisible
    ? 'bottom-32 sm:bottom-20'
    : 'bottom-6';

  return (
    <>
      {/* First-time hint (only shows when panel is closed) */}
      {!isOpen && <AssistantHint onOpenAssistant={open} bannerVisible={bannerVisible} />}

      {/* Floating bubble button */}
      <button
        onClick={toggle}
        className={cn(
          'fixed right-6 z-50',
          bottomClass,
          sizeConfig.button,
          'rounded-full',
          'bg-primary text-primary-foreground',
          'shadow-lg hover:shadow-xl',
          'flex items-center justify-center',
          !reducedMotion && 'transition-all duration-200',
          !reducedMotion && 'hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'overflow-hidden p-0',
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label={isOpen ? 'Close SSB Assistant' : 'Open SSB Assistant'}
      >
        {!imageError ? (
          <Image
            src="/SSBAssistant.png"
            alt="SSB Assistant"
            width={sizeConfig.image}
            height={sizeConfig.image}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <MessageCircle className={sizeConfig.icon} />
        )}
      </button>

      {/* Chat panel */}
      <ChatPanel />
    </>
  );
}

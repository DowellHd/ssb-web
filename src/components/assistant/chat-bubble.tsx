'use client';

import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useAssistantStore } from '@/stores/assistant-store';
import { useAssistantSettingsStore } from '@/stores/assistant-settings-store';
import { cn } from '@/lib/utils';
import { ChatPanel } from './chat-panel';

// Bubble size configurations
const BUBBLE_SIZES = {
  sm: { button: 'h-11 w-11', image: 44, icon: 'h-5 w-5' },
  default: { button: 'h-14 w-14', image: 56, icon: 'h-7 w-7' },
  lg: { button: 'h-16 w-16', image: 64, icon: 'h-8 w-8' },
} as const;

export function ChatBubble() {
  const { isOpen, toggle } = useAssistantStore();
  const { bubbleSize, reducedMotion } = useAssistantSettingsStore();
  const [imageError, setImageError] = useState(false);

  const sizeConfig = BUBBLE_SIZES[bubbleSize];

  return (
    <>
      {/* Floating bubble button */}
      <button
        onClick={toggle}
        className={cn(
          'fixed bottom-6 right-6 z-50',
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

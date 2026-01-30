'use client';

import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useAssistantStore } from '@/stores/assistant-store';
import { cn } from '@/lib/utils';
import { ChatPanel } from './chat-panel';

export function ChatBubble() {
  const { isOpen, toggle } = useAssistantStore();
  const [imageError, setImageError] = useState(false);

  return (
    <>
      {/* Floating bubble button */}
      <button
        onClick={toggle}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'h-14 w-14 rounded-full',
          'bg-primary text-primary-foreground',
          'shadow-lg hover:shadow-xl',
          'flex items-center justify-center',
          'transition-all duration-200',
          'hover:scale-105 active:scale-95',
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
            width={56}
            height={56}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <MessageCircle className="h-7 w-7" />
        )}
      </button>

      {/* Chat panel */}
      <ChatPanel />
    </>
  );
}

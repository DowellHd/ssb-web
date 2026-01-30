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
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label={isOpen ? 'Close SSB Assistant' : 'Open SSB Assistant'}
      >
        {!imageError ? (
          <Image
            src="/SSBAssistant.png"
            alt="SSB Assistant"
            width={32}
            height={32}
            className="h-8 w-8"
            onError={() => setImageError(true)}
          />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat panel */}
      <ChatPanel />
    </>
  );
}

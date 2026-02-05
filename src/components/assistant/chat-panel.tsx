'use client';

import { X, Trash2, Settings } from 'lucide-react';
import { useEffect, useRef, useMemo } from 'react';
import { useAssistantStore } from '@/stores/assistant-store';
import {
  useAssistantSettingsStore,
  useAssistantSettingsAttributes,
} from '@/stores/assistant-settings-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { DisclaimerBanner } from './disclaimer-banner';
import { AssistantSettingsModal } from './assistant-settings-modal';

export function ChatPanel() {
  const { isOpen, close, messages, isLoading, clearChat, currentPage } = useAssistantStore();
  const { openSettings, panelWidth, panelHeight, mobileMode, reducedMotion, cornerStyle, density } =
    useAssistantSettingsStore();
  const settingsAttributes = useAssistantSettingsAttributes();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get suggestions from the last assistant message
  const lastSuggestions = useMemo(() => {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const lastAssistant = assistantMessages[assistantMessages.length - 1];
    return lastAssistant?.suggestions || [];
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  // Determine page name for context display
  const pageName = useMemo(() => {
    if (currentPage.includes('/paper')) return 'Paper Trading';
    if (currentPage.includes('/backtest')) return 'Backtesting';
    if (currentPage.includes('/risk')) return 'Risk Analytics';
    if (currentPage.includes('/regime')) return 'Market Regime';
    if (currentPage.includes('/stress')) return 'Stress Testing';
    if (currentPage.includes('/settings')) return 'Settings';
    if (currentPage.includes('/billing')) return 'Billing';
    return 'Dashboard';
  }, [currentPage]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'assistant-root',
          'fixed z-50 bg-card border shadow-2xl',
          'flex flex-col',
          // Transition (respects reduced motion via CSS)
          !reducedMotion && 'transition-all duration-300 ease-in-out',
          // Desktop: slide-out from right
          'lg:right-6 lg:bottom-6 lg:top-auto lg:left-auto',
          // Desktop width based on settings
          panelWidth === 'sm' && 'lg:w-80',
          panelWidth === 'md' && 'lg:w-96',
          panelWidth === 'lg' && 'lg:w-[28rem]',
          // Desktop height based on settings
          panelHeight === 'short' && 'lg:h-[450px]',
          panelHeight === 'default' && 'lg:h-[600px]',
          panelHeight === 'tall' && 'lg:h-[750px]',
          'lg:max-h-[85vh]',
          // Corner style
          cornerStyle === 'rounded' ? 'lg:rounded-lg' : 'lg:rounded-2xl',
          // Mobile: full-width drawer from bottom
          'max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto',
          mobileMode === 'sheet' ? 'max-lg:h-[85vh]' : 'max-lg:h-[100vh]',
          cornerStyle === 'rounded' ? 'max-lg:rounded-t-xl' : 'max-lg:rounded-t-2xl',
          // Open/closed state
          isOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full lg:translate-y-4 opacity-0 pointer-events-none'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="SSB Assistant"
        {...settingsAttributes}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="font-semibold text-lg">SSB Assistant</h2>
            <p className="text-xs text-muted-foreground">
              Context: {pageName}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={openSettings}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Open assistant settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Close assistant"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Disclaimer banner */}
        <DisclaimerBanner />

        {/* Messages area */}
        <div className={cn(
          'flex-1 overflow-y-auto',
          density === 'compact' ? 'p-3 space-y-3' : 'p-4 space-y-4'
        )}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <h3 className="font-medium mb-2">Welcome to SSB Assistant</h3>
              <p className="text-sm text-muted-foreground mb-4">
                I can help you understand market concepts, risk metrics, and platform features.
                Ask me anything educational!
              </p>
              <p className="text-xs text-muted-foreground">
                Currently on: <span className="font-medium">{pageName}</span>
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area with suggestions */}
        <ChatInput suggestions={messages.length > 0 ? lastSuggestions : undefined} />
      </div>

      {/* Settings Modal */}
      <AssistantSettingsModal />
    </>
  );
}

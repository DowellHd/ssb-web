'use client';

import { Send } from 'lucide-react';
import { useState, useRef, KeyboardEvent } from 'react';
import { useAssistantStore } from '@/stores/assistant-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  /** Suggestions to show (from last assistant message or page-smart prompts) */
  suggestions?: string[];
}

export function ChatInput({ suggestions }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, messages, getQuickPrompts } = useAssistantStore();

  // Get page-smart prompts from store
  const quickPrompts = getQuickPrompts();

  // Use suggestions if provided, otherwise use page-smart quick prompts
  const displayPrompts = suggestions && suggestions.length > 0
    ? suggestions
    : quickPrompts;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    await sendMessage(trimmed);

    // Focus textarea after sending
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage(prompt);
  };

  // Auto-resize textarea
  const handleInputChange = (value: string) => {
    setInput(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  // Show quick prompts when no messages, or suggestions after assistant response
  const showPrompts = messages.length === 0 || (suggestions && suggestions.length > 0);

  return (
    <div className="border-t p-4 space-y-3">
      {/* Quick prompts / suggestions */}
      {showPrompts && displayPrompts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {messages.length === 0 ? 'Quick questions:' : 'Try asking:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {displayPrompts.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isLoading}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full',
                  'bg-muted hover:bg-muted/80',
                  'transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'text-left'
                )}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={isLoading}
            className={cn(
              'w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-h-[40px] max-h-[120px]'
            )}
            rows={1}
          />
          {/* Character count */}
          {input.length > 1500 && (
            <span
              className={cn(
                'absolute right-2 bottom-1 text-[10px]',
                input.length > 2000 ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {input.length}/2000
            </span>
          )}
        </div>

        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || input.length > 2000}
          size="icon"
          className="h-10 w-10 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Hint */}
      <p className="text-[10px] text-muted-foreground text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}

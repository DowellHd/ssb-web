'use client';

import { AlertTriangle, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/stores/assistant-store';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'flex-1 max-w-[80%]',
          isUser && 'flex flex-col items-end'
        )}
      >
        <div
          className={cn(
            'rounded-lg px-3 py-2 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : isError
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-muted'
          )}
        >
          {isError && (
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs font-medium">Error</span>
            </div>
          )}

          {/* Render message content with basic markdown support */}
          <MessageContent content={message.content} />
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1">
          {formatTime(message.timestamp)}
        </span>

        {/* Related topics hint */}
        {message.relatedTopics && message.relatedTopics.length > 0 && !isUser && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            Related: {message.relatedTopics.slice(0, 3).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering
  // Split by double newlines for paragraphs
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, idx) => {
        // Check if it's a list
        const lines = paragraph.split('\n');
        const isUnorderedList = lines.every((line) => line.trim().startsWith('- ') || line.trim() === '');
        const isOrderedList = lines.every((line) => /^\d+\.\s/.test(line.trim()) || line.trim() === '');

        if (isUnorderedList && lines.filter(l => l.trim()).length > 0) {
          return (
            <ul key={idx} className="list-disc list-inside space-y-1">
              {lines
                .filter((line) => line.trim().startsWith('- '))
                .map((line, lineIdx) => (
                  <li key={lineIdx}>{line.trim().substring(2)}</li>
                ))}
            </ul>
          );
        }

        if (isOrderedList && lines.filter(l => l.trim()).length > 0) {
          return (
            <ol key={idx} className="list-decimal list-inside space-y-1">
              {lines
                .filter((line) => /^\d+\.\s/.test(line.trim()))
                .map((line, lineIdx) => (
                  <li key={lineIdx}>{line.trim().replace(/^\d+\.\s/, '')}</li>
                ))}
            </ol>
          );
        }

        // Check if it's an italic disclaimer block (starts with *)
        if (paragraph.trim().startsWith('*') && paragraph.trim().endsWith('*')) {
          return (
            <p key={idx} className="text-xs italic text-muted-foreground border-t pt-2 mt-2">
              {paragraph.trim().slice(1, -1)}
            </p>
          );
        }

        // Regular paragraph - preserve single newlines
        return (
          <p key={idx} className="whitespace-pre-wrap">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}

function formatTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

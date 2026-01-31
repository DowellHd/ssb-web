'use client';

import { AlertTriangle, Bot, User, BookOpen, HelpCircle, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/stores/assistant-store';
import type { Intent } from '@/lib/assistant/knowledge-base';

interface ChatMessageProps {
  message: Message;
}

const INTENT_CONFIG: Record<Intent, { icon: typeof BookOpen; label: string; color: string }> = {
  definition: { icon: BookOpen, label: 'Definition', color: 'text-blue-500' },
  how_to: { icon: HelpCircle, label: 'How-To', color: 'text-green-500' },
  troubleshoot: { icon: Wrench, label: 'Troubleshooting', color: 'text-orange-500' },
  fallback: { icon: HelpCircle, label: '', color: 'text-muted-foreground' },
};

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
          'flex-1 max-w-[85%]',
          isUser && 'flex flex-col items-end'
        )}
      >
        {/* Matched topic badge (for assistant messages) */}
        {!isUser && message.matchedTopic && message.intent && message.intent !== 'fallback' && (
          <TopicBadge topic={message.matchedTopic} intent={message.intent} />
        )}

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
      </div>
    </div>
  );
}

function TopicBadge({ topic, intent }: { topic: string; intent: Intent }) {
  const config = INTENT_CONFIG[intent];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center gap-1 mb-1 text-[10px]',
      config.color
    )}>
      <Icon className="h-3 w-3" />
      <span className="font-medium">{topic}</span>
      {config.label && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{config.label}</span>
        </>
      )}
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
        // Check if it's a horizontal rule
        if (paragraph.trim() === '---') {
          return <hr key={idx} className="border-t border-border my-2" />;
        }

        // Check if it's a list
        const lines = paragraph.split('\n');
        const isUnorderedList = lines.every((line) => line.trim().startsWith('- ') || line.trim() === '');
        const isOrderedList = lines.every((line) => /^\d+\.\s/.test(line.trim()) || line.trim() === '');

        if (isUnorderedList && lines.filter(l => l.trim()).length > 0) {
          return (
            <ul key={idx} className="list-disc list-inside space-y-1 ml-1">
              {lines
                .filter((line) => line.trim().startsWith('- '))
                .map((line, lineIdx) => (
                  <li key={lineIdx}>
                    <InlineMarkdown text={line.trim().substring(2)} />
                  </li>
                ))}
            </ul>
          );
        }

        if (isOrderedList && lines.filter(l => l.trim()).length > 0) {
          return (
            <ol key={idx} className="list-decimal list-inside space-y-1 ml-1">
              {lines
                .filter((line) => /^\d+\.\s/.test(line.trim()))
                .map((line, lineIdx) => (
                  <li key={lineIdx}>
                    <InlineMarkdown text={line.trim().replace(/^\d+\.\s/, '')} />
                  </li>
                ))}
            </ol>
          );
        }

        // Check if it's an italic disclaimer block (starts and ends with *)
        if (paragraph.trim().startsWith('*') && paragraph.trim().endsWith('*') && !paragraph.trim().startsWith('**')) {
          return (
            <p key={idx} className="text-xs italic text-muted-foreground border-t pt-2 mt-2">
              {paragraph.trim().slice(1, -1)}
            </p>
          );
        }

        // Check for section headers (lines starting with **)
        if (paragraph.trim().startsWith('**') && paragraph.includes(':**')) {
          const headerMatch = paragraph.match(/^\*\*([^*]+)\*\*:?(.*)$/s);
          if (headerMatch) {
            return (
              <div key={idx}>
                <p className="font-semibold">{headerMatch[1]}</p>
                {headerMatch[2] && (
                  <p className="whitespace-pre-wrap">
                    <InlineMarkdown text={headerMatch[2].trim()} />
                  </p>
                )}
              </div>
            );
          }
        }

        // Regular paragraph - preserve single newlines
        return (
          <p key={idx} className="whitespace-pre-wrap">
            <InlineMarkdown text={paragraph} />
          </p>
        );
      })}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  // Process inline markdown: **bold**, *italic*, `code`
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let keyCounter = 0;

  while (remaining.length > 0) {
    // Check for bold (**text**)
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={keyCounter++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Check for code (`text`)
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={keyCounter++} className="bg-background/50 px-1 py-0.5 rounded text-xs">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Check for italic (*text*) - single asterisk not followed by another
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch && !remaining.startsWith('**')) {
      parts.push(<em key={keyCounter++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Regular text until next markdown token
    const nextToken = remaining.search(/\*|`/);
    if (nextToken === -1) {
      parts.push(remaining);
      break;
    } else if (nextToken === 0) {
      // Single char that didn't match any pattern, add it and continue
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextToken));
      remaining = remaining.slice(nextToken);
    }
  }

  return <>{parts}</>;
}

function formatTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

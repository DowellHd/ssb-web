/**
 * Zustand store for SSB Assistant chat state.
 *
 * Uses local rule-based assistant - no external API calls.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { processMessage, getQuickPrompts } from '@/lib/assistant/local-assistant';
import { DISCLAIMER } from '@/lib/assistant/knowledge-base';

// ============================================================================
// Types
// ============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  topicId?: string | null;
  relatedTopics?: string[];
  isError?: boolean;
}

interface AssistantState {
  // UI State
  isOpen: boolean;
  isLoading: boolean;

  // Conversation State
  messages: Message[];

  // Error State
  error: string | null;

  // Actions
  toggle: () => void;
  open: () => void;
  close: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  setError: (error: string | null) => void;
}

// ============================================================================
// Quick Prompts
// ============================================================================

export const QUICK_PROMPTS = getQuickPrompts();

// ============================================================================
// Disclaimer
// ============================================================================

export { DISCLAIMER };

// ============================================================================
// Helper Functions
// ============================================================================

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Simulate typing delay for more natural feel
 */
function getTypingDelay(responseLength: number): number {
  // Base delay + variable based on response length
  // Min 300ms, Max 1200ms
  const baseDelay = 300;
  const variableDelay = Math.min(responseLength * 2, 900);
  return baseDelay + variableDelay;
}

// ============================================================================
// Store
// ============================================================================

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      // Initial State
      isOpen: false,
      isLoading: false,
      messages: [],
      error: null,

      // Toggle chat panel
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      // Open chat panel
      open: () => set({ isOpen: true }),

      // Close chat panel
      close: () => set({ isOpen: false }),

      // Send a message (local processing - no API calls)
      sendMessage: async (content: string) => {
        const { messages } = get();

        // Add user message to state immediately
        const userMessage: Message = {
          id: generateMessageId(),
          role: 'user',
          content,
          timestamp: new Date(),
        };

        set({
          messages: [...messages, userMessage],
          isLoading: true,
          error: null,
        });

        try {
          // Process locally - no API call
          const response = processMessage(content);

          // Simulate brief typing delay for natural feel
          const delay = getTypingDelay(response.reply.length);
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Add assistant response
          const assistantMessage: Message = {
            id: generateMessageId(),
            role: 'assistant',
            content: response.reply,
            timestamp: new Date(),
            topicId: response.topicId,
            relatedTopics: response.relatedTopics,
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isLoading: false,
          }));
        } catch (error: unknown) {
          // Should rarely happen since processing is local
          const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred.';

          const assistantErrorMessage: Message = {
            id: generateMessageId(),
            role: 'assistant',
            content: `I encountered an error processing your message. Please try rephrasing your question.\n\nError: ${errorMessage}`,
            timestamp: new Date(),
            isError: true,
          };

          set((state) => ({
            messages: [...state.messages, assistantErrorMessage],
            isLoading: false,
            error: errorMessage,
          }));
        }
      },

      // Clear chat history (local only - no server call needed)
      clearChat: () => {
        set({
          messages: [],
          error: null,
        });
      },

      // Set error state
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'ssb-assistant-v2',
      partialize: (state) => ({
        // Only persist messages (keep history across sessions)
        messages: state.messages,
      }),
      // Handle storage errors gracefully
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate assistant state:', error);
          // Continue with empty state - don't crash
        }
      },
    }
  )
);

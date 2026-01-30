/**
 * Zustand store for SSB Assistant chat state.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendMessage, clearThread, ChatResponse, Citation } from '@/lib/api/assistant';

// ============================================================================
// Types
// ============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  safety_flags?: string[];
  isError?: boolean;
}

interface AssistantState {
  // UI State
  isOpen: boolean;
  isLoading: boolean;

  // Conversation State
  threadId: string | null;
  messages: Message[];

  // Error State
  error: string | null;

  // Actions
  toggle: () => void;
  open: () => void;
  close: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => Promise<void>;
  setError: (error: string | null) => void;
}

// ============================================================================
// Quick Prompts
// ============================================================================

export const QUICK_PROMPTS = [
  'What is a market regime?',
  'Explain VaR in simple terms',
  'How do entitlements work?',
  'How do I use backtesting?',
  'What is paper trading?',
];

// ============================================================================
// Helper Functions
// ============================================================================

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      threadId: null,
      messages: [],
      error: null,

      // Toggle chat panel
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      // Open chat panel
      open: () => set({ isOpen: true }),

      // Close chat panel
      close: () => set({ isOpen: false }),

      // Send a message
      sendMessage: async (content: string) => {
        const { threadId, messages } = get();

        // Add user message to state immediately (optimistic update)
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
          // Call API
          const response = await sendMessage({
            message: content,
            thread_id: threadId,
          });

          // Add assistant response
          const assistantMessage: Message = {
            id: generateMessageId(),
            role: 'assistant',
            content: response.reply,
            timestamp: new Date(),
            citations: response.citations,
            safety_flags: response.safety_flags,
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            threadId: response.thread_id,
            isLoading: false,
          }));
        } catch (error: any) {
          // Extract error detail from backend response
          const errorDetail =
            error?.response?.data?.detail ||
            error?.message ||
            'An unexpected error occurred. Please try again.';

          // Add error message with backend detail
          const errorMessage: Message = {
            id: generateMessageId(),
            role: 'assistant',
            content: errorDetail,
            timestamp: new Date(),
            isError: true,
          };

          set((state) => ({
            messages: [...state.messages, errorMessage],
            isLoading: false,
            error: errorDetail,
          }));
        }
      },

      // Clear chat history
      clearChat: async () => {
        const { threadId } = get();

        // Clear local state first
        set({
          messages: [],
          threadId: null,
          error: null,
        });

        // Clear on server if we have a thread
        if (threadId) {
          try {
            await clearThread(threadId);
          } catch (error) {
            // Silently ignore - local state is already cleared
            console.warn('Failed to clear thread on server:', error);
          }
        }
      },

      // Set error state
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'ssb-assistant',
      partialize: (state) => ({
        // Only persist these fields
        threadId: state.threadId,
        messages: state.messages,
      }),
    }
  )
);

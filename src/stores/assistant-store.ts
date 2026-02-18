/**
 * Zustand store for SSB Assistant chat state.
 *
 * Uses local rule-based assistant with:
 * - Page-aware context
 * - Intent detection
 * - Query normalization
 * - No external API calls
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  processMessage,
  getQuickPrompts,
  type AssistantContext,
  type AssistantResponse,
} from '@/lib/assistant/local-assistant';
import { DISCLAIMER, type Intent } from '@/lib/assistant/knowledge-base';
import { useScenarioModeStore } from '@/stores/scenario-mode-store';

// ============================================================================
// Types
// ============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  topicId?: string | null;
  matchedTopic?: string;
  intent?: Intent;
  relatedTopics?: string[];
  suggestions?: string[];
  isError?: boolean;
}

interface AssistantState {
  // UI State
  isOpen: boolean;
  isLoading: boolean;

  // Context State
  currentPage: string;
  selectedSymbol?: string;
  userTier?: 'free' | 'starter' | 'pro' | 'institutional' | 'founder' | 'full_access';

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

  // Context Actions
  setCurrentPage: (page: string) => void;
  setSelectedSymbol: (symbol: string | undefined) => void;
  setUserTier: (tier: 'free' | 'starter' | 'pro' | 'institutional' | 'founder' | 'full_access') => void;

  // Prompt Helpers
  getQuickPrompts: () => string[];
}

// ============================================================================
// Disclaimer Export
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
  // Min 200ms, Max 800ms
  const baseDelay = 200;
  const variableDelay = Math.min(responseLength * 1.5, 600);
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
      currentPage: '/app',
      selectedSymbol: undefined,
      userTier: undefined,
      messages: [],
      error: null,

      // Toggle chat panel
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      // Open chat panel
      open: () => set({ isOpen: true }),

      // Close chat panel
      close: () => set({ isOpen: false }),

      // Set current page (for context-aware responses)
      setCurrentPage: (page: string) => set({ currentPage: page }),

      // Set selected symbol (for paper trading context)
      setSelectedSymbol: (symbol: string | undefined) => set({ selectedSymbol: symbol }),

      // Set user tier
      setUserTier: (tier: 'free' | 'starter' | 'pro' | 'institutional' | 'founder' | 'full_access') => set({ userTier: tier }),

      // Get quick prompts for current page
      getQuickPrompts: () => {
        const { currentPage } = get();
        return getQuickPrompts(currentPage);
      },

      // Send a message (local processing - no API calls)
      sendMessage: async (content: string) => {
        const { messages, currentPage, selectedSymbol, userTier } = get();

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
          // Build context from current state
          const context: AssistantContext = {
            page: currentPage,
            selectedSymbol,
            tier: userTier,
            isScenarioMode: useScenarioModeStore.getState().isEnabled,
          };

          // Process locally with context - no API call
          const response: AssistantResponse = processMessage(content, context);

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
            matchedTopic: response.matchedTopic,
            intent: response.intent,
            relatedTopics: response.relatedTopics,
            suggestions: response.suggestions,
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
      name: 'ssb-assistant-v3',
      partialize: (state) => ({
        // Persist messages and context
        messages: state.messages,
        currentPage: state.currentPage,
        userTier: state.userTier,
      }),
      // Handle storage errors gracefully
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('Failed to rehydrate assistant state:', error);
          // Continue with empty state - don't crash
        }
      },
    }
  )
);

// ============================================================================
// Hooks for Context Updates
// ============================================================================

/**
 * Hook to sync page context with assistant store.
 * Call this in your layout or page components.
 */
export function useAssistantPageSync(page: string) {
  const setCurrentPage = useAssistantStore((state) => state.setCurrentPage);

  // Update on mount and when page changes
  if (typeof window !== 'undefined') {
    const currentPage = useAssistantStore.getState().currentPage;
    if (currentPage !== page) {
      setCurrentPage(page);
    }
  }
}

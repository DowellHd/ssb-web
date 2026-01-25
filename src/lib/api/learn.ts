/**
 * Learn API functions for educational content and glossary.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export type ContentCategory =
  | 'fundamentals'
  | 'technical_analysis'
  | 'risk_management'
  | 'portfolio_theory'
  | 'market_mechanics'
  | 'derivatives'
  | 'behavioral_finance'
  | 'quantitative';

export type ContentDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ContentFormat = 'article' | 'video' | 'quiz' | 'interactive';

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: ContentCategory;
  difficulty: ContentDifficulty;
  related_terms: string[];
  example?: string;
  see_also: string[];
}

export interface GlossaryListResponse {
  terms: GlossaryTerm[];
  total_count: number;
  categories: string[];
  letters: string[];
}

export interface GlossarySearchResponse {
  terms: GlossaryTerm[];
  query: string;
  total_matches: number;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  difficulty: ContentDifficulty;
  format: ContentFormat;
  duration_minutes: number;
  content: string;
  key_takeaways: string[];
  prerequisites: string[];
  is_premium: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleProgress {
  module_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  progress_percent: number;
  quiz_score?: number;
}

export interface LearningModuleListResponse {
  modules: LearningModule[];
  total_count: number;
  categories: string[];
  user_progress?: Record<string, number>;
}

export interface LearningModuleDetailResponse {
  module: LearningModule;
  next_module?: string;
  previous_module?: string;
  user_progress?: ModuleProgress;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: ContentDifficulty;
  modules: string[];
  estimated_hours: number;
  is_premium: boolean;
}

export interface LearningPathListResponse {
  paths: LearningPath[];
  total_count: number;
}

export interface LearningPathDetailResponse {
  path: LearningPath;
  modules: LearningModule[];
  user_progress_percent?: number;
}

export interface LearnEntitlements {
  can_access_learn: boolean;
  can_access_premium_modules: boolean;
  can_track_progress: boolean;
  available_categories: string[];
  max_difficulty: string;
  tier: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get learn entitlements for the current user.
 */
export async function getLearnEntitlements(): Promise<LearnEntitlements> {
  const response = await apiClient.get('/learn/entitlements');
  return response.data;
}

// ----------------------------------------------------------------------------
// Glossary
// ----------------------------------------------------------------------------

/**
 * List glossary terms with optional filtering.
 */
export async function listGlossaryTerms(params?: {
  category?: ContentCategory;
  difficulty?: ContentDifficulty;
  letter?: string;
}): Promise<GlossaryListResponse> {
  const response = await apiClient.get('/learn/glossary', { params });
  return response.data;
}

/**
 * Search glossary terms.
 */
export async function searchGlossary(query: string): Promise<GlossarySearchResponse> {
  const response = await apiClient.get('/learn/glossary/search', { params: { q: query } });
  return response.data;
}

/**
 * Get a single glossary term by ID.
 */
export async function getGlossaryTerm(termId: string): Promise<GlossaryTerm> {
  const response = await apiClient.get(`/learn/glossary/${termId}`);
  return response.data;
}

// ----------------------------------------------------------------------------
// Learning Modules
// ----------------------------------------------------------------------------

/**
 * List learning modules with optional filtering.
 */
export async function listLearningModules(params?: {
  category?: ContentCategory;
  difficulty?: ContentDifficulty;
}): Promise<LearningModuleListResponse> {
  const response = await apiClient.get('/learn/modules', { params });
  return response.data;
}

/**
 * Get a single learning module by ID.
 */
export async function getLearningModule(moduleId: string): Promise<LearningModuleDetailResponse> {
  const response = await apiClient.get(`/learn/modules/${moduleId}`);
  return response.data;
}

// ----------------------------------------------------------------------------
// Learning Paths
// ----------------------------------------------------------------------------

/**
 * List learning paths.
 */
export async function listLearningPaths(): Promise<LearningPathListResponse> {
  const response = await apiClient.get('/learn/paths');
  return response.data;
}

/**
 * Get a single learning path with its modules.
 */
export async function getLearningPath(pathId: string): Promise<LearningPathDetailResponse> {
  const response = await apiClient.get(`/learn/paths/${pathId}`);
  return response.data;
}

// ----------------------------------------------------------------------------
// Categories
// ----------------------------------------------------------------------------

/**
 * Get available learning categories for the current user.
 */
export async function getLearnCategories(): Promise<string[]> {
  const response = await apiClient.get('/learn/meta/categories');
  return response.data;
}

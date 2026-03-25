/**
 * Community and social trading API client.
 */
import { apiClient } from '../api-client';

// ============================================================================
// Types
// ============================================================================

export interface SocialProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_public: boolean;
  followers_count: number;
  following_count: number;
  trade_ideas_count: number;
  created_at: string;
  updated_at: string;
}

export interface FollowStatus {
  is_following: boolean;
}

export interface TradeIdea {
  id: string;
  user_id: string;
  symbol: string;
  direction: 'long' | 'short';
  thesis: string;
  target_price: number | null;
  stop_loss: number | null;
  entry_price: number | null;
  time_horizon: string;
  status: string;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  author_display_name: string | null;
  viewer_has_liked: boolean;
}

export interface TradeIdeaListResponse {
  ideas: TradeIdea[];
  total: number;
  page: number;
  page_size: number;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  post_type: string;
  title: string | null;
  body: string;
  ticker_symbols: string[] | null;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author_display_name: string | null;
  viewer_has_liked: boolean;
}

export interface CommunityPostListResponse {
  posts: CommunityPost[];
  total: number;
  page: number;
  page_size: number;
}

export interface SocialComment {
  id: string;
  user_id: string;
  parent_type: string;
  parent_id: string;
  body: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author_display_name: string | null;
}

export interface ReactionToggleResponse {
  reacted: boolean;
  likes_count: number;
}

export interface CommunityWatchlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  symbols: string[];
  is_public: boolean;
  followers_count: number;
  created_at: string;
  updated_at: string;
  owner_display_name: string | null;
  viewer_follows: boolean;
}

export interface CommunityWatchlistListResponse {
  watchlists: CommunityWatchlist[];
  total: number;
}

export interface StockRating {
  id: string;
  user_id: string;
  symbol: string;
  rating: number;
  rationale: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockRatingSummary {
  symbol: string;
  average_rating: number;
  total_ratings: number;
  distribution: Record<string, number>;
  viewer_rating: number | null;
}

export interface InvestmentClub {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  member_count: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  viewer_role: string | null;
}

export interface InvestmentClubListResponse {
  clubs: InvestmentClub[];
  total: number;
}

export interface ClubMember {
  user_id: string;
  role: string;
  joined_at: string;
  display_name: string | null;
}

export interface CommunityEntitlements {
  can_access_community: boolean;
  can_post: boolean;
  can_create_trade_ideas: boolean;
  can_create_watchlists: boolean;
  can_join_clubs: boolean;
  can_rate_stocks: boolean;
  tier: string;
}

// ============================================================================
// API Functions
// ============================================================================

// --- Entitlements ---

export async function getCommunityEntitlements(): Promise<CommunityEntitlements> {
  const res = await apiClient.get('/community/entitlements');
  return res.data;
}

// --- Profiles ---

export async function getMyProfile(): Promise<SocialProfile> {
  const res = await apiClient.get('/community/profiles/me');
  return res.data;
}

export async function updateMyProfile(data: {
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  is_public?: boolean;
}): Promise<SocialProfile> {
  const res = await apiClient.put('/community/profiles/me', data);
  return res.data;
}

export async function getUserProfile(userId: string): Promise<SocialProfile> {
  const res = await apiClient.get(`/community/profiles/${userId}`);
  return res.data;
}

// --- Follows ---

export async function followUser(userId: string): Promise<FollowStatus> {
  const res = await apiClient.post(`/community/follows/${userId}`);
  return res.data;
}

export async function unfollowUser(userId: string): Promise<FollowStatus> {
  const res = await apiClient.delete(`/community/follows/${userId}`);
  return res.data;
}

export async function getFollowStatus(userId: string): Promise<FollowStatus> {
  const res = await apiClient.get(`/community/follows/${userId}/status`);
  return res.data;
}

// --- Trade Ideas ---

export async function listTradeIdeas(params?: {
  symbol?: string;
  status?: string;
  user_id?: string;
  page?: number;
  page_size?: number;
}): Promise<TradeIdeaListResponse> {
  const res = await apiClient.get('/community/ideas', { params });
  return res.data;
}

export async function getTradeIdea(ideaId: string): Promise<TradeIdea> {
  const res = await apiClient.get(`/community/ideas/${ideaId}`);
  return res.data;
}

export async function createTradeIdea(data: {
  symbol: string;
  direction: 'long' | 'short';
  thesis: string;
  target_price?: number | null;
  stop_loss?: number | null;
  entry_price?: number | null;
  time_horizon?: string;
  tags?: string[] | null;
}): Promise<TradeIdea> {
  const res = await apiClient.post('/community/ideas', data);
  return res.data;
}

export async function updateTradeIdea(
  ideaId: string,
  data: {
    thesis?: string;
    target_price?: number | null;
    stop_loss?: number | null;
    status?: string;
    tags?: string[] | null;
  }
): Promise<TradeIdea> {
  const res = await apiClient.put(`/community/ideas/${ideaId}`, data);
  return res.data;
}

export async function deleteTradeIdea(ideaId: string): Promise<void> {
  await apiClient.delete(`/community/ideas/${ideaId}`);
}

// --- Posts ---

export async function listCommunityPosts(params?: {
  post_type?: string;
  ticker?: string;
  user_id?: string;
  page?: number;
  page_size?: number;
}): Promise<CommunityPostListResponse> {
  const res = await apiClient.get('/community/posts', { params });
  return res.data;
}

export async function getCommunityPost(postId: string): Promise<CommunityPost> {
  const res = await apiClient.get(`/community/posts/${postId}`);
  return res.data;
}

export async function createCommunityPost(data: {
  post_type?: string;
  title?: string | null;
  body: string;
  ticker_symbols?: string[] | null;
  tags?: string[] | null;
}): Promise<CommunityPost> {
  const res = await apiClient.post('/community/posts', data);
  return res.data;
}

export async function updateCommunityPost(
  postId: string,
  data: {
    title?: string | null;
    body?: string;
    ticker_symbols?: string[] | null;
    tags?: string[] | null;
  }
): Promise<CommunityPost> {
  const res = await apiClient.put(`/community/posts/${postId}`, data);
  return res.data;
}

export async function deleteCommunityPost(postId: string): Promise<void> {
  await apiClient.delete(`/community/posts/${postId}`);
}

// --- Comments ---

export async function listComments(params: {
  parent_type: string;
  parent_id: string;
  page?: number;
  page_size?: number;
}): Promise<SocialComment[]> {
  const res = await apiClient.get('/community/comments', { params });
  return res.data;
}

export async function createComment(data: {
  parent_type: string;
  parent_id: string;
  body: string;
}): Promise<SocialComment> {
  const res = await apiClient.post('/community/comments', data);
  return res.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`/community/comments/${commentId}`);
}

// --- Reactions ---

export async function toggleReaction(data: {
  target_type: string;
  target_id: string;
  reaction_type?: string;
}): Promise<ReactionToggleResponse> {
  const res = await apiClient.post('/community/reactions', {
    reaction_type: 'like',
    ...data,
  });
  return res.data;
}

// --- Watchlists ---

export async function listCommunityWatchlists(params?: {
  user_id?: string;
  page?: number;
  page_size?: number;
}): Promise<CommunityWatchlistListResponse> {
  const res = await apiClient.get('/community/watchlists', { params });
  return res.data;
}

export async function getCommunityWatchlist(watchlistId: string): Promise<CommunityWatchlist> {
  const res = await apiClient.get(`/community/watchlists/${watchlistId}`);
  return res.data;
}

export async function createCommunityWatchlist(data: {
  name: string;
  description?: string | null;
  symbols?: string[];
  is_public?: boolean;
}): Promise<CommunityWatchlist> {
  const res = await apiClient.post('/community/watchlists', data);
  return res.data;
}

export async function updateCommunityWatchlist(
  watchlistId: string,
  data: {
    name?: string;
    description?: string | null;
    symbols?: string[];
    is_public?: boolean;
  }
): Promise<CommunityWatchlist> {
  const res = await apiClient.put(`/community/watchlists/${watchlistId}`, data);
  return res.data;
}

export async function deleteCommunityWatchlist(watchlistId: string): Promise<void> {
  await apiClient.delete(`/community/watchlists/${watchlistId}`);
}

export async function followWatchlist(watchlistId: string): Promise<void> {
  await apiClient.post(`/community/watchlists/${watchlistId}/follow`);
}

export async function unfollowWatchlist(watchlistId: string): Promise<void> {
  await apiClient.delete(`/community/watchlists/${watchlistId}/follow`);
}

// --- Stock Ratings ---

export async function submitStockRating(data: {
  symbol: string;
  rating: number;
  rationale?: string | null;
}): Promise<StockRating> {
  const res = await apiClient.post('/community/ratings', data);
  return res.data;
}

export async function getSymbolRatings(symbol: string): Promise<StockRatingSummary> {
  const res = await apiClient.get(`/community/ratings/${symbol}`);
  return res.data;
}

// --- Investment Clubs ---

export async function listInvestmentClubs(params?: {
  page?: number;
  page_size?: number;
}): Promise<InvestmentClubListResponse> {
  const res = await apiClient.get('/community/clubs', { params });
  return res.data;
}

export async function getInvestmentClub(clubId: string): Promise<InvestmentClub> {
  const res = await apiClient.get(`/community/clubs/${clubId}`);
  return res.data;
}

export async function createInvestmentClub(data: {
  name: string;
  description?: string | null;
  is_private?: boolean;
  tags?: string[] | null;
}): Promise<InvestmentClub> {
  const res = await apiClient.post('/community/clubs', data);
  return res.data;
}

export async function updateInvestmentClub(
  clubId: string,
  data: {
    name?: string;
    description?: string | null;
    is_private?: boolean;
    tags?: string[] | null;
  }
): Promise<InvestmentClub> {
  const res = await apiClient.put(`/community/clubs/${clubId}`, data);
  return res.data;
}

export async function joinClub(clubId: string): Promise<void> {
  await apiClient.post(`/community/clubs/${clubId}/join`);
}

export async function leaveClub(clubId: string): Promise<void> {
  await apiClient.delete(`/community/clubs/${clubId}/leave`);
}

export async function listClubMembers(clubId: string): Promise<ClubMember[]> {
  const res = await apiClient.get(`/community/clubs/${clubId}/members`);
  return res.data;
}

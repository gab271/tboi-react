/**
 * Builds Hooks
 * React Query hooks for the builds system
 */
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import * as buildsApi from './api';

// ============================================================
// QUERY KEYS
// ============================================================
export const BUILDS_KEYS = {
  all: ['builds'],
  feed: (filters) => ['builds', 'feed', filters],
  detail: (id) => ['builds', 'detail', id],
  tags: (id) => ['builds', 'tags', id],
  items: (id) => ['builds', 'items', id],
  media: (id) => ['builds', 'media', id],
  comments: (id) => ['builds', 'comments', id],
  userVotes: ['builds', 'user-votes'],
  userSaves: ['builds', 'user-saves'],
  popularTags: ['builds', 'popular-tags'],
  blockedUsers: ['user', 'blocked'],
};

// ============================================================
// FEED HOOKS
// ============================================================

/**
 * Infinite query for builds feed with cursor-based pagination
 */
export function useBuildsFeed(filters = {}) {
  return useInfiniteQuery({
    queryKey: BUILDS_KEYS.feed(filters),
    queryFn: async ({ pageParam }) => {
      const data = await buildsApi.fetchBuildsFeed({
        ...filters,
        cursor: pageParam?.cursor || null,
        cursorScore: pageParam?.cursorScore || null,
        limit: 20,
      });
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 20) return undefined;
      
      const lastItem = lastPage[lastPage.length - 1];
      return {
        cursor: lastItem.created_at,
        cursorScore: lastItem.score,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

/**
 * Single build detail query
 */
export function useBuildDetail(buildId) {
  return useQuery({
    queryKey: BUILDS_KEYS.detail(buildId),
    queryFn: () => buildsApi.fetchBuildDetail(buildId),
    enabled: !!buildId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Build tags query
 */
export function useBuildTags(buildId) {
  return useQuery({
    queryKey: BUILDS_KEYS.tags(buildId),
    queryFn: () => buildsApi.fetchBuildTags(buildId),
    enabled: !!buildId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Build items query
 */
export function useBuildItems(buildId) {
  return useQuery({
    queryKey: BUILDS_KEYS.items(buildId),
    queryFn: () => buildsApi.fetchBuildItems(buildId),
    enabled: !!buildId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Build media query
 */
export function useBuildMedia(buildId) {
  return useQuery({
    queryKey: BUILDS_KEYS.media(buildId),
    queryFn: () => buildsApi.fetchBuildMedia(buildId),
    enabled: !!buildId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Build comments query
 */
export function useBuildComments(buildId) {
  return useQuery({
    queryKey: BUILDS_KEYS.comments(buildId),
    queryFn: () => buildsApi.fetchBuildComments(buildId),
    enabled: !!buildId,
    staleTime: 1000 * 30, // 30 seconds for comments
  });
}

/**
 * Popular tags query
 */
export function usePopularTags() {
  return useQuery({
    queryKey: BUILDS_KEYS.popularTags,
    queryFn: () => buildsApi.getPopularTags(20),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ============================================================
// CREATE / UPDATE / DELETE MUTATIONS
// ============================================================

/**
 * Create build mutation
 */
export function useCreateBuild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: buildsApi.createBuildPost,
    onSuccess: () => {
      // Invalidate feed queries
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.all });
    },
  });
}

/**
 * Update build mutation
 */
export function useUpdateBuild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ buildId, updates }) => buildsApi.updateBuildPost(buildId, updates),
    onSuccess: (_, { buildId }) => {
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.detail(buildId) });
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.all });
    },
  });
}

/**
 * Delete build mutation
 */
export function useDeleteBuild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: buildsApi.deleteBuildPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.all });
    },
  });
}

// ============================================================
// VOTE & SAVE MUTATIONS
// ============================================================

/**
 * Toggle vote mutation with optimistic update
 */
export function useToggleVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, value = 1 }) => buildsApi.toggleBuildVote(postId, value),
    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: BUILDS_KEYS.detail(postId) });
      
      // Get previous value
      const previousDetail = queryClient.getQueryData(BUILDS_KEYS.detail(postId));
      
      // Optimistically update
      if (previousDetail) {
        queryClient.setQueryData(BUILDS_KEYS.detail(postId), {
          ...previousDetail,
          user_voted: !previousDetail.user_voted,
          score: previousDetail.user_voted 
            ? previousDetail.score - 1 
            : previousDetail.score + 1,
        });
      }
      
      return { previousDetail };
    },
    onError: (err, { postId }, context) => {
      // Rollback on error
      if (context?.previousDetail) {
        queryClient.setQueryData(BUILDS_KEYS.detail(postId), context.previousDetail);
      }
    },
    onSettled: (_, __, { postId }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.detail(postId) });
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.feed({}) });
    },
  });
}

/**
 * Toggle save mutation with optimistic update
 */
export function useToggleSave() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: buildsApi.toggleBuildSave,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: BUILDS_KEYS.detail(postId) });
      
      const previousDetail = queryClient.getQueryData(BUILDS_KEYS.detail(postId));
      
      if (previousDetail) {
        queryClient.setQueryData(BUILDS_KEYS.detail(postId), {
          ...previousDetail,
          user_saved: !previousDetail.user_saved,
          saves_count: previousDetail.user_saved 
            ? previousDetail.saves_count - 1 
            : previousDetail.saves_count + 1,
        });
      }
      
      return { previousDetail };
    },
    onError: (err, postId, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(BUILDS_KEYS.detail(postId), context.previousDetail);
      }
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.detail(postId) });
    },
  });
}

// ============================================================
// COMMENTS MUTATIONS
// ============================================================

/**
 * Add comment mutation
 */
export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, content, parentId }) => 
      buildsApi.addBuildComment(postId, content, parentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.comments(postId) });
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.detail(postId) });
    },
  });
}

/**
 * Delete comment mutation
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, postId }) => buildsApi.deleteBuildComment(commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.comments(postId) });
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.detail(postId) });
    },
  });
}

// ============================================================
// REPORT & BLOCK MUTATIONS
// ============================================================

/**
 * Report content mutation
 */
export function useReport() {
  return useMutation({
    mutationFn: ({ targetType, targetId, reason, details }) =>
      buildsApi.reportContent(targetType, targetId, reason, details),
  });
}

/**
 * Block user mutation
 */
export function useBlockUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: buildsApi.blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.blockedUsers });
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.all });
    },
  });
}

/**
 * Unblock user mutation
 */
export function useUnblockUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: buildsApi.unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.blockedUsers });
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.all });
    },
  });
}

/**
 * Get blocked users query
 */
export function useBlockedUsers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: BUILDS_KEYS.blockedUsers,
    queryFn: buildsApi.getBlockedUsers,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================
// MEDIA MUTATIONS
// ============================================================

/**
 * Upload media mutation
 */
export function useUploadMedia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, file }) => buildsApi.uploadBuildMedia(postId, file),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.media(postId) });
    },
  });
}

/**
 * Delete media mutation
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ mediaId, storagePath, postId }) => 
      buildsApi.deleteBuildMedia(mediaId, storagePath),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: BUILDS_KEYS.media(postId) });
    },
  });
}

// ============================================================
// SEARCH HOOKS
// ============================================================

/**
 * Search items for autocomplete
 */
export function useSearchItems(query, enabled = true) {
  return useQuery({
    queryKey: ['items', 'search', query],
    queryFn: () => buildsApi.searchItemsForBuild(query, 10),
    enabled: enabled && query?.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================
// UTILITY HOOK - Auth-Gated Actions
// ============================================================

/**
 * Hook that returns gated action functions
 * Actions are no-op if user is not authenticated
 */
export function useGatedActions(onLoginRequired) {
  const { user } = useAuth();
  const toggleVote = useToggleVote();
  const toggleSave = useToggleSave();
  const addComment = useAddComment();
  const report = useReport();
  const blockUser = useBlockUser();

  const gateAction = (action) => (...args) => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    return action(...args);
  };

  return {
    isAuthenticated: !!user,
    vote: gateAction((postId, value) => toggleVote.mutate({ postId, value })),
    save: gateAction((postId) => toggleSave.mutate(postId)),
    comment: gateAction((postId, content, parentId) => 
      addComment.mutate({ postId, content, parentId })),
    reportContent: gateAction((targetType, targetId, reason, details) => 
      report.mutate({ targetType, targetId, reason, details })),
    block: gateAction((userId) => blockUser.mutate(userId)),
    isVoting: toggleVote.isPending,
    isSaving: toggleSave.isPending,
    isCommenting: addComment.isPending,
    isReporting: report.isPending,
  };
}

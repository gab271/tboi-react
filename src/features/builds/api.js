/**
 * Builds API Service
 * Handles all Supabase operations for the builds system
 */
import { supabase } from '../../lib/supabaseClient';

// ============================================================
// FEED & LIST QUERIES
// ============================================================

/**
 * Fetch builds feed with filters and cursor-based pagination
 * Uses direct queries as fallback when RPC is not available
 */
export const fetchBuildsFeed = async ({
  sort = 'new',
  character = null,
  gameVersion = null,
  difficulty = null,
  buildType = null,
  tags = null,
  search = null,
  cursor = null,
  cursorScore = null,
  limit = 20,
}) => {
  // Try RPC first
  try {
    const { data, error } = await supabase.rpc('get_builds_feed', {
      p_sort: sort,
      p_character: character,
      p_game_version: gameVersion,
      p_difficulty: difficulty,
      p_build_type: buildType,
      p_tags: tags,
      p_search: search,
      p_cursor: cursor,
      p_cursor_score: cursorScore,
      p_limit: limit,
    });

    if (!error && data) {
      return data;
    }
  } catch (rpcError) {
    console.warn('RPC get_builds_feed not available, using fallback:', rpcError);
  }

  // Fallback: Direct query
  let query = supabase
    .from('build_posts')
    .select('*')
    .eq('status', 'published')
    .eq('is_hidden', false);

  // Apply filters
  if (character) {
    query = query.eq('character_slug', character);
  }
  if (gameVersion) {
    query = query.eq('game_version', gameVersion);
  }
  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  if (buildType) {
    query = query.eq('build_type', buildType);
  }
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  // Apply sorting and cursor
  if (sort === 'new') {
    query = query.order('created_at', { ascending: false });
    if (cursor) {
      query = query.lt('created_at', cursor);
    }
  } else if (sort === 'top') {
    query = query.order('score', { ascending: false }).order('created_at', { ascending: false });
    if (cursorScore !== null && cursor) {
      query = query.or(`score.lt.${cursorScore},and(score.eq.${cursorScore},created_at.lt.${cursor})`);
    }
  } else if (sort === 'hot') {
    // Simplified hot sorting - just use score for now
    query = query.order('score', { ascending: false }).order('created_at', { ascending: false });
  } else if (sort === 'discussed') {
    query = query.order('comments_count', { ascending: false }).order('created_at', { ascending: false });
  }

  query = query.limit(limit);

  const { data: posts, error: postsError } = await query;

  if (postsError) throw postsError;
  if (!posts || posts.length === 0) return [];

  // Fetch author profiles
  const authorIds = [...new Set(posts.map(p => p.author_id))];
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', authorIds);

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Fetch tags for all posts
  const postIds = posts.map(p => p.id);
  const { data: allTags } = await supabase
    .from('build_post_tags')
    .select('post_id, tag')
    .in('post_id', postIds);

  const tagsMap = new Map();
  (allTags || []).forEach(t => {
    if (!tagsMap.has(t.post_id)) {
      tagsMap.set(t.post_id, []);
    }
    tagsMap.get(t.post_id).push(t.tag);
  });

  // Filter by tags if specified (post-filter since we need all tags first)
  let filteredPosts = posts;
  if (tags && tags.length > 0) {
    filteredPosts = posts.filter(p => {
      const postTags = tagsMap.get(p.id) || [];
      return tags.some(t => postTags.includes(t));
    });
  }

  // Fetch first media for thumbnail
  const { data: allMedia } = await supabase
    .from('build_media')
    .select('post_id, storage_path, external_url')
    .in('post_id', postIds)
    .eq('position', 0);

  const mediaMap = new Map();
  (allMedia || []).forEach(m => {
    mediaMap.set(m.post_id, m.storage_path
      ? supabase.storage.from('build-media').getPublicUrl(m.storage_path).data.publicUrl
      : m.external_url
    );
  });

  // Get current user's votes and saves
  let userVotes = new Map();
  let userSaves = new Set();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: votes } = await supabase
      .from('build_votes')
      .select('post_id, value')
      .in('post_id', postIds)
      .eq('user_id', user.id);
    userVotes = new Map(votes?.map(v => [v.post_id, v.value]) || []);

    const { data: saves } = await supabase
      .from('build_saves')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', user.id);
    userSaves = new Set(saves?.map(s => s.post_id) || []);
  }

  return filteredPosts.map(post => ({
    ...post,
    author: profileMap.get(post.author_id) || { username: 'Anonymous', display_name: 'Anonymous', avatar_url: null },
    tags: tagsMap.get(post.id) || [],
    thumbnail_url: mediaMap.get(post.id) || null,
    user_vote: userVotes.get(post.id) || null,
    user_saved: userSaves.has(post.id),
  }));
};

/**
 * Fetch a single build with all details
 * Uses direct queries as fallback when RPC is not available
 */
export const fetchBuildDetail = async (buildId) => {
  // Try RPC first
  try {
    const { data, error } = await supabase.rpc('get_build_detail', {
      p_build_id: buildId,
    });

    if (!error && data?.[0]) {
      return data[0];
    }
  } catch (rpcError) {
    console.warn('RPC get_build_detail not available, using fallback:', rpcError);
  }

  // Fallback: Direct query
  const { data: post, error: postError } = await supabase
    .from('build_posts')
    .select('*')
    .eq('id', buildId)
    .eq('status', 'published')
    .single();

  if (postError) throw postError;
  if (!post) return null;

  // Fetch author profile
  const { data: authorProfile } = await supabase
    .from('user_profiles')
    .select('id, username, display_name, avatar_url')
    .eq('id', post.author_id)
    .single();

  // Fetch tags
  const { data: tags } = await supabase
    .from('build_post_tags')
    .select('tag')
    .eq('post_id', buildId);

  // Fetch items with codex_items info
  const { data: buildItems } = await supabase
    .from('build_post_items')
    .select('*')
    .eq('post_id', buildId)
    .order('position');

  let itemsWithDetails = [];
  if (buildItems && buildItems.length > 0) {
    const externalIds = buildItems.map(i => i.item_external_id);
    const { data: codexItems } = await supabase
      .from('codex_items')
      .select('external_id, name, slug, item_type, sprite_url, quality')
      .in('external_id', externalIds);

    const itemsMap = new Map(codexItems?.map(i => [i.external_id, i]) || []);
    itemsWithDetails = buildItems.map(bi => ({
      ...bi,
      item: itemsMap.get(bi.item_external_id) || null,
    }));
  }

  // Fetch media
  const { data: media } = await supabase
    .from('build_media')
    .select('*')
    .eq('post_id', buildId)
    .order('position');

  // Process media URLs
  const processedMedia = (media || []).map(m => ({
    ...m,
    url: m.storage_path
      ? supabase.storage.from('build-media').getPublicUrl(m.storage_path).data.publicUrl
      : m.external_url,
  }));

  // Check current user's vote and save status
  let userVote = null;
  let userSaved = false;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: voteData } = await supabase
      .from('build_votes')
      .select('value')
      .eq('post_id', buildId)
      .eq('user_id', user.id)
      .single();
    userVote = voteData?.value || null;

    const { data: saveData } = await supabase
      .from('build_saves')
      .select('id')
      .eq('post_id', buildId)
      .eq('user_id', user.id)
      .single();
    userSaved = !!saveData;
  }

  return {
    ...post,
    author: authorProfile || { username: 'Anonymous', display_name: 'Anonymous', avatar_url: null },
    tags: tags?.map(t => t.tag) || [],
    items: itemsWithDetails,
    media: processedMedia,
    user_vote: userVote,
    user_saved: userSaved,
  };
};

/**
 * Fetch build tags
 */
export const fetchBuildTags = async (buildId) => {
  const { data, error } = await supabase
    .from('build_post_tags')
    .select('tag')
    .eq('post_id', buildId);

  if (error) throw error;
  return data?.map(t => t.tag) || [];
};

/**
 * Fetch build items with codex_items info
 */
export const fetchBuildItems = async (buildId) => {
  const { data, error } = await supabase
    .from('build_post_items')
    .select(`
      id,
      item_external_id,
      position,
      is_essential,
      notes
    `)
    .eq('post_id', buildId)
    .order('position', { ascending: true });

  if (error) throw error;
  
  // If we have items, fetch their details from codex_items
  if (data && data.length > 0) {
    const externalIds = data.map(item => item.item_external_id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('codex_items')
      .select('external_id, name, slug, item_type, sprite_url, quality')
      .in('external_id', externalIds);
    
    if (itemsError) throw itemsError;
    
    // Merge item details
    const itemsMap = new Map(itemsData?.map(i => [i.external_id, i]) || []);
    return data.map(buildItem => ({
      ...buildItem,
      item: itemsMap.get(buildItem.item_external_id) || null,
    }));
  }
  
  return [];
};

/**
 * Fetch build media
 */
export const fetchBuildMedia = async (buildId) => {
  const { data, error } = await supabase
    .from('build_media')
    .select('*')
    .eq('post_id', buildId)
    .order('position', { ascending: true });

  if (error) throw error;
  
  // Generate public URLs for storage paths
  return (data || []).map(media => ({
    ...media,
    url: media.storage_path 
      ? supabase.storage.from('build-media').getPublicUrl(media.storage_path).data.publicUrl
      : media.external_url,
    thumbUrl: media.thumb_storage_path
      ? supabase.storage.from('build-media').getPublicUrl(media.thumb_storage_path).data.publicUrl
      : null,
  }));
};

/**
 * Fetch build comments
 */
export const fetchBuildComments = async (buildId) => {
  const { data, error } = await supabase
    .from('build_comments')
    .select(`
      id,
      content,
      author_id,
      parent_id,
      status,
      created_at,
      updated_at
    `)
    .eq('post_id', buildId)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error) throw error;
  
  // Fetch author profiles separately
  if (data && data.length > 0) {
    const authorIds = [...new Set(data.map(c => c.author_id))];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', authorIds);
    
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    
    return data.map(comment => ({
      ...comment,
      author: profileMap.get(comment.author_id) || {
        username: 'Anonymous',
        display_name: 'Anonymous',
        avatar_url: null,
      },
    }));
  }
  
  return [];
};

/**
 * Fetch user's saved builds
 */
export const fetchUserSavedBuilds = async (userId) => {
  const { data, error } = await supabase
    .from('build_saves')
    .select('post_id')
    .eq('user_id', userId);

  if (error) throw error;
  return new Set(data?.map(s => s.post_id) || []);
};

/**
 * Fetch user's votes
 */
export const fetchUserVotes = async (userId) => {
  const { data, error } = await supabase
    .from('build_votes')
    .select('post_id, value')
    .eq('user_id', userId);

  if (error) throw error;
  return new Map(data?.map(v => [v.post_id, v.value]) || []);
};

// ============================================================
// CREATE / UPDATE / DELETE
// ============================================================

/**
 * Create a new build post
 */
export const createBuildPost = async ({
  title,
  description,
  howToExecute,
  notes = null,
  characterSlug,
  gameVersion = 'repentance_plus',
  seed = null,
  difficulty = 'normal',
  buildType = 'damage',
  tags = [],
  items = [],
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Create the post
  const { data: post, error: postError } = await supabase
    .from('build_posts')
    .insert({
      author_id: user.id,
      title,
      description,
      how_to_execute: howToExecute,
      notes,
      character_slug: characterSlug,
      game_version: gameVersion,
      seed: seed?.toUpperCase() || null,
      difficulty,
      build_type: buildType,
      status: 'published',
    })
    .select()
    .single();

  if (postError) throw postError;

  // Insert tags
  if (tags.length > 0) {
    const tagRows = tags.map(tag => ({
      post_id: post.id,
      tag: tag.toLowerCase().trim(),
    }));
    
    const { error: tagsError } = await supabase
      .from('build_post_tags')
      .insert(tagRows);
    
    if (tagsError) {
      console.error('Tags insert error:', tagsError);
    }
  }

  // Insert items
  if (items.length > 0) {
    const itemRows = items.map((item, index) => ({
      post_id: post.id,
      item_external_id: item.externalId,
      position: index,
      is_essential: item.isEssential || false,
      notes: item.notes || null,
    }));
    
    const { error: itemsError } = await supabase
      .from('build_post_items')
      .insert(itemRows);
    
    if (itemsError) {
      console.error('Items insert error:', itemsError);
    }
  }

  return post;
};

/**
 * Update an existing build post
 */
export const updateBuildPost = async (buildId, updates) => {
  const { data, error } = await supabase
    .from('build_posts')
    .update({
      title: updates.title,
      description: updates.description,
      how_to_execute: updates.howToExecute,
      notes: updates.notes,
      character_slug: updates.characterSlug,
      game_version: updates.gameVersion,
      seed: updates.seed?.toUpperCase() || null,
      difficulty: updates.difficulty,
      build_type: updates.buildType,
    })
    .eq('id', buildId)
    .select()
    .single();

  if (error) throw error;

  // Update tags if provided
  if (updates.tags) {
    // Delete existing tags
    await supabase.from('build_post_tags').delete().eq('post_id', buildId);
    
    // Insert new tags
    if (updates.tags.length > 0) {
      const tagRows = updates.tags.map(tag => ({
        post_id: buildId,
        tag: tag.toLowerCase().trim(),
      }));
      await supabase.from('build_post_tags').insert(tagRows);
    }
  }

  // Update items if provided
  if (updates.items) {
    await supabase.from('build_post_items').delete().eq('post_id', buildId);
    
    if (updates.items.length > 0) {
      const itemRows = updates.items.map((item, index) => ({
        post_id: buildId,
        item_external_id: item.externalId,
        position: index,
        is_essential: item.isEssential || false,
        notes: item.notes || null,
      }));
      await supabase.from('build_post_items').insert(itemRows);
    }
  }

  return data;
};

/**
 * Delete a build post
 */
export const deleteBuildPost = async (buildId) => {
  const { error } = await supabase
    .from('build_posts')
    .delete()
    .eq('id', buildId);

  if (error) throw error;
  return true;
};

// ============================================================
// VOTES & SAVES
// ============================================================

/**
 * Toggle vote on a build
 * Uses direct queries as fallback when RPC is not available
 */
export const toggleBuildVote = async (postId, value = 1) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Try RPC first
  try {
    const { data, error } = await supabase.rpc('toggle_build_vote', {
      p_post_id: postId,
      p_value: value,
    });

    if (!error) return data;
  } catch (rpcError) {
    console.warn('RPC toggle_build_vote not available, using fallback:', rpcError);
  }

  // Fallback: Manual toggle
  // Check existing vote
  const { data: existingVote } = await supabase
    .from('build_votes')
    .select('id, value')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  let scoreChange = 0;

  if (existingVote) {
    if (existingVote.value === value) {
      // Remove vote
      await supabase.from('build_votes').delete().eq('id', existingVote.id);
      scoreChange = -value;
    } else {
      // Change vote
      await supabase.from('build_votes').update({ value }).eq('id', existingVote.id);
      scoreChange = value * 2; // -1 to +1 = 2, +1 to -1 = -2
    }
  } else {
    // New vote
    await supabase.from('build_votes').insert({
      post_id: postId,
      user_id: user.id,
      value,
    });
    scoreChange = value;
  }

  // Update post score
  const { data: post } = await supabase
    .from('build_posts')
    .select('score')
    .eq('id', postId)
    .single();

  const newScore = (post?.score || 0) + scoreChange;
  await supabase.from('build_posts').update({ score: newScore }).eq('id', postId);

  return { success: true, new_vote: existingVote?.value === value ? null : value, new_score: newScore };
};

/**
 * Toggle save on a build
 * Uses direct queries as fallback when RPC is not available
 */
export const toggleBuildSave = async (postId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Try RPC first
  try {
    const { data, error } = await supabase.rpc('toggle_build_save', {
      p_post_id: postId,
    });

    if (!error) return data;
  } catch (rpcError) {
    console.warn('RPC toggle_build_save not available, using fallback:', rpcError);
  }

  // Fallback: Manual toggle
  const { data: existingSave } = await supabase
    .from('build_saves')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  let savesChange = 0;

  if (existingSave) {
    await supabase.from('build_saves').delete().eq('id', existingSave.id);
    savesChange = -1;
  } else {
    await supabase.from('build_saves').insert({
      post_id: postId,
      user_id: user.id,
    });
    savesChange = 1;
  }

  // Update saves count
  const { data: post } = await supabase
    .from('build_posts')
    .select('saves_count')
    .eq('id', postId)
    .single();

  const newCount = Math.max(0, (post?.saves_count || 0) + savesChange);
  await supabase.from('build_posts').update({ saves_count: newCount }).eq('id', postId);

  return { success: true, is_saved: !existingSave, new_saves_count: newCount };
};

// ============================================================
// COMMENTS
// ============================================================

/**
 * Add a comment to a build
 */
export const addBuildComment = async (postId, content, parentId = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { data, error } = await supabase
    .from('build_comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content,
      parent_id: parentId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a comment
 */
export const deleteBuildComment = async (commentId) => {
  const { error } = await supabase
    .from('build_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
  return true;
};

// ============================================================
// REPORTS & BLOCKS
// ============================================================

/**
 * Report content
 */
export const reportContent = async (targetType, targetId, reason, details = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { data, error } = await supabase
    .from('content_reports')
    .insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details,
    })
    .select()
    .single();

  if (error) {
    // Handle duplicate report gracefully
    if (error.code === '23505') {
      throw new Error('You have already reported this content');
    }
    throw error;
  }
  return data;
};

/**
 * Block a user
 */
export const blockUser = async (blockedUserId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { data, error } = await supabase
    .from('user_blocks')
    .insert({
      blocker_id: user.id,
      blocked_id: blockedUserId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('User already blocked');
    }
    throw error;
  }
  return data;
};

/**
 * Unblock a user
 */
export const unblockUser = async (blockedUserId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', blockedUserId);

  if (error) throw error;
  return true;
};

/**
 * Get list of blocked users
 */
export const getBlockedUsers = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocked_id')
    .eq('blocker_id', user.id);

  if (error) throw error;
  return new Set(data?.map(b => b.blocked_id) || []);
};

// ============================================================
// MEDIA UPLOAD
// ============================================================

/**
 * Upload media file for a build
 */
export const uploadBuildMedia = async (postId, file) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Validate file
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
  }

  // Generate unique filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `${user.id}/${postId}/${fileName}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('build-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Get media type
  const mediaType = file.type === 'image/gif' ? 'gif' : 'image';

  // Create media record
  const { data: mediaRecord, error: mediaError } = await supabase
    .from('build_media')
    .insert({
      post_id: postId,
      type: mediaType,
      storage_path: uploadData.path,
      mime: file.type,
      bytes: file.size,
    })
    .select()
    .single();

  if (mediaError) throw mediaError;

  return {
    ...mediaRecord,
    url: supabase.storage.from('build-media').getPublicUrl(uploadData.path).data.publicUrl,
  };
};

/**
 * Delete media file
 */
export const deleteBuildMedia = async (mediaId, storagePath) => {
  // Delete from storage
  if (storagePath) {
    await supabase.storage.from('build-media').remove([storagePath]);
  }

  // Delete record
  const { error } = await supabase
    .from('build_media')
    .delete()
    .eq('id', mediaId);

  if (error) throw error;
  return true;
};

// ============================================================
// SEARCH & AUTOCOMPLETE
// ============================================================

/**
 * Search items for autocomplete
 */
export const searchItemsForBuild = async (query, limit = 10) => {
  const { data, error } = await supabase
    .from('codex_items')
    .select('external_id, name, slug, item_type, sprite_url, quality')
    .ilike('name', `%${query}%`)
    .eq('is_published', true)
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Get popular tags for suggestions
 */
export const getPopularTags = async (limit = 20) => {
  const { data, error } = await supabase
    .from('build_post_tags')
    .select('tag')
    .limit(500);

  if (error) throw error;
  
  // Count occurrences
  const counts = {};
  data?.forEach(({ tag }) => {
    counts[tag] = (counts[tag] || 0) + 1;
  });
  
  // Sort by count and return top tags
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
};

export default {
  fetchBuildsFeed,
  fetchBuildDetail,
  fetchBuildTags,
  fetchBuildItems,
  fetchBuildMedia,
  fetchBuildComments,
  fetchUserSavedBuilds,
  fetchUserVotes,
  createBuildPost,
  updateBuildPost,
  deleteBuildPost,
  toggleBuildVote,
  toggleBuildSave,
  addBuildComment,
  deleteBuildComment,
  reportContent,
  blockUser,
  unblockUser,
  getBlockedUsers,
  uploadBuildMedia,
  deleteBuildMedia,
  searchItemsForBuild,
  getPopularTags,
};

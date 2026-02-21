import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

export const useFavorites = (type) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', type, user?.id],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase.from('favorites').select('*').eq('user_id', user.id);
      if (type) {
        query = query.eq('entity_type', type);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Toggle Favorite
  const toggleMutation = useMutation({
    mutationFn: async ({ entityType, entityId, isFavorite }) => {
      if (!user) throw new Error('Must be logged in');
      
      if (isFavorite) {
        // Remove
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);
        if (error) throw error;
      } else {
        // Add
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, entity_type: entityType, entity_id: entityId });
        if (error) throw error;
      }
    },
    onMutate: async ({ entityType, entityId, isFavorite }) => {
       await queryClient.cancelQueries(['favorites']);
       const previousFavorites = queryClient.getQueryData(['favorites', undefined, user?.id]);

       queryClient.setQueryData(['favorites', undefined, user?.id], (old = []) => {
           if (isFavorite) {
               return old.filter(f => !(f.entity_type === entityType && f.entity_id === entityId));
           } else {
               return [...old, { entity_type: entityType, entity_id: entityId, user_id: user.id }];
           }
       });

       return { previousFavorites };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['favorites', undefined, user?.id], context.previousFavorites);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['favorites']);
    },
  });

  const isFavorite = (entityType, entityId) => {
      return favorites.some(f => f.entity_type === entityType && f.entity_id === entityId);
  };

  return {
    favorites,
    isLoading,
    toggleFavorite: toggleMutation.mutate,
    isFavorite,
    isToggling: toggleMutation.isLoading
  };
};

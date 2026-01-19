import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchItems } from '../../lib/api';
import { useFavorites } from '../../features/favorites/useFavorites';
import { SecretItemCard } from './SecretItemCard';
import { EmptyState } from './EmptyState';
import { ItemModal } from '../../features/items/components/ItemModal';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaBomb } from 'react-icons/fa';

const FavoritesPage = () => {
  const { favorites, isLoading: loadingFavs } = useFavorites('item');
  const [selectedItem, setSelectedItem] = useState(null);

  const favIds = favorites ? favorites.map(f => f.entity_id) : [];

  const { data, isLoading: loadingItems } = useQuery({
      queryKey: ['favoriteItems', favIds.join(',')],
      queryFn: () => fetchItems({ ids: favIds }),
      enabled: favIds.length > 0,
      staleTime: 1000 * 60 
  });

  const responseData = data || {};
  const items = Array.isArray(responseData) ? responseData : (responseData.data || []);
  
  const isLoading = loadingFavs || (favIds.length > 0 && loadingItems);

  return (
    <div className="min-h-screen bg-secret-room text-gray-200 relative w-full overflow-x-hidden">
      
      {/* Dark Vignette Overlay - Softer */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.4)_100%)] z-0" />

      {/* Floating Particles (Dust) - Optional Polish */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-white rounded-full animate-pulse delay-700" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center min-h-screen">
         
         {/* Title Section */}
         <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 flex items-center gap-6 md:gap-10"
         >
            <FaHeart className="text-blue-400 text-xl md:text-3xl animate-pulse drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            
            <h1 className="text-4xl md:text-6xl font-heading tracking-wider text-center text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-700 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] pb-2">
                MY FAVORITES
            </h1>
            
            <FaHeart className="text-blue-400 text-xl md:text-3xl animate-pulse drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
         </motion.div>

         {isLoading ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 animate-pulse w-full max-w-6xl">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 w-24 mx-auto rounded-full bg-white/5" />
                ))}
             </div>
         ) : favIds.length === 0 ? (
             <EmptyState />
         ) : (
             <motion.div 
                layout
                className="flex flex-wrap justify-center gap-8 md:gap-12 w-full max-w-6xl pb-20"
             >
                <AnimatePresence mode='popLayout'>
                    {items.map((item, idx) => (
                        <SecretItemCard 
                            key={item.id} 
                            item={item} 
                            index={idx} 
                            onClick={setSelectedItem}
                        />
                    ))}
                </AnimatePresence>
             </motion.div>
         )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
         {selectedItem && (
             <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
         )}
      </AnimatePresence>

    </div>
  );
};

export default FavoritesPage;

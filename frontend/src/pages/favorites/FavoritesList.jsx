import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchItems } from '../../lib/api';
import { useFavorites } from '../../features/favorites/useFavorites';
import { ItemGridCard } from '../../features/items/components/ItemGridCard';
import { ItemModal } from '../../features/items/components/ItemModal';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const FavoritesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-bg-0 text-fg">
      
      {/* Header */}
      <section className="relative pt-24 pb-12 px-6 border-b border-white/5 overflow-hidden">
         <div className="absolute inset-0 bg-bg-1/50 z-0" />
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-gold/10 rounded-full blur-[100px]" />
         
         <div className="relative z-10 container mx-auto max-w-7xl text-center md:text-left flex flex-col md:flex-row items-end justify-between gap-4">
            <div>
                <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl md:text-6xl font-serif font-black tracking-tighter mb-2"
                >
                    {t('favorites.title')}
                </motion.h1>
                <p className="text-muted text-lg">
                    Your personal collection of discovered artifacts.
                </p>
            </div>
            <div className="hidden md:block pb-2">
               <span className="font-mono text-gold text-xl font-bold">{favIds.length}</span> <span className="text-muted text-sm uppercase tracking-wider">{t('favorites.items')}</span>
            </div>
         </div>
      </section>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-8">
        
        {isLoading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-bg-1 rounded-xl border border-white/5" />
                ))}
             </div>
        ) : favIds.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-32 opacity-50 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <FaHeart className="text-3xl text-white/20" />
                </div>
                <h2 className="text-2xl font-serif font-bold mb-2">{t('favorites.noFavorites')}</h2>
                <p className="text-muted mb-8 max-w-md">Mark items as favorite in the collection to see them here.</p>
                <Button onClick={() => navigate('/items')} className="bg-gold text-bg-0 hover:bg-gold/90">
                    Browse Collection
                </Button>
             </div>
        ) : (
             <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
             >
                <AnimatePresence mode='popLayout'>
                    {items.map((item, idx) => (
                        <ItemGridCard 
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

export default FavoritesList;

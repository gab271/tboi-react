import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchItem } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { FaArrowLeft, FaHeart, FaShare, FaBookOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';

export function ItemDetail() {
  const { id } = useParams(); // This is the slug or ID
  const navigate = useNavigate();

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id),
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blood border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-3xl font-serif font-bold text-fg mb-4">Item Lost in the Basement</h2>
        <p className="text-muted mb-8">We couldn't find the artifact you were looking for.</p>
        <Button onClick={() => navigate('/items')}>Return to Collection</Button>
      </div>
    );
  }

  const imageUrl = item.image || item.sprite_url;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-4 py-8 md:py-12"
    >
      
      {/* --- BREADCRUMBS --- */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-muted mb-8 font-mono">
        <Link to="/" className="hover:text-fg hover:underline">Home</Link>
        <span>/</span>
        <Link to="/items" className="hover:text-fg hover:underline">Items</Link>
        <span>/</span>
        <span className="text-gold truncate max-w-[200px]">{item.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        
        {/* --- LEFT COL (Image & Quick Stats) --- */}
        <div className="lg:col-span-1 space-y-6">
            {/* Hero Image Card */}
            <Card className="aspect-square flex items-center justify-center bg-bg-1/50 border-gold/20 shadow-2xl shadow-black/50 relative overflow-hidden group">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/5 to-transparent opacity-50" />
               
               {imageUrl ? (
                  <motion.img 
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    src={imageUrl} 
                    alt={item.name} 
                    className="w-1/2 h-1/2 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-10" 
                  />
               ) : (
                  <FaBookOpen className="text-6xl text-white/10" />
               )}
            </Card>

            {/* Quick Info */}
            <Card className="bg-bg-1 border-white/5 space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-muted text-sm uppercase tracking-wider">Type</span>
                  <span className="font-serif text-gold capitalize">{item.item_type || 'Unknown'}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-muted text-sm uppercase tracking-wider">Quality</span>
                  <div className="flex gap-1">
                     {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < (item.quality || 0) ? 'bg-gold' : 'bg-white/10'}`} />
                     ))}
                  </div>
               </div>
               <div className="flex justify-between items-center py-2">
                  <span className="text-muted text-sm uppercase tracking-wider">ID</span>
                  <span className="font-mono text-white/50">#{item.external_id}</span>
               </div>
            </Card>
        </div>

        {/* --- RIGHT COL (Content) --- */}
        <div className="lg:col-span-2">
           
           {/* Header */}
           <div className="mb-8">
             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-serif font-black text-fg tracking-tight">{item.name}</h1>
                <div className="flex gap-2">
                   <Button variant="outline" size="icon" className="rounded-full border-white/10"><FaShare /></Button>
                   <FavoriteButton entityType="item" entityId={item.id} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-muted hover:text-blood hover:bg-blood/10 transition-colors" />
                </div>
             </div>
             
             {item.pickup_quote && (
                <div className="inline-block px-4 py-2 bg-white/5 rounded-lg border-l-2 border-blood">
                    <p className="text-xl text-muted italic font-serif">"{item.pickup_quote}"</p>
                </div>
             )}
           </div>

           {/* Description / Effect */}
           <div className="space-y-8">
              <section>
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-lg font-bold text-fg uppercase tracking-wider">Effect & Mechanics</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                
                <Card className="bg-bg-1/50 border-white/5 p-6 md:p-8 leading-relaxed text-lg text-fg/90 whitespace-pre-wrap">
                   {item.description ? item.description : "No detailed description available."}
                </Card>
              </section>

              {/* Tags/Pools Placeholder (If we had them) */}
              {item.tags && item.tags.length > 0 && (
                  <section>
                    <h3 className="text-sm font-bold text-muted uppercase mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {item.tags.map(tag => (
                            <Chip key={tag} className="bg-bg-2 border-white/10">{tag}</Chip>
                        ))}
                    </div>
                  </section>
              )}
           </div>

        </div>

      </div>
    </motion.div>
  );
}

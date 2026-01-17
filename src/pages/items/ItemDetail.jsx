import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchItem } from '../../lib/api';
import { Button } from '../../components/ui/Button';
// We don't use Card component here as it's styled for Dark Theme default. We want Paper text.
import { Chip } from '../../components/ui/Chip';
import { FaArrowLeft, FaHeart, FaShare, FaBookOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';

export function ItemDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id),
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-accent-blood border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-3xl font-heading font-bold text-text-heading mb-4">Item Lost in the Basement</h2>
        <p className="text-text-dim mb-8">We couldn't find the artifact you were looking for.</p>
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
      <div className="flex items-center gap-2 text-xs md:text-sm text-text-dim mb-8 font-handwriting text-lg">
        <Link to="/" className="hover:text-text-ink hover:underline">Home</Link>
        <span>/</span>
        <Link to="/items" className="hover:text-text-ink hover:underline">Items</Link>
        <span>/</span>
        <span className="text-text-ink font-bold">{item.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* --- LEFT COLUMN: IMAGE --- */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6">
          <motion.div 
            initial={{ scale: 0.9, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            className="aspect-square bg-[#1c1917] rounded-xl border-2 border-text-ink shadow-xl flex items-center justify-center p-8 relative overflow-hidden group"
          >
             {/* Background glow behind item */}
             <div className={`absolute inset-0 opacity-20 bg-gradient-to-br from-white/10 to-transparent`} />
             
             <img 
               src={imageUrl} 
               alt={item.name} 
               className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10 transition-transform duration-500 hover:scale-110"
             />
          </motion.div>
        </div>

        {/* --- RIGHT COLUMN: INFO --- */}
        <div className="md:col-span-7 lg:col-span-8 space-y-8">
            <div>
               <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2">
                     <span className="px-3 py-1 bg-text-ink text-bg-paper text-xs font-bold uppercase tracking-widest rounded-sm font-heading">
                        {item.item_type || 'Passive'}
                     </span>
                     {item.item_pool && (
                        <span className="px-3 py-1 border border-text-ink text-text-ink text-xs font-bold uppercase tracking-widest rounded-sm font-heading">
                           {typeof item.item_pool === 'string' ? item.item_pool : 'Treasure Room'}
                        </span>
                     )}
                  </div>
                  <h1 className="text-5xl md:text-6xl font-heading text-text-heading leading-tight uppercase tracking-tight">
                    {item.name}
                  </h1>
               </div>
               
               <p className="text-2xl md:text-3xl font-handwriting text-text-dim italic leading-relaxed border-l-4 border-accent-gold pl-6 py-2">
                  "{item.quote || item.description_short || '...'}"
               </p>
            </div>

            <div className="prose prose-lg prose-p:text-text-ink prose-headings:font-heading prose-headings:text-text-heading prose-p:font-handwriting prose-p:text-2xl max-w-none">
                <h3 className="text-2xl uppercase border-b border-text-ink/20 pb-2 mb-4">Effect</h3>
                <p>
                  {item.description || "No detailed description available."}
                </p>
                
                {item.synergies && (
                    <div className="mt-8 bg-white/40 p-6 rounded-lg border border-text-ink/10 -rotate-1">
                        <h3 className="text-xl uppercase text-accent-blood mb-2 font-bold not-italic">Synergies</h3>
                        <p>{item.synergies}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-8 border-t border-text-ink/10 border-dashed">
                <Button variant="ghost" onClick={() => navigate(-1)} className="font-handwriting text-xl">
                   <FaArrowLeft className="mr-2" /> Back
                </Button>
            </div>
        </div>
      </div>
    </motion.div>
  );
}

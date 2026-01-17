import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShare, FaBookOpen } from 'react-icons/fa';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import FavoriteButton from '../../../components/ui/FavoriteButton';

export function ItemModal({ item, onClose }) {
  if (!item) return null;
  
  // Reuse logic from ItemDetail or pass raw item.
  // Since we have the item object from the list, we might have most data.
  // But description might be truncated or we might want more.
  // However, for the "ItemGridCard", we usually get what's in the DB.
  // The seed DB has 'description' and 'pickup_quote'.
  
  const imageUrl = item.image || item.sprite_url;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div 
         className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
         onClick={onClose} 
      />
      
      <motion.div 
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9, y: 20 }}
         className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-bg-0 border border-white/10 rounded-2xl shadow-2xl flex flex-col md:flex-row"
      >
         <Button 
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 hover:bg-black/80 text-white" 
            size="icon" 
            variant="ghost" 
            onClick={onClose}
         >
            <FaTimes />
         </Button>

         {/* Left: Image & Quick Stats */}
         <div className="w-full md:w-1/3 bg-bg-1 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/5">
            <div className="w-48 h-48 relative mb-8 group">
               <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
               {imageUrl ? (
                 <img src={imageUrl} alt={item.name} className="w-full h-full object-contain drop-shadow-2xl relative z-10" />
               ) : (
                 <FaBookOpen className="w-24 h-24 text-white/10" />
               )}
            </div>

            <div className="w-full space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-muted text-xs uppercase tracking-wider">Type</span>
                   <Chip className="bg-bg-2 border-gold/20 text-gold capitalize">{item.item_type}</Chip>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-muted text-xs uppercase tracking-wider">Quality</span>
                   <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                         <div key={i} className={`w-2 h-2 rounded-full ${i < (item.quality || 0) ? 'bg-gold' : 'bg-white/10'}`} />
                      ))}
                   </div>
                </div>
                <div className="flex justify-between items-center py-2">
                   <span className="text-muted text-xs uppercase tracking-wider">ID</span>
                   <span className="font-mono text-white/50">#{item.external_id}</span>
                </div>
            </div>
         </div>

         {/* Right: Content */}
         <div className="flex-1 p-8">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-3xl md:text-4xl font-serif font-black text-fg">{item.name}</h2>
                    <div className="flex gap-2 mr-8 md:mr-0">
                        <FavoriteButton entityType="item" entityId={item.id} />
                    </div>
                </div>
                {item.pickup_quote && (
                    <p className="text-xl text-muted italic font-serif border-l-2 border-blood pl-4 py-1">
                        "{item.pickup_quote}"
                    </p>
                )}
            </div>

            <div className="space-y-6">
                <div>
                   <h3 className="text-sm font-bold text-fg uppercase tracking-wider mb-3 flex items-center gap-2">
                      Effect <div className="h-px flex-1 bg-white/10"></div>
                   </h3>
                   <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {item.description || "No detailed description available."}
                   </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                   <div>
                        <h3 className="text-sm font-bold text-fg uppercase tracking-wider mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {item.tags.map(tag => (
                                <Chip key={tag} className="bg-bg-1 border-white/5 text-xs">{tag}</Chip>
                            ))}
                        </div>
                   </div>
                )}
                
                <div className="pt-8 mt-auto flex justify-end">
                    <Button variant="outline" onClick={onClose}>Close Codex</Button>
                </div>
            </div>
         </div>

      </motion.div>
    </div>,
    document.body
  );
}

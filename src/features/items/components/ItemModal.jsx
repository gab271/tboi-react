import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookOpen, FaStar, FaQuoteLeft } from 'react-icons/fa';
import FavoriteButton from '../../../components/ui/FavoriteButton';

export function ItemModal({ item, onClose }) {
  if (!item) return null;
  
  const imageUrl = item.image || item.sprite_url;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
           onClick={onClose} 
        />
        
        {/* Modal - Paper Look */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.9, rotate: 1 }}
           animate={{ opacity: 1, scale: 1, rotate: 0 }}
           exit={{ opacity: 0, scale: 0.9, rotate: 1 }}
           className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-bg-paper text-text-ink paper-shadow flex flex-col md:flex-row p-8 md:p-12 -rotate-1 rounded-sm"
        >
           {/* Close "X" doodle */}
           <button 
              className="absolute top-4 right-5 z-20 font-handwriting font-bold text-3xl hover:text-accent-blood transition-colors"
              onClick={onClose}
           >
              X
           </button>

           <div className="flex flex-col md:flex-row gap-10 w-full">
               {/* Left: Polaroid Image */}
               <div className="w-full md:w-1/3 flex-shrink-0 flex flex-col items-center">
                  <div className="bg-[#fdfbf7] p-3 pb-8 shadow-md rotate-2 transition-transform hover:-rotate-1 duration-500 w-full max-w-[280px] border border-black/10">
                     {/* Inner Black Frame */}
                     <div className="w-full aspect-square bg-[#0a0a0a] flex items-center justify-center overflow-hidden border-4 border-white shadow-inner relative group">
                        {/* Background dust/noise in image */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                        
                        {imageUrl ? (
                           <img 
                                src={imageUrl} 
                                alt={item.name} 
                                className="w-3/5 h-3/5 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] relative z-10 group-hover:scale-110 transition-transform duration-500" 
                           />
                        ) : (
                           <FaBookOpen className="w-16 h-16 text-white/20" />
                        )}
                     </div>
                     <div className="text-center mt-3 font-handwriting text-text-ink text-xl font-bold truncate px-2">
                        {item.name}
                     </div>
                  </div>

                  {/* ID Stamp */}
                  <div className="mt-6 font-mono text-xs opacity-40 -rotate-2 border-2 border-dashed border-black/20 p-2 inline-block">
                      CONFISCATED ID #{item.external_id || item.id}
                  </div>
               </div>

               {/* Right: Handwritten Details */}
               <div className="flex-1 space-y-6 relative">
                  <div>
                      <div className="flex justify-between items-start">
                          <h2 className="text-4xl md:text-5xl font-heading text-text-heading mb-2 uppercase tracking-tight flex-1 leading-none">
                             {item.name}
                          </h2>
                          <div className="opacity-0 md:opacity-100 transition-opacity">
                             <FavoriteButton entityType="item" entityId={item.id} />
                          </div>
                      </div>

                      {/* Pickup Quote */}
                      {item.pickup_quote && (
                          <div className="text-2xl font-handwriting text-accent-blood/80 italic mb-4 -rotate-1">
                              &quot;{item.pickup_quote}&quot;
                          </div>
                      )}
                  </div>

                  {/* Description Section */}
                  <div className="font-handwriting text-xl leading-relaxed text-text-ink/90 space-y-4">
                      {/* Stats / Metadata */}
                      <div className="flex flex-wrap gap-4 text-sm font-sans uppercase tracking-widest opacity-60 mb-6 border-b border-black/10 pb-2">
                          {item.item_type && (
                              <span className="flex items-center gap-1">
                                  Type: <span className="font-bold text-black">{item.item_type}</span>
                              </span>
                          )}
                          {item.quality !== undefined && (
                              <span className="flex items-center gap-1">
                                  Quality: 
                                  <div className="flex">
                                    {[...Array(4)].map((_, i) => (
                                       <FaStar key={i} className={`text-xs ml-0.5 ${i < item.quality ? 'text-black' : 'text-black/10'}`} />
                                    ))}
                                  </div>
                              </span>
                          )}
                      </div>

                      {/* Main Effect */}
                      <div className="relative pl-6">
                           <FaQuoteLeft className="absolute left-0 top-1 text-black/10 text-2xl" />
                           <p>
                              {item.description || "Effect unknown..."}
                           </p>
                      </div>

                      {/* Tags as scribbles */}
                      {item.tags && item.tags.length > 0 && (
                          <div className="pt-6 mt-6 border-t-2 border-dashed border-black/10">
                              <span className="font-bold text-sm block mb-2 opacity-50 uppercase">Categories:</span>
                              <div className="flex flex-wrap gap-3">
                                  {item.tags.map(tag => (
                                      <span key={tag} className="text-base px-3 py-1 border border-black/30 rounded-full -rotate-2 hover:rotate-0 hover:bg-black/5 transition-all cursor-default relative">
                                          #{tag}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
               </div>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

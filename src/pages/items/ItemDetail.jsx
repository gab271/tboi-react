import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchItem } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { FaShare, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ItemStatsTab } from '../../components/items/ItemStatsTab';
import FavoriteButton from '../../components/ui/FavoriteButton';
import { NightmareLoading } from '../../components/ui/NightmareLoading';

// Pool Icon Component
const PoolIcon = ({ poolName }) => {
    const normalized = poolName?.toLowerCase().trim();
    if (!normalized) return null;

    // Use specific icons if they exist in public/icons/
    const icons = {
        'treasure': '/icons/pool_treasure.png',
        'shop': '/icons/pool_shop.png',
        'boss': '/icons/pool_boss.png',
        'devil': '/icons/pool_devil.png',
        'angel': '/icons/pool_angel.png',
        'secret': '/icons/pool_secret.png',
        'library': '/icons/pool_library.png',
        'curse': '/icons/pool_curse.png',
    };
    
    // Fallback logic
    const iconSrc = Object.entries(icons).find(([key]) => normalized.includes(key))?.[1] || '/icons/pool_default.png';
    
    return ( 
        <div className="relative group" title={poolName}>
           <img 
             src={iconSrc} 
             alt={poolName}
             className="w-8 h-8 object-contain pixelated hover:scale-110 transition-transform filter drop-shadow-sm" 
             onError={(e) => {
               e.target.style.display = 'none'; 
               e.target.nextSibling.style.display = 'flex';
             }}
           />
           {/* Fallback Text Badge if image missing */}
           <div className="hidden w-8 h-8 items-center justify-center bg-[#d3c6aa] border border-[#bdae93] rounded text-[10px] font-pixel text-center leading-none text-[#5a5a5a] uppercase shadow-sm" style={{display: 'none'}}>
             {normalized.slice(0, 3)}
           </div>
        </div>
    );
};

// Quality Badge Component con colores oficiales y animación
const QualityBadge = ({ quality }) => {
  const tier = quality ?? 0; // Default Tier 0 si null
  
  // Colores oficiales por tier (tboi.com)
  const tierConfig = {
    0: { bg: 'from-gray-500 to-gray-700', border: 'border-gray-400', text: 'text-white', name: 'Bad' },
    1: { bg: 'from-green-500 to-green-700', border: 'border-green-400', text: 'text-white', name: 'Decent' },
    2: { bg: 'from-blue-500 to-blue-700', border: 'border-blue-400', text: 'text-white', name: 'Good' },
    3: { bg: 'from-purple-500 to-purple-700', border: 'border-purple-400', text: 'text-white', name: 'Great' },
    4: { bg: 'from-yellow-400 via-amber-500 to-yellow-600', border: 'border-yellow-300', text: 'text-yellow-900', name: 'God Tier', animated: true },
  };
  
  const config = tierConfig[tier] || tierConfig[0];
  
  return (
    <div className="flex flex-col items-center gap-1 group">
      <div className={`relative flex items-center justify-center w-16 h-16 bg-gradient-to-br ${config.bg} rounded-lg border-2 ${config.border} shadow-lg transform transition-transform group-hover:scale-110`}>
        <span className={`text-3xl font-heading font-bold ${config.text} drop-shadow-md z-10`}>{tier}</span>
        {config.animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-200/50 to-yellow-400/0 animate-shimmer rounded-lg"></div>
        )}
      </div>
      <div className="text-center">
        <span className="text-xs font-handwriting text-text-dim uppercase tracking-widest block">Quality</span>
        <span className="text-[10px] font-bold text-text-dim/60">{config.name}</span>
      </div>
    </div>
  );
};

// Tag Component
const Tag = ({ label }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d3c6aa] text-[#1c1917] border border-[#bdae93] shadow-sm font-heading hover:bg-[#c0b396] transition-colors cursor-default">
    {label.replace(/_/g, ' ')}
  </span>
);

export function ItemDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id),
    retry: false
  });

  if (isLoading) {
    return <NightmareLoading />;
  }

  if (isError || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 bg-bg-paper">
        <h2 className="text-4xl font-heading font-bold text-text-heading mb-4">Item Lost in the Void</h2>
        <p className="text-text-dim mb-8 font-handwriting text-2xl">The artifact you seek appears to have been rerolled.</p>
        <Button onClick={() => navigate('/items')}>Return to Collection</Button>
      </div>
    );
  }

  const imageUrl = item.image || item.sprite_url || '/placeholder_item.png';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-bg-paper text-text-ink selection:bg-accent-blood selection:text-white pb-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-sm font-handwriting text-text-dim mb-8 text-lg">
          <Link to="/" className="hover:text-accent-blood transition-colors">Home</Link>
          <span>/</span>
          <Link to="/items" className="hover:text-accent-blood transition-colors">Items</Link>
          <span>/</span>
          <span className="text-text-heading font-bold">{item.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* --- LEFT COLUMN: SPRITE & QUICK STATS --- */}
          <div className="lg:col-span-4 space-y-8">
             {/* Main Card */}
             <div className="bg-[#e6ddc5] rounded-lg shadow-[5px_5px_0px_0px_rgba(28,25,23,0.1)] border-2 border-[#bdae93] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-50 font-heading text-9xl leading-none text-[#d3c6aa] -z-0 select-none">
                   ?
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                   <motion.div 
                     whileHover={{ scale: 1.1, rotate: 5 }}
                     transition={{ type: "spring", stiffness: 300 }}
                     className="w-48 h-48 flex items-center justify-center mb-6 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]"
                   >
                     <img 
                       src={imageUrl} 
                       alt={item.name} 
                       className="max-w-full max-h-full object-contain pixelated" 
                     />
                   </motion.div>

                   <div className="flex gap-4 w-full justify-center border-t-2 border-[#d3c6aa] pt-6 mb-2">
                       {item.item_id && (
                           <div className="text-center">
                               <div className="text-xs uppercase font-bold tracking-widest text-text-dim mb-1">ID</div>
                               <div className="font-heading text-2xl">{item.item_id}</div>
                           </div>
                       )}
                       <div className="w-px bg-[#d3c6aa]"></div>
                       <QualityBadge quality={item.quality} />
                   </div>
                </div>
             </div>

             {/* Type & Pools */}
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#e6ddc5] rounded border-l-4 border-accent-blood">
                   <span className="font-heading uppercase font-bold text-sm tracking-widest text-text-dim">Type</span>
                   <span className="font-heading font-bold text-lg capitalize">{item.type || item.item_type || 'Passive'}</span>
                </div>
                {item.pools && (
                    <div className="flex flex-col gap-3 p-4 bg-[#e6ddc5] rounded border-l-4 border-accent-gold">
                    <span className="font-heading uppercase font-bold text-sm tracking-widest text-text-dim">Pools</span>
                    <div className="flex flex-wrap gap-3">
                         {item.pools.split(',').map((p, i) => (
                             <PoolIcon key={i} poolName={p.trim()} />
                         ))}
                    </div>
                    </div>
                )}
             </div>

             {/* Stats Actions */}
             <div className="flex gap-3">
                 <div
                   onClick={(e) => e.stopPropagation()} 
                   className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                 >
                     <FavoriteButton entityType="item" entityId={item.id} />
                 </div>
                 <Button variant="outline" className="flex-1 gap-2 border-2 border-text-ink">
                     <FaShare /> Share
                 </Button>
             </div>
          </div>

          {/* --- RIGHT COLUMN: DETAILS --- */}
          <div className="lg:col-span-8">
            <div className="mb-8 border-b-2 border-[#d3c6aa] pb-8">
               <h1 className="text-6xl md:text-7xl font-heading text-text-heading mb-2">{item.name}</h1>
               <div className="flex flex-wrap gap-2 mb-6">
                 {(item.tags || []).map(tag => <Tag key={tag} label={tag} />)}
                 {(!item.tags || item.tags.length === 0) && (
                     <span className="text-text-dim text-sm italic">No specific tags identified</span>
                 )}
               </div>
               
               {/* Quote "Pickup Text" */}
               <blockquote className="bg-[#1c1917] text-[#e6ddc5] p-6 rounded-r-xl border-l-8 border-accent-gold shadow-lg">
                   <p className="text-2xl md:text-3xl font-handwriting italic text-center leading-relaxed">
                     &quot;{item.quote || item.description || '...'}&quot;
                   </p>
               </blockquote>
            </div>

            {/* Content Tabs */}
            <div className="space-y-6">
               <div className="flex border-b border-[#bdae93]">
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`px-6 py-3 font-heading font-bold text-lg tracking-wide transition-colors border-b-4 ${activeTab === 'details' ? 'border-accent-blood text-accent-blood' : 'border-transparent text-text-dim hover:text-text-ink'}`}
                  >
                    Effect & Notes
                  </button>
                  <button 
                    onClick={() => setActiveTab('stats')}
                    className={`px-6 py-3 font-heading font-bold text-lg tracking-wide transition-colors border-b-4 ${activeTab === 'stats' ? 'border-accent-blood text-accent-blood' : 'border-transparent text-text-dim hover:text-text-ink'}`}
                  >
                    Stats
                  </button>
               </div>
               
               <AnimatePresence mode="wait">
                 {activeTab === 'details' && (
                   <motion.div 
                     key="details"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="prose prose-xl max-w-none text-text-ink font-handwriting"
                   >
                     <div className="bg-[#e6ddc5]/30 p-6 rounded-lg border border-[#bdae93]">
                         <h3 className="font-heading font-bold text-2xl mb-4 flex items-center gap-2">
                             <FaInfoCircle className="text-accent-gold" />
                             Description
                         </h3>
                         {/* Split by newlines and render paragraphs */}
                         {(item.description_long || item.notes || "No detailed description available.").split('\n').map((line, i) => (
                             <p key={i} className="mb-2 last:mb-0 text-xl">{line}</p>
                         ))}
                     </div>
                   </motion.div>
                 )}

                 {activeTab === 'stats' && (
                    <motion.div 
                        key="stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                         <ItemStatsTab stats={item.stats} />
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

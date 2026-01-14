import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemsData } from '../../features/items/data/mockItems';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { FaArrowLeft, FaHeart, FaShare } from 'react-icons/fa';

export function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = itemsData.find(i => i.id === Number(id));

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl text-fg mb-4">Item not found</h2>
        <Button onClick={() => navigate('/items')}>Back to Codex</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      
      {/* --- BREADCRUMBS --- */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-muted mb-6 font-mono">
        <Link to="/" className="hover:text-fg hover:underline">Home</Link>
        <span>/</span>
        <Link to="/items" className="hover:text-fg hover:underline">Items</Link>
        <span>/</span>
        <span className="text-gold">{item.name}</span>
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        {/* Big Icon */}
        <Card className="shrink-0 w-32 h-32 md:w-48 md:h-48 flex items-center justify-center bg-bg-0 border-gold/20 shadow-lg shadow-gold/5">
           <span className="text-6xl md:text-8xl drop-shadow-md">📦</span>
        </Card>

        {/* Title & Actions */}
        <div className="flex-1 w-full">
           <div className="flex justify-between items-start mb-2">
             <h1 className="text-4xl md:text-5xl font-serif font-bold text-fg drop-shadow-sm">{item.name}</h1>
             <div className="flex gap-2">
               <Button variant="outline" size="sm" className="w-10 h-10 p-0 rounded-full"><FaShare /></Button>
               <Button variant="outline" size="sm" className="w-10 h-10 p-0 rounded-full text-blood hover:bg-blood/10 border-blood/30"><FaHeart /></Button>
             </div>
           </div>
           
           <p className="text-xl text-muted italic mb-6">"{item.description}"</p>
           
           <div className="flex flex-wrap gap-2 mb-6">
              <Chip className="bg-bg-2 border-border font-mono">ID: {item.id}</Chip>
              <Chip className="capitalize bg-bg-2 text-gold border-gold/20">Type: {item.type}</Chip>
              <Chip className="bg-bg-2">Quality: {item.quality}</Chip>
              {item.recharge && <Chip className="bg-bg-2">Recharge: {item.recharge} rooms</Chip>}
           </div>

           <div className="ink-separator" />
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         
         {/* Main Details */}
         <div className="md:col-span-2 space-y-8">
            
            {/* Effect Description */}
            <section>
              <h2 className="text-lg font-bold text-fg uppercase tracking-wider mb-4 border-l-2 border-blood pl-3">The Effect</h2>
              <Card className="bg-bg-1 leading-relaxed text-fg/90 space-y-4">
                 <p>
                   Upon pickup, grants the player <strong>homing tears</strong>. This effect synergizes with almost every other tear modifier in the game.
                 </p>
                 <p>
                   Significantly increases damage by a multiplier of <strong>x2.3</strong> but lowers tears stat.
                 </p>
              </Card>
            </section>

            {/* Synergies */}
            <section>
               <h2 className="text-lg font-bold text-fg uppercase tracking-wider mb-4 border-l-2 border-gold pl-3">Key Synergies</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[1, 2, 3].map(s => (
                   <Card key={s} variant="interactive" className="flex items-center gap-3 p-3">
                      <div className="w-10 h-10 bg-black/50 rounded flex items-center justify-center shrink-0">➕</div>
                      <div>
                        <h4 className="font-bold text-sm text-gold">Synergy Item</h4>
                        <p className="text-xs text-muted">Devastating combo effect description.</p>
                      </div>
                   </Card>
                 ))}
               </div>
            </section>

         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            <Card variant="elevated">
               <h3 className="text-sm font-bold text-muted uppercase mb-4 pb-2 border-b border-white/5">Stats Modifiers</h3>
               <ul className="space-y-3 text-sm font-mono">
                  <li className="flex justify-between">
                     <span>Damage</span>
                     <span className="text-green-400 font-bold">+2.30x</span>
                  </li>
                  <li className="flex justify-between">
                     <span>Tears</span>
                     <span className="text-red-400 font-bold">-0.40</span>
                  </li>
                  <li className="flex justify-between">
                     <span>Shot Speed</span>
                     <span className="text-red-400 font-bold">-0.20</span>
                  </li>
                  <li className="flex justify-between">
                     <span>Range</span>
                     <span className="text-green-400 font-bold">+5.25</span>
                  </li>
               </ul>
            </Card>

            <Card className="bg-bg-0">
               <h3 className="text-sm font-bold text-muted uppercase mb-4 pb-2 border-b border-white/5">Item Pools</h3>
               <div className="flex flex-wrap gap-2">
                 {item.pools && item.pools.map(pool => (
                   <span key={pool} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-muted-2">
                     {pool}
                   </span>
                 ))}
               </div>
            </Card>
         </div>

      </div>

    </div>
  );
}

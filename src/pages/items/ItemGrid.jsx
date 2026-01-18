import React from 'react';
import { ItemCard } from './ItemCard';

export function ItemGrid({ items, isLoading }) {
  if (isLoading) {
    return (
        <div className="bg-[#111] p-6 rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-4 border-[#2a2a2a]">
             <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="aspect-square bg-[#1a1a1a] border border-[#333] animate-pulse rounded-sm" />
                ))}
             </div>
        </div>
    );
  }

  if (!items || items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-[#111] border-4 border-[#2a2a2a] min-h-[400px]">
            <span className="text-6xl mb-4">🕸️</span>
            <p className="font-pixel text-gray-500 text-xl text-center">No items found in this pool...</p>
        </div>
      );
  }

  return (
    // The Dark "Embedded" Block Container
    // Use inset shadow to make it look cut out/deep
    <div className="relative bg-[#0a0a0a] p-4 md:p-6 lg:p-8"
         style={{
             boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)',
             border: '4px solid #2a2a2a',
             borderRadius: '2px' // Almost sharp, technological/industrial feel contrasting with paper
         }}
    >
      {/* Decorative screws/rivets in corners */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#444] shadow-sm"></div>
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#444] shadow-sm"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#444] shadow-sm"></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#444] shadow-sm"></div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {items.map((item, index) => (
          <ItemCard key={item.id || index} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

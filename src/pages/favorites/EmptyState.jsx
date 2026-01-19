import React from 'react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const EmptyState = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-32 text-center z-10 relative">
             {/* Isaac Crying / Open Chest SVG */}
             <div className="mb-6 relative">
                 <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-lg opacity-80">
                    <rect x="20" y="40" width="60" height="40" rx="2" fill="#3e2723" stroke="#1a1a1a" strokeWidth="2" />
                    <rect x="20" y="20" width="60" height="20" rx="2" fill="#5d4037" stroke="#1a1a1a" strokeWidth="2" transform="rotate(-15 20 40)" /> 
                    <circle cx="50" cy="50" r="15" fill="#000" opacity="0.3" />
                 </svg>
             </div>
             
             <h2 className="text-2xl md:text-3xl font-heading text-gray-500 mb-2 tracking-widest uppercase">It's lovely here...</h2>
             <p className="text-gray-600 mb-8 font-heading text-xs md:text-sm max-w-md">No treasures found yet.</p>
             
             <Button 
                onClick={() => navigate('/items')} 
                className="bg-transparent border-2 border-amber-700 hover:bg-amber-900/30 text-amber-600 font-heading text-xs px-8 py-4 rounded-none transition-all duration-300 shadow-[0_0_10px_rgba(180,83,9,0.2)] hover:shadow-[0_0_15px_rgba(180,83,9,0.4)]"
             >
                 GO FIND ITEMS
             </Button>
        </div>
    );
};

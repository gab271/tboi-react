import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSkull, FaBook, FaUser, FaTrophy, FaDharmachakra } from 'react-icons/fa';
import { cn } from '../../lib/utils';

const BentoCard = ({ className, title, description, icon: Icon, onClick, delay, bgImage }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
        "relative overflow-hidden rounded-3xl bg-bg-1 border border-white/5 p-6 md:p-8 cursor-pointer group flex flex-col justify-between h-full hover:border-white/10 transition-colors",
        className
    )}
  >
     {/* Background Image / Gradient */}
     {bgImage && (
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-700 grayscale group-hover:grayscale-0"
            style={{ backgroundImage: `url(${bgImage})` }}
        />
     )}
     <div className="absolute inset-0 bg-gradient-to-t from-bg-1 via-bg-1/80 to-transparent z-0" />
     
     {/* Icon */}
     <div className="relative z-10 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-blood group-hover:text-white transition-colors duration-300">
        <Icon size={20} className="text-muted-foreground group-hover:text-white" />
     </div>

     {/* Content */}
     <div className="relative z-10">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground group-hover:text-gray-300 transition-colors">{description}</p>
     </div>
  </motion.div>
);

export function FeaturesGrid() {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-6 py-24">
       <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Explore the Basement</h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
             Access comprehensive data sets relative to the game's mechanics, items, and enemies.
          </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[600px]">
           
           {/* Main Large Card: Items */}
           <div className="md:col-span-2 md:row-span-2 h-[300px] md:h-full">
              <BentoCard 
                 title="Item Codex" 
                 description="The complete database of 700+ items with stats, synergies, and detailed mechanics."
                 icon={FaBook}
                 onClick={() => navigate('/items')}
                 delay={0.1}
                 className="bg-gradient-to-br from-gray-900 to-black"
                 // Placeholder aesthetic BG
              />
           </div>

           {/* Top Right: Bosses */}
           <div className="md:col-span-1 md:row-span-1 h-[250px] md:h-auto">
               <BentoCard 
                 title="Boss Bestiary" 
                 description="Learn attack patterns and health stats."
                 icon={FaSkull}
                 onClick={() => navigate('/bosses')}
                 delay={0.2}
               />
           </div>

           {/* Bottom Right Split: Profile & Builds */}
           <div className="md:col-span-1 md:row-span-1 h-[250px] md:h-auto grid grid-cols-2 gap-4">
                <BentoCard 
                    title="Account" 
                    description="Track runs."
                    icon={FaUser}
                    onClick={() => navigate('/account')}
                    delay={0.3}
                    className="p-4 rounded-2xl"
                />
                 <BentoCard 
                    title="Builds" 
                    description="Planned."
                    icon={FaDharmachakra}
                    onClick={() => navigate('/builds')}
                    delay={0.4}
                    className="p-4 rounded-2xl"
                />
           </div>
       </div>
    </section>
  );
}

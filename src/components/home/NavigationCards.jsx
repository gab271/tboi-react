import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { FaDharmachakra, FaSkull, FaGhost, FaDiceD20 } from 'react-icons/fa';

export function NavigationCards() {
  const cards = [
    {
      title: 'Items',
      description: '700+ Items detailed',
      link: '/items',
      icon: FaDharmachakra,
      bgColor: 'bg-[#e4e4db]', // Desaturated Paper
      rotate: '-rotate-1',
      delay: 0
    },
    {
       title: 'Bosses',
       description: 'Strategies & Drops',
       link: '/bosses',
       icon: FaSkull,
       bgColor: 'bg-[#dbd5d5]', // Desaturated Reddish
       rotate: 'rotate-1',
       delay: 0.1
    },
    {
       title: 'Characters',
       description: 'Stats & Unlocks',
       link: '/characters',
       icon: FaGhost,
       bgColor: 'bg-[#d1d8e0]', // Desaturated Blueish
       rotate: '-rotate-1',
       delay: 0.2
    },
    {
       title: 'Builds',
       description: 'Synergy Calculator',
       link: '/builds',
       icon: FaDiceD20,
       bgColor: 'bg-[#d6cfc7]', // Desaturated Brownish
       rotate: 'rotate-1',
       delay: 0.3
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4 md:px-0">
        {cards.map((card, _index) => (
            <NavCard key={card.title} {...card} />
        ))}
    </div>
  )
}

function NavCard({ title, description, link, icon: Icon, bgColor, rotate, delay }) {
    return (
        <NavLink to={link} className="block group h-full transform transition-all hover:z-10">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay, duration: 0.5 }}
               whileHover={{ scale: 1.05, rotate: 0 }}
               className={cn(
                  "relative h-40 sm:h-52 md:h-64 flex flex-col justify-between p-3 sm:p-4 md:p-6 overflow-hidden transition-all duration-300",
                  "border-2 sm:border-[3px] border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)]",
                  bgColor,
                  rotate
               )}
            >
                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none z-0 mix-blend-multiply"></div>
                
                {/* Header */}
                <div className="relative z-10 flex justify-between items-start">
                    <div className="p-2 sm:p-3 bg-white border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] rounded-none group-hover:bg-black group-hover:border-white transition-colors duration-300">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-black group-hover:text-white transition-colors" />
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 mt-auto">
                     <h3 className="text-lg sm:text-2xl md:text-3xl font-heading text-black mb-1 sm:mb-2 group-hover:text-accent-blood transition-colors uppercase tracking-tight drop-shadow-sm">
                        {title}
                     </h3>
                     <div className="w-8 sm:w-12 h-0.5 sm:h-1 bg-black mb-2 sm:mb-3 group-hover:w-full transition-all duration-500 ease-out"></div>
                     <p className="font-handwriting text-sm sm:text-lg md:text-xl text-black/90 font-bold leading-tight hidden sm:block">
                        {description}
                     </p>
                </div>

                {/* Large Background Icon */}
                <Icon className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 text-black opacity-[0.05] group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500" />
            
            </motion.div>
        </NavLink>
    )
}

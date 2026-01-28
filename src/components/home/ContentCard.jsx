// ContentCard.jsx - Reusable Card for "Browse sections"
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { NavLink } from 'react-router-dom';

export function ContentCard({ title, description, link, icon: Icon, color = "bg-white", rotate = "rotate-0" }) {
    return (
        <NavLink to={link} className="block group font-sans">
            <motion.div 
                whileHover={{ scale: 1.02, rotate: 0 }}
                className={cn(
                    "relative p-6 h-full flex flex-col justify-between overflow-hidden transition-all duration-300",
                    "border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]",
                    color,
                    rotate
                )}
            >
                {/* Header with Icon */}
                <div className="flex items-start justify-between mb-4 z-10 relative">
                    <div className="p-3 bg-white border-2 border-black rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        {Icon && <Icon className="w-8 h-8 text-black" />}
                    </div>
                </div>

                {/* Text Content */}
                <div className="z-10 relative mt-auto">
                    <h3 className="text-3xl font-heading text-black mb-2 group-hover:text-accent-blood transition-colors uppercase tracking-tight">
                        {title}
                    </h3>
                    <p className="font-handwriting text-xl text-black/80 font-bold leading-tight">
                        {description}
                    </p>
                </div>

                {/* Decorative Background Elements (Simple Sketches) */}
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                    {Icon && <Icon className="w-40 h-40 text-black" />}
                </div>
            </motion.div>
        </NavLink>
    );
}

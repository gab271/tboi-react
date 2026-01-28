import { motion } from 'framer-motion';

export const SecretItemCard = ({ item, onClick, index }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      onClick={() => onClick(item)}
      className="relative flex flex-col items-center justify-center p-6 cursor-pointer group animate-float"
      style={{ animationDelay: `${index * 0.5}s` }}
    >
      {/* Glow Effect Background */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Item Image */}
      <div className="relative z-10 w-28 h-28 md:w-32 md:h-32 flex items-center justify-center">
        <img
          src={item.image_url || '/placeholder.png'}
          alt={item.name}
          className="max-w-full max-h-full object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] group-hover:drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] transition-all duration-300"
          loading="lazy"
        />
      </div>

      {/* Item Name Tooltip */}
      <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 whitespace-nowrap">
          <span className="text-white font-heading text-[10px] tracking-widest uppercase px-2 py-1 drop-shadow-[0_2px_0_rgba(0,0,0,1)] text-shadow-black">
            {item.name}
          </span>
      </div>
    </motion.div>
  );
};

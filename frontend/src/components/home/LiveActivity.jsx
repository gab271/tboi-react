/**
 * LiveActivity Component
 * Muestra actividad real de la comunidad con textos que rotan
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActivityTexts } from '../../lib/activityDisplay';
import { fetchLiveActivity } from '../../lib/api';

export function LiveActivity({ className = '' }) {
  const [stats, setStats] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stats cada 30 segundos
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchLiveActivity();
        if (data.ok) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Rotar textos cada 4 segundos
  const texts = getActivityTexts(stats);
  
  useEffect(() => {
    if (texts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(i => (i + 1) % texts.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [texts.length]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-text-dim ${className}`}>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        <span className="font-handwriting">Cargando...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-text-dim ${className}`}>
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="font-handwriting"
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/**
 * Versión compacta para header
 */
export function LiveActivityBadge() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchLiveActivity();
        if (data.ok) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!stats || stats.usersActive === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-600 text-xs font-heading rounded">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      {stats.usersActive} online
    </div>
  );
}

export default LiveActivity;

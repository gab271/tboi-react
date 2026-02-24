/**
 * GlobalStatsPanel - Panel de estadísticas globales (PRO)
 * Muestra winrate impact, pick rate, items compatibles
 */
import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FaChartLine, FaUsers, FaTrophy, FaHandshake, FaCrown, FaLock } from 'react-icons/fa';
import { useFeatures } from '../../../hooks/useFeatures';
import { cn } from '../../../lib/utils';

// Mock data for global stats - in production this comes from backend
const mockGlobalStats = {
  topPicked: [
    { id: 182, name: 'Sacred Heart', pickRate: 0.89, winRateImpact: +12.3 },
    { id: 118, name: 'Brimstone', pickRate: 0.87, winRateImpact: +10.1 },
    { id: 114, name: "Mom's Knife", pickRate: 0.85, winRateImpact: +9.8 },
    { id: 329, name: 'Godhead', pickRate: 0.82, winRateImpact: +11.5 },
    { id: 395, name: 'Tech X', pickRate: 0.81, winRateImpact: +8.7 },
  ],
  topWinRate: [
    { id: 182, name: 'Sacred Heart', winRateImpact: +12.3 },
    { id: 329, name: 'Godhead', winRateImpact: +11.5 },
    { id: 118, name: 'Brimstone', winRateImpact: +10.1 },
    { id: 114, name: "Mom's Knife", winRateImpact: +9.8 },
    { id: 169, name: 'Polyphemus', winRateImpact: +8.9 },
  ],
  recentTrends: [
    { name: 'Soy Milk + Brimstone', change: +5.2, reason: 'Rediscovered meta' },
    { name: 'Tech X builds', change: +3.1, reason: 'Consistent damage' },
    { name: 'Knife variants', change: -2.3, reason: 'Skill floor' },
  ]
};

export const GlobalStatsPanel = memo(function GlobalStatsPanel() {
  const { isPro } = useFeatures();
  
  // En producción: fetch real data
  // const { data: stats } = useQuery(['global-stats'], fetchGlobalStats);
  const stats = mockGlobalStats;
  
  if (!isPro) {
    return <LockedPanel />;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-48 space-y-4"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-gold/20 to-transparent p-4 rounded-lg border border-accent-gold/30">
        <h3 className="font-heading text-lg text-white flex items-center gap-2">
          <FaChartLine className="text-accent-gold" />
          Global Statistics
          <span className="ml-auto text-xs bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded">
            PRO
          </span>
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Data from community builds
        </p>
      </div>
      
      {/* Top Picked Items */}
      <StatsCard 
        title="Most Picked" 
        icon={<FaUsers className="text-blue-400" />}
      >
        <div className="space-y-2">
          {stats.topPicked.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-900/50 text-blue-300 text-xs rounded flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-white truncate">{item.name}</span>
              <span className="text-xs text-gray-400">{(item.pickRate * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </StatsCard>
      
      {/* Win Rate Impact */}
      <StatsCard 
        title="Win Rate Impact" 
        icon={<FaTrophy className="text-yellow-400" />}
      >
        <div className="space-y-2">
          {stats.topWinRate.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="w-5 h-5 bg-yellow-900/50 text-yellow-300 text-xs rounded flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-white truncate">{item.name}</span>
              <span className={cn(
                "text-xs font-bold",
                item.winRateImpact > 0 ? "text-green-400" : "text-red-400"
              )}>
                {item.winRateImpact > 0 ? '+' : ''}{item.winRateImpact}%
              </span>
            </div>
          ))}
        </div>
      </StatsCard>
      
      {/* Recent Trends */}
      <StatsCard 
        title="Meta Trends" 
        icon={<FaHandshake className="text-purple-400" />}
      >
        <div className="space-y-3">
          {stats.recentTrends.map((trend, i) => (
            <div key={i} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white">{trend.name}</span>
                <span className={cn(
                  "text-xs font-bold",
                  trend.change > 0 ? "text-green-400" : "text-red-400"
                )}>
                  {trend.change > 0 ? '↑' : '↓'} {Math.abs(trend.change)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{trend.reason}</p>
            </div>
          ))}
        </div>
      </StatsCard>
      
      {/* Data Source */}
      <div className="text-center text-xs text-gray-600 py-2">
        Based on 50,000+ analyzed builds
      </div>
    </motion.div>
  );
});

// Stats Card Component
function StatsCard({ title, icon, children }) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        {icon}
        <h4 className="font-heading text-sm text-white uppercase tracking-wider">{title}</h4>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

// Locked Panel for non-PRO users
function LockedPanel() {
  return (
    <div className="sticky top-48 bg-[#1a1a1a] rounded-lg border border-white/10 p-6 text-center">
      <div className="w-16 h-16 mx-auto bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
        <FaLock className="text-2xl text-yellow-600" />
      </div>
      <h3 className="font-heading text-lg text-white mb-2">Global Statistics</h3>
      <p className="text-gray-400 text-sm mb-4">
        Access community insights, win rate data, and meta trends
      </p>
      <button className="flex items-center gap-2 mx-auto px-4 py-2 bg-accent-gold text-black font-bold rounded hover:bg-yellow-400 transition-colors">
        <FaCrown />
        Upgrade to PRO
      </button>
      
      {/* Preview of what's available */}
      <div className="mt-6 pt-4 border-t border-white/10 text-left">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Includes:</p>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
            Win rate impact per item
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
            Most compatible items
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
            Meta trend analysis
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
            Community pick rates
          </li>
        </ul>
      </div>
    </div>
  );
}

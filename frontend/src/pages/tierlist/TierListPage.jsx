import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaSearch, FaTimes, FaUser, FaGlobe, FaSkull, FaVoteYea, FaChevronDown, FaChevronUp, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { fetchTierList, fetchMyTierVotes, castTierVote, removeTierVote, fetchItems } from '../../lib/api';
import { charactersData } from '../../features/characters/data/charactersData';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIERS = ['S', 'A', 'B', 'C', 'D', 'F'];

const TIER_CONFIG = {
  S: {
    rowBg: 'bg-gradient-to-r from-yellow-500/20 via-amber-400/10 to-transparent',
    border: 'border-yellow-500/60',
    label: 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]',
    badge: 'bg-yellow-500 text-black',
    glow: 'shadow-[inset_0_0_40px_rgba(234,179,8,0.12)]',
    desc: 'Godlike',
  },
  A: {
    rowBg: 'bg-gradient-to-r from-orange-500/18 to-transparent',
    border: 'border-orange-500/50',
    label: 'text-orange-400',
    badge: 'bg-orange-500 text-black',
    glow: '',
    desc: 'Excellent',
  },
  B: {
    rowBg: 'bg-gradient-to-r from-green-600/15 to-transparent',
    border: 'border-green-600/45',
    label: 'text-green-500',
    badge: 'bg-green-600 text-white',
    glow: '',
    desc: 'Good',
  },
  C: {
    rowBg: 'bg-gradient-to-r from-blue-600/15 to-transparent',
    border: 'border-blue-500/45',
    label: 'text-blue-400',
    badge: 'bg-blue-600 text-white',
    glow: '',
    desc: 'Average',
  },
  D: {
    rowBg: 'bg-gradient-to-r from-stone-600/12 to-transparent',
    border: 'border-stone-500/35',
    label: 'text-stone-400',
    badge: 'bg-stone-600 text-white',
    glow: '',
    desc: 'Below avg.',
  },
  F: {
    rowBg: 'bg-gradient-to-r from-neutral-800/25 to-transparent',
    border: 'border-neutral-700/40',
    label: 'text-neutral-500',
    badge: 'bg-neutral-700 text-neutral-300',
    glow: '',
    desc: 'Trash',
  },
};

const RUN_TYPES = [
  { value: 'normal',    label: 'Normal' },
  { value: 'greed',     label: 'Greed' },
  { value: 'greedier',  label: 'Greedier!' },
  { value: 'challenge', label: 'Challenge' },
];

const CHARACTER_OPTIONS = [
  { id: 'ALL', name: 'All Characters', image: null },
  ...charactersData,
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ItemCard({ item, myTier, communityTier, onClick, delay = 0 }) {
  const cfg = communityTier ? TIER_CONFIG[communityTier] : null;
  const myVoteCfg = myTier ? TIER_CONFIG[myTier] : null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.2, ease: 'backOut' }}
      whileHover={{ scale: 1.15, y: -4, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(item)}
      className="relative group flex-shrink-0 w-12 h-12 bg-black/20 border-2 border-text-ink/20 hover:border-text-ink/60 transition-colors cursor-pointer"
      title={item.name}
    >
      <img
        src={item.image || item.sprite_url}
        alt={item.name}
        className="w-full h-full object-contain p-0.5 image-rendering-pixelated"
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => { e.target.style.opacity = '0.3'; }}
      />

      {/* My vote badge */}
      {myVoteCfg && (
        <span className={cn(
          'absolute -top-1.5 -right-1.5 w-4 h-4 rounded-none font-heading text-[7px] flex items-center justify-center border border-black',
          myVoteCfg.badge
        )}>
          {myTier}
        </span>
      )}

      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/90 border border-text-ink/40 px-2 py-1 whitespace-nowrap">
          <span className="font-handwriting text-xs text-white">{item.name}</span>
          {cfg && (
            <span className={cn('ml-2 font-heading text-[8px]', cfg.label)}>
              {communityTier} · {item.score?.vote_count ?? 0}v
            </span>
          )}
        </div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90 mx-auto" />
      </div>
    </motion.button>
  );
}

function TierRow({ tier, items, myVoteMap, onItemClick, delay }) {
  const cfg = TIER_CONFIG[tier];
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'flex gap-0 border-2 min-h-[72px] overflow-hidden',
        cfg.border,
        cfg.glow,
      )}
    >
      {/* Tier label column */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className={cn(
          'flex-shrink-0 w-16 flex flex-col items-center justify-center gap-0.5 border-r-2',
          cfg.border,
          cfg.rowBg,
          'hover:brightness-110 transition-all'
        )}
      >
        <span className={cn('font-heading text-3xl leading-none', cfg.label)}>
          {tier}
        </span>
        <span className="font-pixel text-[9px] text-text-dim leading-none">{cfg.desc}</span>
        <span className="mt-1 text-text-dim/50">
          {collapsed ? <FaChevronDown size={8} /> : <FaChevronUp size={8} />}
        </span>
      </button>

      {/* Items area */}
      <div className={cn('flex-1 min-w-0', cfg.rowBg)}>
        {!collapsed ? (
          <div className="flex flex-wrap gap-1.5 p-2">
            {items.length === 0 ? (
              <span className="font-handwriting text-text-dim/50 text-sm self-center px-2">
                No items ranked here yet
              </span>
            ) : (
              items.map((item, i) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  myTier={myVoteMap.get(item.id)}
                  communityTier={tier}
                  onClick={onItemClick}
                  delay={i * 0.02}
                />
              ))
            )}
          </div>
        ) : (
          <div className="flex items-center px-3 h-full">
            <span className="font-handwriting text-text-dim text-sm">
              {items.length} items hidden
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function VoteModal({ item, myTier, communityTier, onVote, onClose, isLoading, isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-bg-paper border-4 border-text-ink shadow-[8px_8px_0px_#000] w-full max-w-sm p-4"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-dashed border-text-ink/30">
          <img
            src={item.image || item.sprite_url}
            alt={item.name}
            className="w-12 h-12 object-contain border-2 border-text-ink/30"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-sm text-text-heading leading-tight truncate">{item.name}</h3>
            {communityTier && (
              <p className="font-handwriting text-xs text-text-dim mt-0.5">
                Community: <span className={cn('font-heading text-[10px]', TIER_CONFIG[communityTier].label)}>{communityTier}</span>
                {item.score && <span className="text-text-dim/60"> · {item.score.vote_count} votes</span>}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-accent-blood transition-colors">
            <FaTimes />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-4 space-y-3">
            <FaLock className="mx-auto text-text-dim text-2xl" />
            <p className="font-handwriting text-text-secondary">Log in to cast your vote</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full font-heading text-xs bg-accent-blood text-white py-2 border-2 border-text-ink hover:brightness-110 transition-all shadow-[3px_3px_0_#000]"
            >
              LOG IN
            </button>
          </div>
        ) : (
          <>
            <p className="font-handwriting text-text-secondary text-sm mb-3">
              {myTier ? `Your vote: ${myTier} — change it:` : 'Rate this item:'}
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {TIERS.map(t => {
                const cfg = TIER_CONFIG[t];
                const isMyVote = myTier === t;
                return (
                  <motion.button
                    key={t}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !isLoading && onVote(t)}
                    disabled={isLoading}
                    className={cn(
                      'py-3 font-heading text-lg border-2 transition-all shadow-[2px_2px_0_#000]',
                      isMyVote
                        ? cn(cfg.badge, 'border-text-ink scale-110 shadow-[3px_3px_0_#000]')
                        : 'bg-bg-paper-dark border-text-ink/40 hover:border-text-ink text-text-ink'
                    )}
                  >
                    {isLoading && isMyVote === t ? '…' : t}
                  </motion.button>
                );
              })}
            </div>

            {myTier && (
              <p className="text-center mt-3 font-handwriting text-xs text-text-dim">
                Click the same tier to change · you can revote anytime
              </p>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function SearchVotePanel({ characterId, runType, myVoteMap, onItemClick }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['items-vote-search', debouncedSearch],
    queryFn: () => fetchItems({ search: debouncedSearch, page: 0 }),
    staleTime: 60_000,
  });

  const items = data?.data || [];

  return (
    <div className="border-2 border-text-ink/30 border-dashed p-4">
      <h3 className="font-heading text-xs text-text-dim mb-3 uppercase tracking-widest">
        Vote on any item
      </h3>

      <div className="relative mb-3">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-sm" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full bg-bg-paper-dark border-2 border-text-ink/40 focus:border-text-ink pl-9 pr-3 py-2 font-handwriting text-lg text-text-ink placeholder:text-text-dim outline-none transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-ink">
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-12 h-12 bg-text-ink/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
          {items.map((item, i) => (
            <ItemCard
              key={item.id}
              item={item}
              myTier={myVoteMap.get(item.id)}
              communityTier={null}
              onClick={onItemClick}
              delay={i * 0.01}
            />
          ))}
          {!debouncedSearch && items.length === 0 && (
            <span className="font-handwriting text-text-dim text-sm">Start typing to search items...</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function TierListPage() {
  const { user, session } = useAuth();
  const token = session?.access_token;
  const qc = useQueryClient();

  const [characterId, setCharacterId] = useState('ALL');
  const [runType, setRunType] = useState('normal');
  const [voteTarget, setVoteTarget] = useState(null);
  const [charMenuOpen, setCharMenuOpen] = useState(false);
  const [showVotePanel, setShowVotePanel] = useState(false);
  const charMenuRef = useRef(null);

  // Close char menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (charMenuRef.current && !charMenuRef.current.contains(e.target)) {
        setCharMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const context = { character_id: characterId, run_type: runType };

  const { data: tierScores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ['tierlist', characterId, runType],
    queryFn: () => fetchTierList(context),
    staleTime: 2 * 60_000,
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ['my-tier-votes', characterId, runType],
    queryFn: () => fetchMyTierVotes(token, context),
    enabled: !!user && !!token,
    staleTime: 2 * 60_000,
  });

  // Fetch item details for all scored items
  const scoredIds = useMemo(() => tierScores.map(s => s.item_id), [tierScores]);
  const { data: scoredItemsData } = useQuery({
    queryKey: ['items-by-ids', scoredIds.join(',')],
    queryFn: () => fetchItems({ ids: scoredIds, page: 0 }),
    enabled: scoredIds.length > 0,
    staleTime: 10 * 60_000,
  });

  const scoreMap = useMemo(() => {
    const m = new Map();
    tierScores.forEach(s => m.set(s.item_id, s));
    return m;
  }, [tierScores]);

  const myVoteMap = useMemo(() => {
    const m = new Map();
    myVotes.forEach(v => m.set(v.item_id, v.tier));
    return m;
  }, [myVotes]);

  const itemMap = useMemo(() => {
    const m = new Map();
    (scoredItemsData?.data || []).forEach(item => m.set(item.id, item));
    return m;
  }, [scoredItemsData]);

  const tierGroups = useMemo(() => {
    const groups = Object.fromEntries(TIERS.map(t => [t, []]));
    tierScores.forEach(score => {
      const item = itemMap.get(score.item_id);
      if (item && groups[score.computed_tier]) {
        groups[score.computed_tier].push({ ...item, score });
      }
    });
    return groups;
  }, [tierScores, itemMap]);

  const voteMutation = useMutation({
    mutationFn: ({ item_id, tier }) =>
      castTierVote(token, { item_id, tier, character_id: characterId, run_type: runType }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tierlist', characterId, runType] });
      qc.invalidateQueries({ queryKey: ['my-tier-votes', characterId, runType] });
      setVoteTarget(null);
    },
  });

  const selectedChar = CHARACTER_OPTIONS.find(c => c.id === characterId);
  const totalVotes = tierScores.reduce((acc, s) => acc + (s.vote_count || 0), 0);
  const totalRanked = tierScores.length;

  return (
    <div className="min-h-screen bg-bg-paper text-text-ink">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="relative py-6 px-4 text-center mb-2">
        <div className="absolute top-4 left-6 w-3 h-3 rounded-full bg-[#1a1a1a] border-2 border-[#555] shadow-lg" />
        <div className="absolute top-4 right-6 w-3 h-3 rounded-full bg-[#1a1a1a] border-2 border-[#555] shadow-lg" />

        <div className="inline-block relative">
          <h1 className="font-heading text-2xl md:text-4xl text-text-heading drop-shadow-[3px_3px_0_#000] -rotate-1">
            COMMUNITY <span className="text-accent-blood">TIER LIST</span>
          </h1>
          <svg className="absolute -bottom-2 left-0 w-full h-3 text-text-ink" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0,5 Q25,9 50,5 T100,6" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="mt-5 flex items-center justify-center gap-6 font-handwriting text-text-dim text-sm">
          <span className="flex items-center gap-1.5">
            <FaGlobe size={12} />
            {totalRanked} items ranked
          </span>
          <span className="w-px h-4 bg-text-ink/20" />
          <span className="flex items-center gap-1.5">
            <FaVoteYea size={12} />
            {totalVotes.toLocaleString()} votes
          </span>
          {user && (
            <>
              <span className="w-px h-4 bg-text-ink/20" />
              <span className="flex items-center gap-1.5 text-accent-blood">
                <FaUser size={12} />
                {myVotes.length} your votes
              </span>
            </>
          )}
        </div>
      </header>

      {/* ── CONTEXT FILTERS ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 p-3 bg-bg-paper-dark border-2 border-text-ink/30 border-dashed">

          {/* Character selector */}
          <div className="relative flex-1" ref={charMenuRef}>
            <button
              onClick={() => setCharMenuOpen(o => !o)}
              className="w-full flex items-center gap-2 bg-bg-paper border-2 border-text-ink/40 hover:border-text-ink px-3 py-2 transition-colors text-left"
            >
              {selectedChar?.image ? (
                <img src={selectedChar.image} alt="" className="w-6 h-6 object-contain" style={{ imageRendering: 'pixelated' }} />
              ) : (
                <FaUser className="text-text-dim w-4 h-4" />
              )}
              <span className="font-handwriting text-base flex-1">{selectedChar?.name || 'All Characters'}</span>
              <FaChevronDown className="text-text-dim text-xs" />
            </button>

            <AnimatePresence>
              {charMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 z-30 bg-bg-paper border-2 border-text-ink shadow-[4px_4px_0_#000] max-h-64 overflow-y-auto"
                >
                  {CHARACTER_OPTIONS.map(char => (
                    <button
                      key={char.id}
                      onClick={() => { setCharacterId(char.id); setCharMenuOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 hover:bg-accent-blood/10 transition-colors text-left',
                        characterId === char.id && 'bg-accent-blood/15 text-accent-blood'
                      )}
                    >
                      {char.image ? (
                        <img src={char.image} alt="" className="w-5 h-5 object-contain" style={{ imageRendering: 'pixelated' }} />
                      ) : (
                        <FaGlobe className="w-4 h-4 text-text-dim flex-shrink-0" />
                      )}
                      <span className="font-handwriting text-sm">{char.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Run type tabs */}
          <div className="flex gap-1">
            {RUN_TYPES.map(rt => (
              <button
                key={rt.value}
                onClick={() => setRunType(rt.value)}
                className={cn(
                  'flex-1 sm:flex-none px-3 py-2 font-heading text-[10px] border-2 transition-all shadow-[2px_2px_0_#000]',
                  runType === rt.value
                    ? 'bg-accent-blood text-white border-accent-blood'
                    : 'bg-bg-paper border-text-ink/40 hover:border-text-ink text-text-ink'
                )}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TIER BOARD ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 space-y-1.5 mb-8">
        {scoresLoading ? (
          <div className="space-y-1.5">
            {TIERS.map(t => (
              <div key={t} className="h-16 bg-text-ink/5 animate-pulse border-2 border-text-ink/10" />
            ))}
          </div>
        ) : (
          <>
            {TIERS.map((tier, i) => (
              <TierRow
                key={tier}
                tier={tier}
                items={tierGroups[tier] || []}
                myVoteMap={myVoteMap}
                onItemClick={setVoteTarget}
                delay={i * 0.07}
              />
            ))}

            {totalRanked === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 border-2 border-dashed border-text-ink/20"
              >
                <FaSkull className="mx-auto text-4xl text-text-dim mb-4 opacity-30" />
                <p className="font-heading text-xs text-text-dim mb-2">NO VOTES YET</p>
                <p className="font-handwriting text-text-secondary text-lg">
                  Be the first to rank an item!
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ── VOTE PANEL ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 mb-12">
        <button
          onClick={() => setShowVotePanel(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 border-2 border-text-ink/40 hover:border-text-ink bg-bg-paper-dark transition-colors mb-3"
        >
          <span className="font-heading text-xs text-text-dim uppercase tracking-widest">
            {showVotePanel ? '▲ Hide' : '▼ Add votes'} — rank any item
          </span>
          <span className="font-handwriting text-sm text-text-dim">
            {!user && '(login required)'}
          </span>
        </button>

        <AnimatePresence>
          {showVotePanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <SearchVotePanel
                characterId={characterId}
                runType={runType}
                myVoteMap={myVoteMap}
                onItemClick={setVoteTarget}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── VOTE MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {voteTarget && (
          <VoteModal
            item={voteTarget}
            myTier={myVoteMap.get(voteTarget.id)}
            communityTier={scoreMap.get(voteTarget.id)?.computed_tier}
            onVote={(tier) => voteMutation.mutate({ item_id: voteTarget.id, tier })}
            onClose={() => setVoteTarget(null)}
            isLoading={voteMutation.isPending}
            isAuthenticated={!!user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default TierListPage;

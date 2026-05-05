import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FaSearch, FaTimes, FaPlus, FaChevronUp, FaChevronDown,
    FaDesktop, FaGamepad, FaCopy, FaCheck, FaFire, FaClock,
    FaSkull, FaUser, FaLock,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { fetchSeeds, fetchSeedTags, submitSeed, voteSeed, fetchMySeedVotes } from '../../lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const VERSIONS = [
    { value: 'all',              label: 'All Versions', short: 'ALL',  color: 'bg-text-ink/20 text-text-ink' },
    { value: 'repentance_plus',  label: 'Repentance+',  short: 'REP+', color: 'bg-purple-700 text-white' },
    { value: 'repentance',       label: 'Repentance',   short: 'REP',  color: 'bg-red-800 text-white' },
    { value: 'afterbirth_plus',  label: 'Afterbirth+',  short: 'AB+',  color: 'bg-orange-600 text-white' },
    { value: 'rebirth',          label: 'Rebirth',      short: 'REB',  color: 'bg-blue-700 text-white' },
];

const PLATFORMS = [
    { value: 'all',         label: 'All',         icon: null },
    { value: 'pc',          label: 'PC',          icon: FaDesktop },
    { value: 'switch',      label: 'Switch',      icon: FaGamepad },
    { value: 'playstation', label: 'PlayStation', icon: FaGamepad },
    { value: 'xbox',        label: 'Xbox',        icon: FaGamepad },
];

const SORTS = [
    { value: 'top', label: 'Top',    icon: FaFire },
    { value: 'new', label: 'New',    icon: FaClock },
];

const SUGGESTED_TAGS = [
    'godly-start', 'tech-x', 'brimstone', 'broken', 'greed-mode',
    'dead-cat', 'the-lost', 'keeper', 'no-treasure', 'sacred-heart',
    'mom-knife', 'd6', 'max-stats', 'challenge', 'speed-run',
    'ipecac', 'monstros-lung', 'guppy', 'fun', 'hard',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSeedDisplay(code) {
    if (!code) return '';
    const clean = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
    return clean.length > 4 ? `${clean.slice(0, 4)} ${clean.slice(4, 8)}` : clean;
}

function normalizeSeed(raw) {
    return String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

function getVersionCfg(value) {
    return VERSIONS.find(v => v.value === value) || VERSIONS[0];
}

// ─── SeedCard ─────────────────────────────────────────────────────────────────

function SeedCard({ seed, myVote, onVote, onCopy, isAuthenticated, delay }) {
    const verCfg = getVersionCfg(seed.game_version);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(formatSeedDisplay(seed.seed_code));
        setCopied(true);
        onCopy?.();
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3, ease: 'easeOut' }}
            className="group relative bg-bg-paper border-[3px] border-text-ink/80 shadow-[5px_5px_0_#000] hover:shadow-[7px_7px_0_#000] hover:-translate-y-0.5 transition-all flex flex-col"
        >
            {/* ── Seed code hero ── */}
            <div className="relative bg-black px-4 py-3 flex items-center justify-between gap-3">
                {/* Pixel scanline overlay */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.5) 2px,rgba(255,255,255,0.5) 3px)' }}
                />
                <span className="font-heading text-xl md:text-2xl text-accent-gold tracking-widest drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] select-all z-10">
                    {formatSeedDisplay(seed.seed_code)}
                </span>
                <button
                    onClick={handleCopy}
                    className="z-10 flex-shrink-0 p-1.5 text-white/40 hover:text-accent-gold transition-colors"
                    title="Copy seed"
                >
                    {copied ? <FaCheck size={12} className="text-green-400" /> : <FaCopy size={12} />}
                </button>
            </div>

            {/* ── Meta row ── */}
            <div className="px-3 pt-2.5 pb-1 flex items-center gap-2 flex-wrap">
                <span className={cn('font-heading text-[9px] px-2 py-0.5', verCfg.color)}>
                    {verCfg.short}
                </span>
                {seed.platform && seed.platform !== 'pc' && (
                    <span className="font-pixel text-xs text-text-secondary uppercase">
                        {seed.platform}
                    </span>
                )}
            </div>

            {/* ── Title ── */}
            <div className="px-3 pb-1">
                <h3 className="font-heading text-xs text-text-heading leading-snug line-clamp-2">
                    {seed.title}
                </h3>
            </div>

            {/* ── Tags ── */}
            {seed.tags?.length > 0 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1">
                    {seed.tags.slice(0, 5).map(tag => (
                        <span key={tag} className="font-pixel text-[10px] px-1.5 py-0.5 bg-accent-blood/10 text-accent-blood border border-accent-blood/30">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* ── Footer: author + votes ── */}
            <div className="mt-auto px-3 py-2 border-t-2 border-dashed border-text-ink/15 flex items-center justify-between gap-2">
                <span className="font-handwriting text-xs text-text-dim flex items-center gap-1 truncate">
                    <FaUser size={9} />
                    {seed.author?.username || 'Anonymous'}
                </span>

                {/* Vote buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <VoteButton
                        direction={1}
                        active={myVote === 1}
                        onClick={() => onVote(seed.id, 1)}
                        isAuthenticated={isAuthenticated}
                    />
                    <span className={cn(
                        'font-heading text-xs min-w-[28px] text-center tabular-nums',
                        seed.score > 0 ? 'text-green-600' : seed.score < 0 ? 'text-accent-blood' : 'text-text-dim'
                    )}>
                        {seed.score > 0 ? '+' : ''}{seed.score}
                    </span>
                    <VoteButton
                        direction={-1}
                        active={myVote === -1}
                        onClick={() => onVote(seed.id, -1)}
                        isAuthenticated={isAuthenticated}
                    />
                </div>
            </div>
        </motion.article>
    );
}

function VoteButton({ direction, active, onClick, isAuthenticated }) {
    const navigate = useNavigate();
    const Icon = direction === 1 ? FaChevronUp : FaChevronDown;

    const handleClick = () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        onClick();
    };

    return (
        <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleClick}
            className={cn(
                'w-6 h-6 flex items-center justify-center border transition-all',
                active
                    ? direction === 1
                        ? 'bg-green-600 border-green-700 text-white'
                        : 'bg-accent-blood border-red-900 text-white'
                    : 'bg-bg-paper-dark border-text-ink/30 text-text-dim hover:border-text-ink hover:text-text-ink'
            )}
        >
            <Icon size={9} />
        </motion.button>
    );
}

// ─── SubmitModal ──────────────────────────────────────────────────────────────

function SubmitModal({ onClose, onSuccess, token }) {
    const [form, setForm] = useState({
        seed_code: '', title: '', description: '',
        game_version: 'repentance_plus', platform: 'pc', tags: [],
    });
    const [tagInput, setTagInput] = useState('');
    const [seedValid, setSeedValid] = useState(null); // null | true | false
    const qc = useQueryClient();

    const mutation = useMutation({
        mutationFn: (payload) => submitSeed(token, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['seeds'] });
            onSuccess?.();
            onClose();
        },
    });

    const handleSeedInput = (e) => {
        const normalized = normalizeSeed(e.target.value);
        setForm(f => ({ ...f, seed_code: normalized }));
        if (normalized.length === 0) setSeedValid(null);
        else setSeedValid(normalized.length === 8);
    };

    const addTag = (tag) => {
        const t = tag.toLowerCase().trim().replace(/\s+/g, '-');
        if (t && !form.tags.includes(t) && form.tags.length < 10) {
            setForm(f => ({ ...f, tags: [...f.tags, t] }));
        }
        setTagInput('');
    };

    const handleTagKey = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!seedValid) return;
        mutation.mutate(form);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-bg-paper border-4 border-text-ink shadow-[10px_10px_0_#000] w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-dashed border-text-ink/30">
                    <h2 className="font-heading text-sm text-text-heading">SHARE A SEED</h2>
                    <button onClick={onClose} className="text-text-dim hover:text-accent-blood">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Seed code input */}
                    <div>
                        <label className="font-heading text-[10px] text-text-dim uppercase tracking-wider block mb-1.5">
                            Seed Code *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formatSeedDisplay(form.seed_code)}
                                onChange={handleSeedInput}
                                placeholder="N0TB 4D4T"
                                maxLength={9}
                                className={cn(
                                    'w-full bg-black text-accent-gold font-heading text-2xl tracking-[0.3em] text-center py-3 border-2 outline-none transition-colors',
                                    seedValid === true  ? 'border-green-500' :
                                    seedValid === false ? 'border-accent-blood' :
                                                         'border-text-ink/40 focus:border-text-ink'
                                )}
                            />
                            {seedValid === true && (
                                <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={14} />
                            )}
                        </div>
                        <p className="mt-1 font-handwriting text-xs text-text-dim">
                            {form.seed_code.length}/8 chars · letters A–Z and numbers 0–9 only
                        </p>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="font-heading text-[10px] text-text-dim uppercase tracking-wider block mb-1.5">
                            Title * <span className="normal-case font-handwriting">(3–60 chars)</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Godly Tech X start with brimstone..."
                            maxLength={60}
                            required
                            className="w-full bg-bg-paper-dark border-2 border-text-ink/40 focus:border-text-ink px-3 py-2 font-handwriting text-base text-text-ink placeholder:text-text-dim outline-none"
                        />
                    </div>

                    {/* Version + Platform */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-heading text-[10px] text-text-dim uppercase tracking-wider block mb-1.5">Version *</label>
                            <select
                                value={form.game_version}
                                onChange={e => setForm(f => ({ ...f, game_version: e.target.value }))}
                                className="w-full bg-bg-paper-dark border-2 border-text-ink/40 focus:border-text-ink px-2 py-2 font-heading text-xs text-text-ink outline-none"
                            >
                                {VERSIONS.slice(1).map(v => (
                                    <option key={v.value} value={v.value}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="font-heading text-[10px] text-text-dim uppercase tracking-wider block mb-1.5">Platform *</label>
                            <select
                                value={form.platform}
                                onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                                className="w-full bg-bg-paper-dark border-2 border-text-ink/40 focus:border-text-ink px-2 py-2 font-heading text-xs text-text-ink outline-none"
                            >
                                {PLATFORMS.slice(1).map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="font-heading text-[10px] text-text-dim uppercase tracking-wider block mb-1.5">
                            Tags <span className="normal-case font-handwriting">(up to 10)</span>
                        </label>
                        {/* Selected tags */}
                        {form.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {form.tags.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}
                                        className="flex items-center gap-1 font-pixel text-[10px] px-2 py-0.5 bg-accent-blood/15 text-accent-blood border border-accent-blood/40 hover:bg-accent-blood/30"
                                    >
                                        {tag} <FaTimes size={8} />
                                    </button>
                                ))}
                            </div>
                        )}
                        <input
                            type="text"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleTagKey}
                            placeholder="Type a tag and press Enter..."
                            className="w-full bg-bg-paper-dark border-2 border-text-ink/40 focus:border-text-ink px-3 py-1.5 font-handwriting text-sm text-text-ink placeholder:text-text-dim outline-none mb-2"
                        />
                        {/* Suggestions */}
                        <div className="flex flex-wrap gap-1">
                            {SUGGESTED_TAGS.filter(t => !form.tags.includes(t)).slice(0, 10).map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => addTag(tag)}
                                    className="font-pixel text-[9px] px-1.5 py-0.5 bg-text-ink/5 text-text-dim border border-text-ink/20 hover:border-text-ink hover:text-text-ink transition-colors"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="font-heading text-[10px] text-text-dim uppercase tracking-wider block mb-1.5">
                            Notes <span className="normal-case font-handwriting">(optional)</span>
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="What makes this seed special? Any tips?"
                            rows={3}
                            className="w-full bg-bg-paper-dark border-2 border-text-ink/40 focus:border-text-ink px-3 py-2 font-handwriting text-sm text-text-ink placeholder:text-text-dim outline-none resize-none"
                        />
                    </div>

                    {/* Error */}
                    {mutation.isError && (
                        <p className="font-handwriting text-sm text-accent-blood bg-accent-blood/10 px-3 py-2 border border-accent-blood/30">
                            {mutation.error?.response?.data?.error || 'Something went wrong.'}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!seedValid || mutation.isPending}
                        className="w-full font-heading text-xs bg-accent-blood text-white py-3 border-2 border-text-ink hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0_#000] transition-all"
                    >
                        {mutation.isPending ? 'SUBMITTING...' : 'SHARE SEED'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function SeedsPage() {
    const { user, session } = useAuth();
    const token = session?.access_token;
    const qc = useQueryClient();
    const navigate = useNavigate();

    const [version,     setVersion]     = useState('all');
    const [platform,    setPlatform]    = useState('all');
    const [activeTags,  setActiveTags]  = useState([]);
    const [sort,        setSort]        = useState('top');
    const [search,      setSearch]      = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showSubmit,  setShowSubmit]  = useState(false);
    const [page,        setPage]        = useState(1);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // Reset page on filter change
    useEffect(() => { setPage(1); }, [version, platform, activeTags, sort, debouncedSearch]);

    const queryParams = {
        version:  version  !== 'all' ? version  : undefined,
        platform: platform !== 'all' ? platform : undefined,
        tags:     activeTags.length  ? activeTags : undefined,
        sort, search: debouncedSearch || undefined, page,
    };

    const { data, isLoading } = useQuery({
        queryKey: ['seeds', queryParams],
        queryFn:  () => fetchSeeds(queryParams),
        staleTime: 2 * 60_000,
    });

    const { data: popularTags = [] } = useQuery({
        queryKey: ['seed-tags'],
        queryFn:  fetchSeedTags,
        staleTime: 10 * 60_000,
    });

    const { data: myVotes = {} } = useQuery({
        queryKey: ['my-seed-votes'],
        queryFn:  () => fetchMySeedVotes(token),
        enabled:  !!user && !!token,
        staleTime: 60_000,
    });

    const voteMutation = useMutation({
        mutationFn: ({ seedId, value }) => voteSeed(token, seedId, value),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['seeds'] });
            qc.invalidateQueries({ queryKey: ['my-seed-votes'] });
        },
    });

    const handleVote = useCallback((seedId, value) => {
        if (!user) { navigate('/login'); return; }
        voteMutation.mutate({ seedId, value });
    }, [user, token, voteMutation, navigate]);

    const toggleTag = (tag) => {
        setActiveTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const seeds = data?.data || [];
    const total = data?.meta?.total || 0;
    const totalPages = Math.ceil(total / 20);

    return (
        <div className="min-h-screen bg-bg-paper text-text-ink">

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <header className="relative py-6 px-4 text-center mb-4">
                <div className="absolute top-4 left-6 w-3 h-3 rounded-full bg-[#1a1a1a] border-2 border-[#555]" />
                <div className="absolute top-4 right-6 w-3 h-3 rounded-full bg-[#1a1a1a] border-2 border-[#555]" />

                <div className="inline-block relative">
                    <h1 className="font-heading text-2xl md:text-4xl text-text-heading drop-shadow-[3px_3px_0_#000] rotate-[-0.5deg]">
                        SEED <span className="text-accent-blood">ARCHIVE</span>
                    </h1>
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-text-ink" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0,5 Q25,9 50,5 T100,6" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                </div>

                <p className="mt-5 font-handwriting text-text-secondary text-lg">
                    Community-shared seeds · {total.toLocaleString()} seeds indexed
                </p>
            </header>

            {/* ── CONTROLS ───────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 space-y-3 mb-6">

                {/* Search + Submit button */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-sm" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by title or seed code..."
                            className="w-full bg-bg-paper-dark border-2 border-text-ink/40 focus:border-text-ink pl-9 pr-3 py-2.5 font-handwriting text-lg text-text-ink placeholder:text-text-dim outline-none transition-colors"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-ink">
                                <FaTimes size={12} />
                            </button>
                        )}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => user ? setShowSubmit(true) : navigate('/login')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-accent-blood text-white font-heading text-xs border-2 border-text-ink shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] transition-all whitespace-nowrap"
                    >
                        {user ? <FaPlus size={11} /> : <FaLock size={11} />}
                        <span className="hidden sm:inline">Share Seed</span>
                    </motion.button>
                </div>

                {/* Version tabs */}
                <div className="flex gap-1.5 flex-wrap">
                    {VERSIONS.map(v => (
                        <button
                            key={v.value}
                            onClick={() => setVersion(v.value)}
                            className={cn(
                                'font-heading text-[10px] px-3 py-1.5 border-2 transition-all shadow-[2px_2px_0_#000]',
                                version === v.value
                                    ? 'bg-text-ink text-bg-paper border-text-ink'
                                    : 'bg-bg-paper border-text-ink/40 hover:border-text-ink text-text-secondary hover:text-text-ink'
                            )}
                        >
                            {v.short}
                        </button>
                    ))}
                    <span className="w-px self-stretch bg-text-ink/20 mx-1" />
                    {PLATFORMS.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setPlatform(p.value)}
                            className={cn(
                                'font-heading text-[10px] px-3 py-1.5 border-2 transition-all shadow-[2px_2px_0_#000]',
                                platform === p.value
                                    ? 'bg-text-ink text-bg-paper border-text-ink'
                                    : 'bg-bg-paper border-text-ink/40 hover:border-text-ink text-text-secondary hover:text-text-ink'
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                    <span className="w-px self-stretch bg-text-ink/20 mx-1" />
                    {SORTS.map(s => (
                        <button
                            key={s.value}
                            onClick={() => setSort(s.value)}
                            className={cn(
                                'flex items-center gap-1 font-heading text-[10px] px-3 py-1.5 border-2 transition-all shadow-[2px_2px_0_#000]',
                                sort === s.value
                                    ? 'bg-accent-blood text-white border-accent-blood'
                                    : 'bg-bg-paper border-text-ink/40 hover:border-text-ink text-text-secondary'
                            )}
                        >
                            <s.icon size={9} /> {s.label}
                        </button>
                    ))}
                </div>

                {/* Tag cloud */}
                {popularTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="font-heading text-[9px] text-text-dim uppercase tracking-widest mr-1">Tags:</span>
                        {popularTags.slice(0, 16).map(({ tag }) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={cn(
                                    'font-pixel text-[10px] px-2 py-0.5 border transition-all',
                                    activeTags.includes(tag)
                                        ? 'bg-accent-blood text-white border-accent-blood'
                                        : 'bg-transparent border-text-ink/25 text-text-dim hover:border-accent-blood/50 hover:text-accent-blood'
                                )}
                            >
                                {activeTags.includes(tag) ? '× ' : ''}{tag}
                            </button>
                        ))}
                        {activeTags.length > 0 && (
                            <button
                                onClick={() => setActiveTags([])}
                                className="font-handwriting text-xs text-accent-blood hover:underline ml-1"
                            >
                                Clear tags
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── SEED GRID ──────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 mb-10">
                {isLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="border-[3px] border-text-ink/20 shadow-[5px_5px_0_#000] overflow-hidden animate-pulse">
                                <div className="h-14 bg-black/80" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-text-ink/10 rounded w-1/3" />
                                    <div className="h-3 bg-text-ink/10 rounded w-3/4" />
                                    <div className="flex gap-1">
                                        <div className="h-4 w-16 bg-text-ink/10 rounded" />
                                        <div className="h-4 w-12 bg-text-ink/10 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : seeds.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 border-2 border-dashed border-text-ink/20"
                    >
                        <FaSkull className="mx-auto text-5xl text-text-dim opacity-20 mb-4" />
                        <p className="font-heading text-xs text-text-dim mb-2">NO SEEDS FOUND</p>
                        <p className="font-handwriting text-text-secondary text-lg">
                            {activeTags.length || search ? 'Try different filters' : 'Be the first to share a seed!'}
                        </p>
                        {user && (
                            <button
                                onClick={() => setShowSubmit(true)}
                                className="mt-4 font-heading text-xs px-4 py-2 bg-accent-blood text-white border-2 border-text-ink shadow-[3px_3px_0_#000]"
                            >
                                + SHARE FIRST SEED
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {seeds.map((seed, i) => (
                            <SeedCard
                                key={seed.id}
                                seed={seed}
                                myVote={myVotes[seed.id]}
                                onVote={handleVote}
                                isAuthenticated={!!user}
                                delay={Math.min(i * 0.04, 0.3)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="font-heading text-xs px-4 py-2 border-2 border-text-ink/40 hover:border-text-ink disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0_#000] transition-all"
                        >
                            ← Prev
                        </button>
                        <span className="font-pixel text-sm text-text-secondary">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="font-heading text-xs px-4 py-2 border-2 border-text-ink/40 hover:border-text-ink disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0_#000] transition-all"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>

            {/* ── SUBMIT MODAL ───────────────────────────────────────────── */}
            <AnimatePresence>
                {showSubmit && (
                    <SubmitModal
                        onClose={() => setShowSubmit(false)}
                        onSuccess={() => setShowSubmit(false)}
                        token={token}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default SeedsPage;

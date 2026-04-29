/**
 * SynergiesPage - Página completa del analizador de sinergias
 * 
 * PROPÓSITO:
 * - Profundizar engagement después del mini analyzer
 * - Mostrar sinergias detalladas con wiki links
 * - Convertir a registro si el usuario quiere guardar combos
 * 
 * SECCIONES:
 * 1. Input área (selección de items)
 * 2. Result grid (sinergias, anti-sinergias, próximos items)
 * 3. Community contribuciones (wiki links)
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaBolt, FaSearch, FaTimes, FaArrowLeft, FaHeart, FaSave, 
    FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaSpinner,
    FaArrowRight, FaPlus, FaTrash, FaExternalLinkAlt, FaShareAlt
} from 'react-icons/fa';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { analyzeSynergies as analyzeSynergiesAPI, contributeSynergy } from '../../lib/api';

// Extended synergy database - uses translation keys for effect/details
const SYNERGY_DATABASE = {
    // Tier S Synergies
    'brimstone+tammy_head': { 
        rating: 'S', 
        score: 10, 
        effectKey: 'brimstone_tammy_head',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Brimstone#Synergies'
    },
    'ipecac+my_reflection': { 
        rating: 'S', 
        score: 10, 
        effectKey: 'ipecac_my_reflection',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Ipecac#Synergies'
    },
    'tech_x+brimstone': { 
        rating: 'S', 
        score: 9, 
        effectKey: 'tech_x_brimstone',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Tech_X#Synergies'
    },
    'sacred_heart+godhead': { 
        rating: 'S', 
        score: 10, 
        effectKey: 'sacred_heart_godhead',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Sacred_Heart#Synergies'
    },
    // Tier A
    'crickets_head+polyphemus': { 
        rating: 'A', 
        score: 8, 
        effectKey: 'crickets_head_polyphemus',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Polyphemus#Synergies'
    },
    'technology+spoon_bender': { 
        rating: 'A', 
        score: 7, 
        effectKey: 'technology_spoon_bender',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Technology#Synergies'
    },
    'mom_knife+dead_eye': { 
        rating: 'A', 
        score: 8, 
        effectKey: 'mom_knife_dead_eye',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Mom%27s_Knife#Synergies'
    },
    // Tier B
    'tiny_planet+rubber_cement': { 
        rating: 'B', 
        score: 6, 
        effectKey: 'tiny_planet_rubber_cement',
        wikiLink: null
    },
    'the_ludovico_technique+strange_attractor': { 
        rating: 'B', 
        score: 5, 
        effectKey: 'the_ludovico_technique_strange_attractor',
        wikiLink: null
    },
    // Anti-synergies
    'dr_fetus+ipecac': { 
        rating: 'D', 
        score: 2, 
        effectKey: 'dr_fetus_ipecac',
        isAntiSynergy: true,
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Dr._Fetus#Interactions'
    },
    'soy_milk+polyphemus': { 
        rating: 'C', 
        score: 4, 
        effectKey: 'soy_milk_polyphemus',
        isAntiSynergy: true,
        wikiLink: null
    },
    'brimstone+chocolate_milk': {
        rating: 'C',
        score: 4,
        effectKey: 'brimstone_chocolate_milk',
        isAntiSynergy: true,
        wikiLink: null
    },
    // Brimstone synergies
    'brimstone+monstros_lung': { rating: 'S', score: 10, effectKey: 'brimstone_monstros_lung', wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Brimstone#Synergies' },
    'brimstone+the_ludovico_technique': { rating: 'S', score: 10, effectKey: 'brimstone_ludovico_technique', wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Brimstone#Synergies' },
    'brimstone+inner_eye': { rating: 'S', score: 10, effectKey: 'brimstone_inner_eye', wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Brimstone#Synergies' },
    'brimstone+mutant_spider': { rating: 'S', score: 10, effectKey: 'brimstone_mutant_spider', wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Brimstone#Synergies' },
    'brimstone+jacobs_ladder': { rating: 'A', score: 7, effectKey: 'brimstone_jacobs_ladder', wikiLink: null },
    'brimstone+continuum': { rating: 'A', score: 7, effectKey: 'brimstone_continuum', wikiLink: null },
    'brimstone+flat_stone': { rating: 'A', score: 7, effectKey: 'brimstone_flat_stone', wikiLink: null },
    'brimstone+haemolacria': { rating: 'A', score: 7, effectKey: 'brimstone_haemolacria', wikiLink: null },
    'brimstone+godhead': { rating: 'A', score: 7, effectKey: 'brimstone_godhead', wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Brimstone#Synergies' },
    'brimstone+deaths_touch': { rating: 'A', score: 7, effectKey: 'brimstone_deaths_touch', wikiLink: null },
    'brimstone+eye_of_the_occult': { rating: 'S', score: 9, effectKey: 'brimstone_eye_of_the_occult', wikiLink: null },
    // Ipecac synergies
    'ipecac+the_ludovico_technique': { rating: 'S', score: 10, effectKey: 'ipecac_ludovico_technique', wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Ipecac#Synergies' },
    // Mom's Knife synergies
    'mom_knife+mutant_spider': { rating: 'S', score: 10, effectKey: 'mom_knife_mutant_spider', wikiLink: "https://bindingofisaacrebirth.fandom.com/wiki/Mom%27s_Knife#Synergies" },
    'mom_knife+the_ludovico_technique': { rating: 'S', score: 10, effectKey: 'mom_knife_ludovico_technique', wikiLink: "https://bindingofisaacrebirth.fandom.com/wiki/Mom%27s_Knife#Synergies" },
    'epic_fetus+mom_knife': { rating: 'A', score: 7, effectKey: 'epic_fetus_mom_knife', wikiLink: null },
    // Sacred Heart synergies
    'proptosis+sacred_heart': { rating: 'S', score: 10, effectKey: 'proptosis_sacred_heart', wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Sacred_Heart#Synergies' },
    'polyphemus+sacred_heart': { rating: 'S', score: 10, effectKey: 'polyphemus_sacred_heart', wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Sacred_Heart#Synergies' },
    'epic_fetus+sacred_heart': { rating: 'S', score: 10, effectKey: 'epic_fetus_sacred_heart', wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Sacred_Heart#Synergies' },
    // Crown of Light synergies
    'chocolate_milk+crown_of_light': { rating: 'S', score: 9, effectKey: 'chocolate_milk_crown_of_light', wikiLink: null },
    // Dr. Fetus synergies
    'dr_fetus+monstros_lung': { rating: 'A', score: 7, effectKey: 'dr_fetus_monstros_lung', wikiLink: null },
    'dr_fetus+polyphemus': { rating: 'A', score: 7, effectKey: 'dr_fetus_polyphemus', wikiLink: null },
    // Misc
    'dead_cat+judas_shadow': { rating: 'A', score: 7, effectKey: 'dead_cat_judas_shadow', wikiLink: null },
};

// All available items for selection
const ALL_ITEMS = [
    { id: 'brimstone', name: 'Brimstone', sprite: '/sprites/1_Passive Items/Brimstone.png', quality: 4 },
    { id: 'sacred_heart', name: 'Sacred Heart', sprite: '/sprites/1_Passive Items/Sacred Heart.png', quality: 4 },
    { id: 'godhead', name: 'Godhead', sprite: '/sprites/1_Passive Items/Godhead.png', quality: 4 },
    { id: 'ipecac', name: 'Ipecac', sprite: '/sprites/1_Passive Items/Ipecac.png', quality: 3 },
    { id: 'polyphemus', name: 'Polyphemus', sprite: '/sprites/1_Passive Items/Polyphemus.png', quality: 4 },
    { id: 'tech_x', name: 'Tech X', sprite: '/sprites/1_Passive Items/Tech X.png', quality: 4 },
    { id: 'mom_knife', name: "Mom's Knife", sprite: "/sprites/1_Passive Items/Mom's Knife.png", quality: 4 },
    { id: 'tammy_head', name: "Tammy's Head", sprite: '/sprites/2_Active Items/Tammys Head.png', quality: 3 },
    { id: 'crickets_head', name: "Cricket's Head", sprite: "/sprites/1_Passive Items/Cricket's Head.png", quality: 4 },
    { id: 'technology', name: 'Technology', sprite: '/sprites/1_Passive Items/Technology.png', quality: 3 },
    { id: 'spoon_bender', name: 'Spoon Bender', sprite: '/sprites/1_Passive Items/Spoon Bender.png', quality: 3 },
    { id: 'dead_eye', name: 'Dead Eye', sprite: '/sprites/1_Passive Items/Dead Eye.png', quality: 3 },
    { id: 'tiny_planet', name: 'Tiny Planet', sprite: '/sprites/1_Passive Items/Tiny Planet.png', quality: 2 },
    { id: 'rubber_cement', name: 'Rubber Cement', sprite: '/sprites/1_Passive Items/Rubber Cement.png', quality: 2 },
    { id: 'the_ludovico_technique', name: 'The Ludovico Technique', sprite: '/sprites/1_Passive Items/The Ludovico Technique.png', quality: 3 },
    { id: 'strange_attractor', name: 'Strange Attractor', sprite: '/sprites/1_Passive Items/Strange Attractor.png', quality: 2 },
    { id: 'dr_fetus', name: 'Dr. Fetus', sprite: '/sprites/1_Passive Items/Dr. Fetus.png', quality: 4 },
    { id: 'soy_milk', name: 'Soy Milk', sprite: '/sprites/1_Passive Items/Soy Milk.png', quality: 2 },
    { id: 'chocolate_milk', name: 'Chocolate Milk', sprite: '/sprites/1_Passive Items/Chocolate Milk.png', quality: 3 },
    { id: 'my_reflection', name: 'My Reflection', sprite: '/sprites/1_Passive Items/My Reflection.png', quality: 1 },
    { id: 'monstros_lung', name: "Monstro's Lung", sprite: "/sprites/1_Passive Items/Monstro's Lung.png", quality: 3 },
    { id: 'inner_eye', name: 'The Inner Eye', sprite: '/sprites/1_Passive Items/The Inner Eye.png', quality: 3 },
    { id: 'mutant_spider', name: 'Mutant Spider', sprite: '/sprites/1_Passive Items/Mutant Spider.png', quality: 3 },
    { id: 'jacobs_ladder', name: "Jacob's Ladder", sprite: "/sprites/1_Passive Items/Jacob's Ladder.png", quality: 3 },
    { id: 'continuum', name: 'Continuum', sprite: '/sprites/1_Passive Items/Continuum.png', quality: 3 },
    { id: 'flat_stone', name: 'Flat Stone', sprite: '/sprites/1_Passive Items/Flat Stone.png', quality: 3 },
    { id: 'haemolacria', name: 'Haemolacria', sprite: '/sprites/1_Passive Items/Haemolacria.png', quality: 3 },
    { id: 'deaths_touch', name: "Death's Touch", sprite: "/sprites/1_Passive Items/Death's Touch.png", quality: 3 },
    { id: 'epic_fetus', name: 'Epic Fetus', sprite: '/sprites/1_Passive Items/Epic Fetus.png', quality: 4 },
    { id: 'proptosis', name: 'Proptosis', sprite: '/sprites/1_Passive Items/Proptosis.png', quality: 4 },
    { id: 'crown_of_light', name: 'Crown of Light', sprite: '/sprites/1_Passive Items/Crown of Light.png', quality: 4 },
    { id: 'eye_of_the_occult', name: 'Eye of the Occult', sprite: '/sprites/1_Passive Items/Eye of the Occult.png', quality: 3 },
    { id: 'dead_cat', name: 'Dead Cat', sprite: '/sprites/1_Passive Items/Dead Cat.png', quality: 3 },
    { id: 'judas_shadow', name: "Judas' Shadow", sprite: "/sprites/1_Passive Items/Judas' Shadow.png", quality: 4 },
];

// Suggested combinations to try
const SUGGESTED_COMBOS = [
    { items: ['brimstone', 'tammy_head'], tag: 'CLASICO' },
    { items: ['sacred_heart', 'godhead'], tag: 'GOD TIER' },
    { items: ['dr_fetus', 'ipecac'], tag: 'PELIGRO' },
    { items: ['brimstone', 'monstros_lung'], tag: 'MEGA LASER' },
    { items: ['sacred_heart', 'proptosis'], tag: 'MAX DPS' },
    { items: ['mom_knife', 'mutant_spider'], tag: 'MULTI-KNIFE' },
];

export function SynergiesPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [shareTooltip, setShareTooltip] = useState(false);
    const [saveTooltip, setSaveTooltip] = useState(null); // null | 'saved' | 'already'
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [contributeForm, setContributeForm] = useState({ itemA: '', itemB: '', description: '' });
    const [contributeStatus, setContributeStatus] = useState(null); // null | 'loading' | 'success' | 'error'

    // Initialize with preloaded items from mini analyzer
    useEffect(() => {
        if (location.state?.preloadedItems) {
            setSelectedItems(location.state.preloadedItems);
            // Auto-analyze if items were preloaded
            const items = location.state.preloadedItems;
            if (items.length >= 2) {
                setTimeout(() => analyzeSynergies(items), 500);
            }
        }
    }, [location.state]);

    // Filter items by search
    const filteredItems = ALL_ITEMS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedItems.find(s => s.id === item.id)
    );

    // Add item
    const addItem = (item) => {
        if (selectedItems.length >= 6) return;
        if (selectedItems.find(i => i.id === item.id)) return;
        
        setSelectedItems([...selectedItems, item]);
        setSearchQuery('');
        
        window.gtag?.('event', 'synergy_full_item_add', { item_id: item.id });
    };

    // Remove item
    const removeItem = (itemId) => {
        setSelectedItems(selectedItems.filter(i => i.id !== itemId));
        setResults(null);
    };

    // Clear all
    const clearAll = () => {
        setSelectedItems([]);
        setResults(null);
        setSearchQuery('');
    };

    // Load suggested combo
    const loadSuggestedCombo = (combo) => {
        const items = combo.items.map(id => ALL_ITEMS.find(item => item.id === id)).filter(Boolean);
        setSelectedItems(items);
        setTimeout(() => analyzeSynergies(items), 300);
        
        window.gtag?.('event', 'synergy_suggested_combo', { combo: combo.items.join('+') });
    };

    // Analyze synergies
    const analyzeSynergies = async (itemsToAnalyze = selectedItems) => {
        if (itemsToAnalyze.length < 2) return;
        
        setLoading(true);
        
        window.gtag?.('event', 'synergy_full_analyze', { 
            items: itemsToAnalyze.map(i => i.id).join('+'),
            item_count: itemsToAnalyze.length
        });

        // Client-side pairwise documented synergy lookup
        const synergies = [];
        const antiSynergies = [];

        for (let i = 0; i < itemsToAnalyze.length; i++) {
            for (let j = i + 1; j < itemsToAnalyze.length; j++) {
                const key = [itemsToAnalyze[i].id, itemsToAnalyze[j].id].sort().join('+');
                const reverseKey = [itemsToAnalyze[i].id, itemsToAnalyze[j].id].sort().reverse().join('+');

                const synergy = SYNERGY_DATABASE[key] || SYNERGY_DATABASE[reverseKey];

                if (synergy) {
                    const entry = {
                        ...synergy,
                        items: [itemsToAnalyze[i], itemsToAnalyze[j]]
                    };

                    if (synergy.isAntiSynergy) {
                        antiSynergies.push(entry);
                    } else {
                        synergies.push(entry);
                    }
                }
            }
        }

        synergies.sort((a, b) => b.score - a.score);
        antiSynergies.sort((a, b) => a.score - b.score);

        // API call for computed stats (DPS, transformations) — graceful fallback
        let apiStats = null;
        try {
            const res = await analyzeSynergiesAPI(itemsToAnalyze.map(i => i.name));
            if (res?.ok) apiStats = res.build.state;
        } catch {
            // backend unavailable or items not in engine — client-only mode
        }

        // Calculate overall score from documented synergies
        let overallScore = 5;
        synergies.forEach(s => overallScore += (s.score - 5) * 0.5);
        antiSynergies.forEach(s => overallScore -= (5 - s.score) * 0.5);

        // Blend with API DPS signal when no documented synergies found
        if (apiStats && synergies.length === 0 && antiSynergies.length === 0) {
            const dpsSignal = apiStats.dps > 1000 ? 9 : apiStats.dps > 600 ? 7 : apiStats.dps > 300 ? 5 : 3;
            overallScore = (overallScore + dpsSignal) / 2;
        }

        overallScore = Math.max(1, Math.min(10, overallScore));

        const overallRating =
            overallScore >= 9 ? 'S' :
            overallScore >= 7 ? 'A' :
            overallScore >= 5 ? 'B' :
            overallScore >= 3 ? 'C' : 'D';

        setResults({
            synergies,
            antiSynergies,
            overallRating,
            overallScore: Math.round(overallScore * 10) / 10,
            itemCount: itemsToAnalyze.length,
            apiStats,
        });

        setLoading(false);
    };

    // Share combo
    const shareCombo = async () => {
        const itemIds = selectedItems.map(i => i.id).join(',');
        const url = `${window.location.origin}/synergies?items=${itemIds}`;
        
        try {
            await navigator.clipboard.writeText(url);
            setShareTooltip(true);
            setTimeout(() => setShareTooltip(false), 2000);
            
            window.gtag?.('event', 'synergy_share', { items: itemIds });
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    };

    // Save combo (requires login)
    const saveCombo = () => {
        if (!user) {
            window.gtag?.('event', 'synergy_to_signup', { 
                items: selectedItems.map(i => i.id).join('+'),
                source: 'save_combo'
            });
            navigate('/register', { 
                state: { returnTo: '/synergies', message: t('synergies.createAccountToSave') } 
            });
            return;
        }
        
        const storageKey = 'saved_synergies';
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const comboKey = selectedItems.map(i => i.id).sort().join('+');

        if (saved.some(s => s.key === comboKey)) {
            setSaveTooltip('already');
            setTimeout(() => setSaveTooltip(null), 2000);
            return;
        }

        saved.unshift({
            key: comboKey,
            items: selectedItems.map(i => ({ id: i.id, name: i.name, sprite: i.sprite })),
            rating: results?.overallRating || '?',
            savedAt: new Date().toISOString(),
        });
        localStorage.setItem(storageKey, JSON.stringify(saved.slice(0, 20)));

        setSaveTooltip('saved');
        setTimeout(() => setSaveTooltip(null), 2000);

        window.gtag?.('event', 'synergy_saved', { items: comboKey });
    };

    // Submit community contribution
    const submitContribution = async () => {
        if (!contributeForm.itemA || !contributeForm.itemB || !contributeForm.description) return;
        setContributeStatus('loading');
        try {
            await contributeSynergy(contributeForm);
            setContributeStatus('success');
            setTimeout(() => {
                setShowContributeModal(false);
                setContributeStatus(null);
                setContributeForm({ itemA: '', itemB: '', description: '' });
            }, 2000);
        } catch {
            setContributeStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-bg-page py-8 px-4">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-text-dim hover:text-accent-blood transition-colors mb-4"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        <span className="font-heading text-sm">{t('synergies.backToHome')}</span>
                    </Link>
                    
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="font-heading text-3xl md:text-4xl text-text-heading flex items-center gap-3">
                                <FaBolt className="text-accent-gold" />
                                {t('synergies.title')}
                            </h1>
                            <p className="font-handwriting text-text-dim mt-2">
                                {t('synergies.subtitle')}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-text-dim">
                            <span>{t('synergies.documentedSynergies', { count: 627 })}</span>
                            <span>·</span>
                            <span>{t('synergies.updatedTo')}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Item Selection Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000] sticky top-4">
                            
                            {/* Search */}
                            <div className="p-4 border-b-2 border-black/10">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('synergies.searchItem')}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-black/20 bg-white font-sans text-sm focus:outline-none focus:border-accent-gold"
                                    />
                                </div>
                                
                                {searchQuery && (
                                    <div className="mt-2 max-h-48 overflow-auto">
                                        {filteredItems.length > 0 ? (
                                            filteredItems.slice(0, 8).map(item => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => addItem(item)}
                                                    className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-accent-gold/10 transition-colors"
                                                >
                                                    <img 
                                                        src={item.sprite}
                                                        alt={item.name}
                                                        className="w-6 h-6 pixelated"
                                                    />
                                                    <span className="font-heading text-sm">{item.name}</span>
                                                    <span className="ml-auto text-xs text-text-dim">Q{item.quality}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <p className="px-3 py-2 text-sm text-text-dim">{t('synergies.notFound')}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Selected Items */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-heading text-sm text-text-dim uppercase">
                                        {t('synergies.items')} ({selectedItems.length}/6)
                                    </span>
                                    {selectedItems.length > 0 && (
                                        <button
                                            onClick={clearAll}
                                            className="text-xs text-text-dim hover:text-accent-blood flex items-center gap-1"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                            {t('synergies.clear')}
                                        </button>
                                    )}
                                </div>
                                
                                <div className="space-y-2 min-h-[100px]">
                                    <AnimatePresence>
                                        {selectedItems.map(item => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                className="flex items-center gap-2 p-2 bg-black/5 border border-black/20"
                                            >
                                                <img 
                                                    src={item.sprite}
                                                    alt={item.name}
                                                    className="w-8 h-8 pixelated"
                                                    onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                                                />
                                                <span className="font-heading text-sm flex-1">{item.name}</span>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1 hover:text-accent-blood transition-colors"
                                                >
                                                    <FaTimes className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    
                                    {selectedItems.length === 0 && (
                                        <p className="text-center text-text-dim font-handwriting py-4">
                                            {t('synergies.searchAndAddItems')}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Analyze Button */}
                                <button
                                    onClick={() => analyzeSynergies()}
                                    disabled={selectedItems.length < 2 || loading}
                                    className={cn(
                                        "w-full mt-4 py-3 font-heading text-sm flex items-center justify-center gap-2 transition-colors",
                                        selectedItems.length >= 2 
                                            ? "bg-accent-gold text-black hover:bg-accent-gold/90"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="w-4 h-4 animate-spin" />
                                            {t('synergies.analyzing')}
                                        </>
                                    ) : (
                                        <>
                                            <FaBolt className="w-4 h-4" />
                                            {t('synergies.analyze')} ({selectedItems.length} items)
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {/* Suggested Combos */}
                            <div className="p-4 border-t-2 border-black/10 bg-black/5">
                                <p className="font-heading text-xs text-text-dim uppercase mb-3">{t('synergies.tryThese')}</p>
                                <div className="space-y-2">
                                    {SUGGESTED_COMBOS.map((combo, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => loadSuggestedCombo(combo)}
                                            className="w-full flex items-center gap-2 p-2 text-left hover:bg-white transition-colors"
                                        >
                                            <div className="flex -space-x-2">
                                                {combo.items.map(id => {
                                                    const item = ALL_ITEMS.find(i => i.id === id);
                                                    return item ? (
                                                        <img 
                                                            key={id}
                                                            src={item.sprite}
                                                            alt={item.name}
                                                            className="w-6 h-6 pixelated border border-white"
                                                        />
                                                    ) : null;
                                                })}
                                            </div>
                                            <span className="text-xs font-heading flex-1">
                                                {combo.items.map(id => ALL_ITEMS.find(i => i.id === id)?.name).filter(Boolean).join(' + ')}
                                            </span>
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 font-bold",
                                                combo.tag === 'PELIGRO' ? "bg-accent-blood text-white" : "bg-accent-gold text-black"
                                            )}>
                                                {combo.tag}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <AnimatePresence mode="wait">
                            {/* Empty State */}
                            {!results && !loading && (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000] p-8 text-center"
                                >
                                    <FaBolt className="w-16 h-16 text-text-dim/20 mx-auto mb-4" />
                                    <h2 className="font-heading text-xl mb-2">{t('synergies.selectItemsToAnalyze')}</h2>
                                    <p className="font-handwriting text-text-dim max-w-md mx-auto">
                                        {t('synergies.addItemsFromPanel')}
                                    </p>
                                </motion.div>
                            )}
                            
                            {/* Loading */}
                            {loading && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000] p-12 text-center"
                                >
                                    <FaSpinner className="w-12 h-12 text-accent-gold animate-spin mx-auto mb-4" />
                                    <p className="font-heading">{t('synergies.analyzingItems', { count: selectedItems.length })}</p>
                                    <p className="font-handwriting text-text-dim text-sm mt-2">
                                        {t('synergies.calculatingCombinations', { count: selectedItems.length * (selectedItems.length - 1) / 2 })}
                                    </p>
                                </motion.div>
                            )}
                            
                            {/* Results */}
                            {results && !loading && (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Overall Rating */}
                                    <div className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000] p-6">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <span className={cn(
                                                    "w-16 h-16 flex items-center justify-center font-heading text-3xl border-2",
                                                    results.overallRating === 'S' && "bg-accent-gold text-black border-accent-gold",
                                                    results.overallRating === 'A' && "bg-green-500 text-white border-green-600",
                                                    results.overallRating === 'B' && "bg-blue-500 text-white border-blue-600",
                                                    results.overallRating === 'C' && "bg-orange-400 text-black border-orange-500",
                                                    results.overallRating === 'D' && "bg-accent-blood text-white border-red-700"
                                                )}>
                                                    {results.overallRating}
                                                </span>
                                                <div>
                                                    <h2 className="font-heading text-2xl">
                                                        {results.overallRating === 'S' && t('synergies.legendaryBuild')}
                                                        {results.overallRating === 'A' && t('synergies.excellentBuild')}
                                                        {results.overallRating === 'B' && t('synergies.decentBuild')}
                                                        {results.overallRating === 'C' && t('synergies.weakBuild')}
                                                        {results.overallRating === 'D' && t('synergies.problematicBuild')}
                                                    </h2>
                                                    <p className="text-text-dim">
                                                        {t('synergies.score')}: {results.overallScore}/10 · {results.synergies.length} {t('synergies.synergiesFound')} · {results.antiSynergies.length} {t('synergies.conflicts')}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <button
                                                        onClick={shareCombo}
                                                        className="p-2 border border-black/20 hover:bg-black/5 transition-colors"
                                                        title={t('synergies.shareCombo')}
                                                    >
                                                        <FaShareAlt className="w-4 h-4" />
                                                    </button>
                                                    {shareTooltip && (
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs whitespace-nowrap">
                                                            {t('synergies.copied')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <button
                                                        onClick={saveCombo}
                                                        className="flex items-center gap-2 px-4 py-2 bg-black text-white font-heading text-sm hover:bg-gray-800 transition-colors"
                                                    >
                                                        <FaSave className="w-4 h-4" />
                                                        {user ? t('synergies.save') : t('synergies.saveRegister')}
                                                    </button>
                                                    {saveTooltip && (
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs whitespace-nowrap">
                                                            {saveTooltip === 'saved' ? t('synergies.comboSaved') : t('synergies.alreadySaved')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* API Build Stats */}
                                    {results.apiStats && (
                                        <div className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000] p-4">
                                            <h3 className="font-heading text-sm uppercase text-text-dim mb-3">{t('synergies.buildStats')}</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="text-center p-2 bg-black/5">
                                                    <div className="font-heading text-xl text-accent-gold">{results.apiStats.dps}</div>
                                                    <div className="text-xs text-text-dim uppercase">{t('synergies.estimatedDps')}</div>
                                                </div>
                                                <div className="text-center p-2 bg-black/5">
                                                    <div className="font-heading text-lg capitalize">{results.apiStats.tearType}</div>
                                                    <div className="text-xs text-text-dim uppercase">{t('synergies.tearType')}</div>
                                                </div>
                                                <div className="text-center p-2 bg-black/5">
                                                    <div className="font-heading text-xl">{Number(results.apiStats.damage).toFixed(1)}</div>
                                                    <div className="text-xs text-text-dim uppercase">Damage</div>
                                                </div>
                                                <div className="text-center p-2 bg-black/5">
                                                    <div className="font-heading text-xl">{Number(results.apiStats.tearsPerSecond).toFixed(1)}</div>
                                                    <div className="text-xs text-text-dim uppercase">Tears/s</div>
                                                </div>
                                            </div>
                                            {results.apiStats.transformations?.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className="text-xs text-text-dim uppercase font-heading">{t('synergies.transformations')}:</span>
                                                    {results.apiStats.transformations.map(t => (
                                                        <span key={t} className="text-xs px-2 py-0.5 bg-accent-gold/20 text-accent-gold font-heading border border-accent-gold/30">{t}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Synergies */}
                                    {results.synergies.length > 0 && (
                                        <div className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000]">
                                            <div className="p-4 border-b-2 border-black/10 bg-green-50">
                                                <h3 className="font-heading text-lg flex items-center gap-2">
                                                    <FaCheckCircle className="text-green-500" />
                                                    {t('synergies.synergiesFoundTitle')} ({results.synergies.length})
                                                </h3>
                                            </div>
                                            <div className="divide-y-2 divide-black/10">
                                                {results.synergies.map((syn, idx) => (
                                                    <SynergyCard key={idx} synergy={syn} t={t} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Anti-synergies */}
                                    {results.antiSynergies.length > 0 && (
                                        <div className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000]">
                                            <div className="p-4 border-b-2 border-black/10 bg-red-50">
                                                <h3 className="font-heading text-lg flex items-center gap-2">
                                                    <FaExclamationTriangle className="text-accent-blood" />
                                                    {t('synergies.conflictsDetected')} ({results.antiSynergies.length})
                                                </h3>
                                            </div>
                                            <div className="divide-y-2 divide-black/10">
                                                {results.antiSynergies.map((syn, idx) => (
                                                    <SynergyCard key={idx} synergy={syn} isAnti t={t} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* No synergies found */}
                                    {results.synergies.length === 0 && results.antiSynergies.length === 0 && (
                                        <div className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000] p-6 text-center">
                                            <p className="font-heading text-lg mb-2">{t('synergies.noKnownSynergies')}</p>
                                            <p className="font-handwriting text-text-dim">
                                                {t('synergies.noInteractionsFound')}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Contribute CTA */}
                                    <div className="text-center py-4">
                                        <p className="text-sm text-text-dim mb-2">
                                            {t('synergies.knownSynergyMissing')}
                                        </p>
                                        <button
                                            className="text-sm font-heading text-accent-blood hover:underline"
                                            onClick={() => {
                                                window.gtag?.('event', 'synergy_contribute_click');
                                                setContributeForm({
                                                    itemA: results?.synergies[0]?.items[0]?.name || '',
                                                    itemB: results?.synergies[0]?.items[1]?.name || '',
                                                    description: '',
                                                });
                                                setShowContributeModal(true);
                                            }}
                                        >
                                            {t('synergies.contributed')} →
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Contribution Modal */}
            <AnimatePresence>
                {showContributeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setShowContributeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-bg-paper border-2 border-black shadow-[8px_8px_0px_#000] w-full max-w-md p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading text-xl flex items-center gap-2">
                                    <FaPlus className="text-accent-blood" />
                                    {t('synergies.contributeTitle')}
                                </h2>
                                <button onClick={() => setShowContributeModal(false)} className="p-1 hover:text-accent-blood">
                                    <FaTimes />
                                </button>
                            </div>

                            {contributeStatus === 'success' ? (
                                <div className="text-center py-6">
                                    <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <p className="font-heading">{t('synergies.contributeSuccess')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-heading text-xs uppercase text-text-dim mb-1">{t('synergies.contributeItemA')}</label>
                                        <input
                                            type="text"
                                            value={contributeForm.itemA}
                                            onChange={e => setContributeForm(f => ({ ...f, itemA: e.target.value }))}
                                            className="w-full px-3 py-2 border-2 border-black/20 bg-white font-sans text-sm focus:outline-none focus:border-accent-gold"
                                            placeholder="e.g. Brimstone"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-heading text-xs uppercase text-text-dim mb-1">{t('synergies.contributeItemB')}</label>
                                        <input
                                            type="text"
                                            value={contributeForm.itemB}
                                            onChange={e => setContributeForm(f => ({ ...f, itemB: e.target.value }))}
                                            className="w-full px-3 py-2 border-2 border-black/20 bg-white font-sans text-sm focus:outline-none focus:border-accent-gold"
                                            placeholder="e.g. Tammy's Head"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-heading text-xs uppercase text-text-dim mb-1">{t('synergies.contributeEffect')}</label>
                                        <textarea
                                            value={contributeForm.description}
                                            onChange={e => setContributeForm(f => ({ ...f, description: e.target.value }))}
                                            rows={3}
                                            className="w-full px-3 py-2 border-2 border-black/20 bg-white font-sans text-sm focus:outline-none focus:border-accent-gold resize-none"
                                            placeholder="Describe what happens when these items are combined..."
                                        />
                                    </div>
                                    {contributeStatus === 'error' && (
                                        <p className="text-accent-blood text-sm font-heading">{t('synergies.contributeError')}</p>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => setShowContributeModal(false)}
                                            className="flex-1 py-2 border-2 border-black/20 font-heading text-sm hover:bg-black/5 transition-colors"
                                        >
                                            {t('synergies.contributeCancel')}
                                        </button>
                                        <button
                                            onClick={submitContribution}
                                            disabled={contributeStatus === 'loading' || !contributeForm.itemA || !contributeForm.itemB || !contributeForm.description}
                                            className="flex-1 py-2 bg-accent-blood text-white font-heading text-sm hover:bg-accent-blood/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                        >
                                            {contributeStatus === 'loading' ? (
                                                <FaSpinner className="w-4 h-4 animate-spin" />
                                            ) : t('synergies.contributeSubmit')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Synergy Card Component
function SynergyCard({ synergy, isAnti = false, t }) {
    const effect = synergy.effectKey ? t(`synergies.data.${synergy.effectKey}.effect`) : synergy.effect;
    const details = synergy.effectKey ? t(`synergies.data.${synergy.effectKey}.details`) : synergy.details;
    
    return (
        <div className="p-4 hover:bg-black/5 transition-colors">
            <div className="flex items-start gap-4">
                {/* Item icons */}
                <div className="flex items-center gap-1">
                    {synergy.items.map((item, idx) => (
                        <div key={item.id} className="flex items-center">
                            <img 
                                src={item.sprite}
                                alt={item.name}
                                className="w-10 h-10 pixelated"
                            />
                            {idx < synergy.items.length - 1 && (
                                <span className="text-lg text-text-dim mx-1">+</span>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Details */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                            "w-8 h-8 flex items-center justify-center font-heading text-sm border",
                            synergy.rating === 'S' && "bg-accent-gold text-black border-accent-gold",
                            synergy.rating === 'A' && "bg-green-500 text-white border-green-600",
                            synergy.rating === 'B' && "bg-blue-500 text-white border-blue-600",
                            synergy.rating === 'C' && "bg-orange-400 text-black border-orange-500",
                            synergy.rating === 'D' && "bg-accent-blood text-white border-red-700"
                        )}>
                            {synergy.rating}
                        </span>
                        <span className="font-heading text-sm">
                            {synergy.items.map(i => i.name).join(' + ')}
                        </span>
                    </div>
                    
                    <p className={cn(
                        "font-handwriting text-sm",
                        isAnti ? "text-accent-blood" : "text-text-body"
                    )}>
                        {effect}
                    </p>
                    
                    {details && (
                        <p className="text-xs text-text-dim mt-1">
                            {details}
                        </p>
                    )}
                </div>
                
                {/* Wiki Link */}
                {synergy.wikiLink && (
                    <a
                        href={synergy.wikiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-text-dim hover:text-accent-blood transition-colors"
                        title={t('synergies.viewInWiki')}
                    >
                        <FaExternalLinkAlt className="w-4 h-4" />
                    </a>
                )}
            </div>
        </div>
    );
}

export default SynergiesPage;

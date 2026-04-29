// ItemAnalyzerBar.jsx - Quick synergy analyzer tool
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaFlask, FaExclamationTriangle, FaBolt, FaStar, FaBookmark } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

// Mock synergy data - uses effectKey for translation lookup
const SYNERGY_DATABASE = {
    'brimstone+polyphemus': {
        tier: 'S',
        effectKey: 'brimstone_polyphemus',
    },
    'brimstone+spoon bender': {
        tier: 'A',
        effectKey: 'brimstone_spoon_bender',
    },
    'brimstone+tammy\'s head': {
        tier: 'S+',
        effectKey: 'brimstone_tammy_head',
    },
    'sacred heart+polyphemus': {
        tier: 'S',
        effectKey: 'sacred_heart_polyphemus',
    },
    'mom\'s knife+brimstone': {
        tier: 'C',
        effectKey: 'mom_knife_brimstone',
        isWarning: true,
    },
    'ipecac+dr. fetus': {
        tier: 'F',
        effectKey: 'dr_fetus_ipecac',
        isWarning: true,
    },
    // Brimstone synergies
    "brimstone+monstro's lung": { tier: 'S', effectKey: 'brimstone_monstros_lung' },
    'brimstone+the ludovico technique': { tier: 'S', effectKey: 'brimstone_ludovico_technique' },
    'brimstone+the inner eye': { tier: 'S', effectKey: 'brimstone_inner_eye' },
    'brimstone+mutant spider': { tier: 'S', effectKey: 'brimstone_mutant_spider' },
    "brimstone+jacob's ladder": { tier: 'A', effectKey: 'brimstone_jacobs_ladder' },
    'brimstone+continuum': { tier: 'A', effectKey: 'brimstone_continuum' },
    'brimstone+flat stone': { tier: 'A', effectKey: 'brimstone_flat_stone' },
    'brimstone+haemolacria': { tier: 'A', effectKey: 'brimstone_haemolacria' },
    'brimstone+godhead': { tier: 'A', effectKey: 'brimstone_godhead' },
    "brimstone+death's touch": { tier: 'A', effectKey: 'brimstone_deaths_touch' },
    'brimstone+eye of the occult': { tier: 'S', effectKey: 'brimstone_eye_of_the_occult' },
    // Ipecac synergies
    'ipecac+the ludovico technique': { tier: 'S', effectKey: 'ipecac_ludovico_technique' },
    // Mom's Knife synergies
    "mom's knife+mutant spider": { tier: 'S', effectKey: 'mom_knife_mutant_spider' },
    "mom's knife+the ludovico technique": { tier: 'S', effectKey: 'mom_knife_ludovico_technique' },
    "epic fetus+mom's knife": { tier: 'A', effectKey: 'epic_fetus_mom_knife' },
    // Sacred Heart synergies
    'proptosis+sacred heart': { tier: 'S', effectKey: 'proptosis_sacred_heart' },
    'polyphemus+sacred heart': { tier: 'S', effectKey: 'polyphemus_sacred_heart' },
    'epic fetus+sacred heart': { tier: 'S', effectKey: 'epic_fetus_sacred_heart' },
    // Crown of Light synergies
    'chocolate milk+crown of light': { tier: 'S', effectKey: 'chocolate_milk_crown_of_light' },
    // Dr. Fetus synergies
    "dr. fetus+monstro's lung": { tier: 'A', effectKey: 'dr_fetus_monstros_lung' },
    'dr. fetus+polyphemus': { tier: 'A', effectKey: 'dr_fetus_polyphemus' },
    // Misc
    "dead cat+judas' shadow": { tier: 'A', effectKey: 'dead_cat_judas_shadow' },
};

// Mock item search data
const ITEMS_DATABASE = [
    { id: 1, name: 'Brimstone', sprite: '/sprites/1_Passive Items/Brimstone.png', tier: 'S' },
    { id: 2, name: 'Polyphemus', sprite: '/sprites/1_Passive Items/Polyphemus.png', tier: 'S' },
    { id: 3, name: 'Sacred Heart', sprite: '/sprites/1_Passive Items/Sacred Heart.png', tier: 'S' },
    { id: 4, name: 'Mom\'s Knife', sprite: '/sprites/1_Passive Items/Moms Knife.png', tier: 'S' },
    { id: 5, name: 'Spoon Bender', sprite: '/sprites/1_Passive Items/Spoon Bender.png', tier: 'B' },
    { id: 6, name: 'Tammy\'s Head', sprite: '/sprites/2_Active Items/Tammys Head.png', tier: 'A' },
    { id: 7, name: 'Dr. Fetus', sprite: '/sprites/1_Passive Items/Dr. Fetus.png', tier: 'A' },
    { id: 8, name: 'Ipecac', sprite: '/sprites/1_Passive Items/Ipecac.png', tier: 'A' },
    { id: 9, name: 'Cricket\'s Head', sprite: '/sprites/1_Passive Items/Crickets Head.png', tier: 'A' },
    { id: 10, name: 'Magic Mushroom', sprite: '/sprites/1_Passive Items/Magic Mushroom.png', tier: 'S' },
    { id: 11, name: 'Tech X', sprite: '/sprites/1_Passive Items/Tech X.png', tier: 'S' },
    { id: 12, name: 'Godhead', sprite: '/sprites/1_Passive Items/Godhead.png', tier: 'S' },
    { id: 13, name: "Monstro's Lung", sprite: "/sprites/1_Passive Items/Monstro's Lung.png", tier: 'A' },
    { id: 14, name: 'The Inner Eye', sprite: '/sprites/1_Passive Items/The Inner Eye.png', tier: 'A' },
    { id: 15, name: 'Mutant Spider', sprite: '/sprites/1_Passive Items/Mutant Spider.png', tier: 'A' },
    { id: 16, name: "Jacob's Ladder", sprite: "/sprites/1_Passive Items/Jacob's Ladder.png", tier: 'B' },
    { id: 17, name: 'Continuum', sprite: '/sprites/1_Passive Items/Continuum.png', tier: 'B' },
    { id: 18, name: 'Flat Stone', sprite: '/sprites/1_Passive Items/Flat Stone.png', tier: 'B' },
    { id: 19, name: 'Haemolacria', sprite: '/sprites/1_Passive Items/Haemolacria.png', tier: 'A' },
    { id: 20, name: "Death's Touch", sprite: "/sprites/1_Passive Items/Death's Touch.png", tier: 'B' },
    { id: 21, name: 'Epic Fetus', sprite: '/sprites/1_Passive Items/Epic Fetus.png', tier: 'S' },
    { id: 22, name: 'Proptosis', sprite: '/sprites/1_Passive Items/Proptosis.png', tier: 'A' },
    { id: 23, name: 'Crown of Light', sprite: '/sprites/1_Passive Items/Crown of Light.png', tier: 'S' },
    { id: 24, name: 'Eye of the Occult', sprite: '/sprites/1_Passive Items/Eye of the Occult.png', tier: 'A' },
    { id: 25, name: 'Dead Cat', sprite: '/sprites/1_Passive Items/Dead Cat.png', tier: 'B' },
    { id: 26, name: "Judas' Shadow", sprite: "/sprites/1_Passive Items/Judas' Shadow.png", tier: 'A' },
    { id: 27, name: 'The Ludovico Technique', sprite: '/sprites/1_Passive Items/The Ludovico Technique.png', tier: 'A' },
    { id: 28, name: 'Chocolate Milk', sprite: '/sprites/1_Passive Items/Chocolate Milk.png', tier: 'B' },
];

const PLACEHOLDER_EXAMPLES = [
    'Brimstone, Polyphemus...',
    'Sacred Heart, Spoon Bender...',
    'Mom\'s Knife, Cricket\'s Head...',
    'Tech X, Godhead...',
];

const TIER_COLORS = {
    'S+': 'text-accent-gold bg-accent-gold/10 border-accent-gold',
    'S': 'text-accent-gold bg-accent-gold/10 border-accent-gold',
    'A': 'text-green-500 bg-green-500/10 border-green-500',
    'B': 'text-blue-500 bg-blue-500/10 border-blue-500',
    'C': 'text-yellow-500 bg-yellow-500/10 border-yellow-500',
    'D': 'text-orange-500 bg-orange-500/10 border-orange-500',
    'F': 'text-accent-blood bg-accent-blood/10 border-accent-blood',
};

export function ItemAnalyzerBar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);
    const [synergies, setSynergies] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Rotate placeholder text
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Filter items based on search
    useEffect(() => {
        if (searchValue.trim()) {
            const filtered = ITEMS_DATABASE.filter(
                item => 
                    item.name.toLowerCase().includes(searchValue.toLowerCase()) &&
                    !selectedItems.find(s => s.id === item.id)
            ).slice(0, 6);
            setFilteredItems(filtered);
            setShowDropdown(filtered.length > 0);
        } else {
            setFilteredItems([]);
            setShowDropdown(false);
        }
    }, [searchValue, selectedItems]);

    // Calculate synergies when items change
    useEffect(() => {
        if (selectedItems.length >= 2) {
            const foundSynergies = [];
            const foundWarnings = [];

            // Check all pairs of selected items
            for (let i = 0; i < selectedItems.length; i++) {
                for (let j = i + 1; j < selectedItems.length; j++) {
                    const key1 = `${selectedItems[i].name.toLowerCase()}+${selectedItems[j].name.toLowerCase()}`;
                    const key2 = `${selectedItems[j].name.toLowerCase()}+${selectedItems[i].name.toLowerCase()}`;
                    
                    const synergy = SYNERGY_DATABASE[key1] || SYNERGY_DATABASE[key2];
                    if (synergy) {
                        const synergyData = {
                            ...synergy,
                            items: [selectedItems[i], selectedItems[j]],
                        };
                        if (synergy.isWarning) {
                            foundWarnings.push(synergyData);
                        } else {
                            foundSynergies.push(synergyData);
                        }
                    }
                }
            }

            setSynergies(foundSynergies);
            setWarnings(foundWarnings);
        } else {
            setSynergies([]);
            setWarnings([]);
        }
    }, [selectedItems]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) && 
                inputRef.current && !inputRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addItem = useCallback((item) => {
        if (selectedItems.length < 6) {
            setSelectedItems(prev => [...prev, item]);
            setSearchValue('');
            setShowDropdown(false);
            inputRef.current?.focus();
        }
    }, [selectedItems.length]);

    const removeItem = useCallback((itemId) => {
        setSelectedItems(prev => prev.filter(i => i.id !== itemId));
    }, []);

    const analyzeItems = useCallback(() => {
        if (selectedItems.length >= 1) {
            setShowResults(true);
        }
    }, [selectedItems.length]);

    const clearAll = useCallback(() => {
        setSelectedItems([]);
        setSynergies([]);
        setWarnings([]);
        setShowResults(false);
        setSearchValue('');
    }, []);

    // Calculate overall tier based on synergies
    const overallTier = synergies.length > 0 
        ? synergies.reduce((best, s) => {
            const tiers = ['S+', 'S', 'A', 'B', 'C', 'D', 'F'];
            return tiers.indexOf(s.tier) < tiers.indexOf(best) ? s.tier : best;
        }, 'F')
        : selectedItems.length > 0 ? selectedItems[0].tier : null;

    return (
        <section id="item-analyzer" className="relative w-full px-4 md:px-8 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-heading text-text-heading mb-2">
                        <FaFlask className="inline-block mr-2 text-accent-blood" />
                        {t('analyzer.title')}
                    </h2>
                    <p className="text-text-dim font-handwriting text-lg">
                        {t('analyzer.subtitle')}
                    </p>
                </div>

                {/* Main input card */}
                <motion.div 
                    className="relative bg-bg-paper border-[3px] border-black shadow-[6px_6px_0px_#000] p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Paper texture overlay */}
                    <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
                    
                    {/* Search input */}
                    <div className="relative mb-4">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onFocus={() => searchValue && setShowDropdown(true)}
                                placeholder={`${t('analyzer.placeholder')} ${PLACEHOLDER_EXAMPLES[placeholderIndex]}`}
                                className="w-full h-14 pl-12 pr-4 bg-white/80 border-2 border-black text-text-ink font-handwriting text-lg placeholder:text-text-dim/50 focus:outline-none focus:border-accent-blood transition-colors"
                            />
                        </div>

                        {/* Autocomplete dropdown */}
                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div
                                    ref={dropdownRef}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-50 w-full mt-1 bg-white border-2 border-black shadow-[4px_4px_0px_#000] max-h-64 overflow-y-auto"
                                >
                                    {filteredItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => addItem(item)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-bg-paper transition-colors text-left border-b border-black/10 last:border-b-0"
                                        >
                                            <img 
                                                src={item.sprite} 
                                                alt={item.name}
                                                className="w-10 h-10 pixelated"
                                                onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                                            />
                                            <span className="font-heading text-text-ink">{item.name}</span>
                                            <span className={cn(
                                                'ml-auto px-2 py-0.5 text-xs font-bold border rounded',
                                                TIER_COLORS[item.tier]
                                            )}>
                                                {item.tier}
                                            </span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Selected items chips */}
                    {selectedItems.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            <AnimatePresence mode="popLayout">
                                {selectedItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
                                    >
                                        <img 
                                            src={item.sprite} 
                                            alt={item.name}
                                            className="w-6 h-6 pixelated"
                                        />
                                        <span className="font-heading text-sm">{item.name}</span>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="ml-1 text-text-dim hover:text-accent-blood transition-colors"
                                        >
                                            <FaTimes className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {selectedItems.length < 6 && (
                                <button
                                    onClick={() => inputRef.current?.focus()}
                                    className="flex items-center gap-1 px-3 py-2 border-2 border-dashed border-text-dim/30 text-text-dim hover:border-accent-blood hover:text-accent-blood transition-colors"
                                >
                                    <span className="text-lg">+</span>
                                    <span className="font-handwriting text-sm">{t('analyzer.addMore')}</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Analyze button */}
                    <div className="flex gap-3">
                        <button
                            onClick={analyzeItems}
                            disabled={selectedItems.length === 0}
                            className={cn(
                                "flex-1 h-12 flex items-center justify-center gap-2 font-heading text-lg border-2 border-black transition-all",
                                selectedItems.length > 0
                                    ? "bg-accent-blood text-white hover:bg-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            <FaFlask />
                            {t('analyzer.analyzeCombination')}
                        </button>
                        {selectedItems.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="h-12 px-4 bg-white border-2 border-black text-text-ink hover:bg-black hover:text-white transition-colors"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Results panel */}
                <AnimatePresence>
                    {showResults && selectedItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 20, height: 0 }}
                            className="mt-4 bg-bg-paper border-[3px] border-black shadow-[6px_6px_0px_#000] overflow-hidden"
                        >
                            <div className="p-6">
                                {/* Overall tier */}
                                {overallTier && (
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-dashed border-black/20">
                                        <div>
                                            <h3 className="font-heading text-xl text-text-heading">
                                                {t('analyzer.analysisTitle')}
                                            </h3>
                                            <p className="text-text-dim font-handwriting">
                                                {synergies.length === 1 
                                                    ? t('analyzer.synergyFound', { count: synergies.length })
                                                    : t('analyzer.synergiesFound', { count: synergies.length })}
                                                {warnings.length > 0 && ` · ${warnings.length === 1 
                                                    ? t('analyzer.warningsCount', { count: warnings.length })
                                                    : t('analyzer.warningsCountPlural', { count: warnings.length })}`}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            'px-6 py-3 font-heading text-3xl border-2 rounded',
                                            TIER_COLORS[overallTier]
                                        )}>
                                            {t('analyzer.tier')} {overallTier}
                                        </div>
                                    </div>
                                )}

                                {/* Synergies */}
                                {synergies.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="flex items-center gap-2 font-heading text-lg text-text-heading mb-3">
                                            <FaBolt className="text-accent-gold" />
                                            {t('analyzer.synergiesFoundSection')}
                                        </h4>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {synergies.map((synergy, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <img 
                                                            src={synergy.items[0].sprite} 
                                                            alt={synergy.items[0].name}
                                                            className="w-8 h-8 pixelated"
                                                        />
                                                        <span className="text-text-dim">+</span>
                                                        <img 
                                                            src={synergy.items[1].sprite} 
                                                            alt={synergy.items[1].name}
                                                            className="w-8 h-8 pixelated"
                                                        />
                                                        <span className={cn(
                                                            'ml-auto px-2 py-0.5 text-xs font-bold border rounded',
                                                            TIER_COLORS[synergy.tier]
                                                        )}>
                                                            {synergy.tier}
                                                        </span>
                                                    </div>
                                                    <p className="font-heading text-sm text-accent-gold mb-1">
                                                        {t(`synergies.data.${synergy.effectKey}.effect`)}
                                                    </p>
                                                    <p className="text-sm text-text-dim font-handwriting">
                                                        {t(`synergies.data.${synergy.effectKey}.details`)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Warnings */}
                                {warnings.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="flex items-center gap-2 font-heading text-lg text-accent-blood mb-3">
                                            <FaExclamationTriangle />
                                            {t('analyzer.warnings')}
                                        </h4>
                                        <div className="space-y-3">
                                            {warnings.map((warning, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 bg-accent-blood/5 border-2 border-dashed border-accent-blood"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaExclamationTriangle className="text-accent-blood" />
                                                        <span className="font-heading text-accent-blood">
                                                            {warning.items[0].name} + {warning.items[1].name}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-text-ink font-handwriting">
                                                        {t(`synergies.data.${warning.effectKey}.details`)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No synergies found */}
                                {synergies.length === 0 && warnings.length === 0 && selectedItems.length >= 2 && (
                                    <div className="text-center py-8">
                                        <p className="text-text-dim font-handwriting text-lg mb-4">
                                            🤔 {t('analyzer.noCombinationData')}
                                        </p>
                                        <button className="font-heading text-accent-blood underline underline-offset-4 hover:no-underline">
                                            {t('analyzer.testedIt')}
                                        </button>
                                    </div>
                                )}

                                {/* Single item - show individual info */}
                                {selectedItems.length === 1 && (
                                    <div className="text-center py-4">
                                        <p className="text-text-dim font-handwriting text-lg mb-4">
                                            {t('analyzer.addMoreItemsForSynergies')}
                                        </p>
                                        <button 
                                            onClick={() => navigate(`/items`)}
                                            className="font-heading text-accent-blood underline underline-offset-4 hover:no-underline"
                                        >
                                            {t('analyzer.viewItemCard', { item: selectedItems[0].name })}
                                        </button>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-dashed border-black/20">
                                    <button 
                                        onClick={() => navigate('/builds')}
                                        className="flex items-center gap-2 px-4 py-2 bg-black text-white font-heading text-sm hover:bg-accent-blood transition-colors"
                                    >
                                        <FaStar />
                                        {t('analyzer.viewBuildsWithItems')}
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black font-heading text-sm hover:bg-black hover:text-white transition-colors">
                                        <FaBookmark />
                                        {t('analyzer.saveAnalysis')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Suggestion when empty */}
                {selectedItems.length === 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-text-dim font-handwriting mt-4"
                    >
                        💡 {t('analyzer.tryExample')} <button onClick={() => {
                            addItem(ITEMS_DATABASE[0]); // Brimstone
                            addItem(ITEMS_DATABASE[5]); // Tammy's Head
                        }} className="text-accent-blood underline">Brimstone + Tammy's Head</button>
                    </motion.p>
                )}
            </div>
        </section>
    );
}

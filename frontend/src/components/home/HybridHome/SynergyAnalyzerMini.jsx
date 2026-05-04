/**
 * SynergyAnalyzerMini - Widget de análisis rápido de sinergias
 * 
 * UBICACIÓN: Entre LiveActivitySection y EcosystemSection
 * 
 * FLUJO PSICOLÓGICO:
 * - Usuario ya vio el tracker (valor principal)
 * - Usuario ya vio resultados ejemplo (anticipación)
 * - Usuario ya vio actividad social (confianza)
 * → AHORA: Gratificación inmediata sin compromiso
 * → DESPUÉS: Ecosystem y CTA final
 * 
 * JERARQUÍA VISUAL:
 * - El tracker (Hero) es el protagonista visual (85vh, colores intensos)
 * - El analyzer es un "bonus" visual (40vh, más sutil)
 * - NO compite: usa fondo diferente, tamaño menor, sin animaciones agresivas
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBolt, FaSearch, FaTimes, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { cn } from '../../../lib/utils';

// Sinergias precalculadas para demo rápido (sin DB) - uses translation keys
export const SYNERGY_DATABASE = {
    // Tier S Synergies
    'brimstone+tammy_head': { rating: 'S', score: 10, effectKey: 'brimstone_tammy_head' },
    'ipecac+my_reflection': { rating: 'S', score: 10, effectKey: 'ipecac_my_reflection' },
    'tech_x+brimstone': { rating: 'S', score: 9, effectKey: 'tech_x_brimstone' },
    'sacred_heart+godhead': { rating: 'S', score: 10, effectKey: 'sacred_heart_godhead' },
    // Tier A
    'crickets_head+polyphemus': { rating: 'A', score: 8, effectKey: 'crickets_head_polyphemus' },
    'technology+spoon_bender': { rating: 'A', score: 7, effectKey: 'technology_spoon_bender' },
    'mom_knife+dead_eye': { rating: 'A', score: 8, effectKey: 'mom_knife_dead_eye' },
    // Tier B
    'tiny_planet+rubber_cement': { rating: 'B', score: 6, effectKey: 'tiny_planet_rubber_cement' },
    'the_ludovico_technique+strange_attractor': { rating: 'B', score: 5, effectKey: 'the_ludovico_technique_strange_attractor' },
    // Negative synergies
    'dr_fetus+ipecac': { rating: 'D', score: 2, effectKey: 'dr_fetus_ipecac', isAntiSynergy: true },
    'soy_milk+polyphemus': { rating: 'C', score: 4, effectKey: 'soy_milk_polyphemus', isAntiSynergy: true },
    'brimstone+chocolate_milk': { rating: 'C', score: 4, effectKey: 'brimstone_chocolate_milk', isAntiSynergy: true },
    // Brimstone synergies
    'brimstone+monstros_lung': { rating: 'S', score: 10, effectKey: 'brimstone_monstros_lung' },
    'brimstone+the_ludovico_technique': { rating: 'S', score: 10, effectKey: 'brimstone_ludovico_technique' },
    'brimstone+inner_eye': { rating: 'S', score: 10, effectKey: 'brimstone_inner_eye' },
    'brimstone+mutant_spider': { rating: 'S', score: 10, effectKey: 'brimstone_mutant_spider' },
    'brimstone+jacobs_ladder': { rating: 'A', score: 7, effectKey: 'brimstone_jacobs_ladder' },
    'brimstone+continuum': { rating: 'A', score: 7, effectKey: 'brimstone_continuum' },
    'brimstone+flat_stone': { rating: 'A', score: 7, effectKey: 'brimstone_flat_stone' },
    'brimstone+haemolacria': { rating: 'A', score: 7, effectKey: 'brimstone_haemolacria' },
    'brimstone+godhead': { rating: 'A', score: 7, effectKey: 'brimstone_godhead' },
    'brimstone+deaths_touch': { rating: 'A', score: 7, effectKey: 'brimstone_deaths_touch' },
    'brimstone+eye_of_the_occult': { rating: 'S', score: 9, effectKey: 'brimstone_eye_of_the_occult' },
    // Ipecac synergies
    'ipecac+the_ludovico_technique': { rating: 'S', score: 10, effectKey: 'ipecac_ludovico_technique' },
    // Mom's Knife synergies
    'mom_knife+mutant_spider': { rating: 'S', score: 10, effectKey: 'mom_knife_mutant_spider' },
    'mom_knife+the_ludovico_technique': { rating: 'S', score: 10, effectKey: 'mom_knife_ludovico_technique' },
    'epic_fetus+mom_knife': { rating: 'A', score: 7, effectKey: 'epic_fetus_mom_knife' },
    // Sacred Heart synergies
    'proptosis+sacred_heart': { rating: 'S', score: 10, effectKey: 'proptosis_sacred_heart' },
    'polyphemus+sacred_heart': { rating: 'S', score: 10, effectKey: 'polyphemus_sacred_heart' },
    'epic_fetus+sacred_heart': { rating: 'S', score: 10, effectKey: 'epic_fetus_sacred_heart' },
    // Misc
    'chocolate_milk+crown_of_light': { rating: 'S', score: 9, effectKey: 'chocolate_milk_crown_of_light' },
    'dr_fetus+monstros_lung': { rating: 'A', score: 7, effectKey: 'dr_fetus_monstros_lung' },
    'dr_fetus+polyphemus': { rating: 'A', score: 7, effectKey: 'dr_fetus_polyphemus' },
    'dead_cat+judas_shadow': { rating: 'A', score: 7, effectKey: 'dead_cat_judas_shadow' },
};

// Items populares para sugerencias
export const POPULAR_ITEMS = [
    { id: 'brimstone', name: 'Brimstone', sprite: '/sprites/1_Passive Items/Brimstone.png' },
    { id: 'sacred_heart', name: 'Sacred Heart', sprite: '/sprites/1_Passive Items/Sacred Heart.png' },
    { id: 'godhead', name: 'Godhead', sprite: '/sprites/1_Passive Items/Godhead.png' },
    { id: 'ipecac', name: 'Ipecac', sprite: '/sprites/1_Passive Items/Ipecac.png' },
    { id: 'polyphemus', name: 'Polyphemus', sprite: '/sprites/1_Passive Items/Polyphemus.png' },
    { id: 'tech_x', name: 'Tech X', sprite: '/sprites/1_Passive Items/Tech X.png' },
    { id: 'mom_knife', name: "Mom's Knife", sprite: "/sprites/1_Passive Items/Mom's Knife.png" },
    { id: 'tammy_head', name: "Tammy's Head", sprite: '/sprites/2_Active Items/Tammys Head.png' },
    { id: 'monstros_lung', name: "Monstro's Lung", sprite: "/sprites/1_Passive Items/Monstro's Lung.png" },
    { id: 'mutant_spider', name: 'Mutant Spider', sprite: '/sprites/1_Passive Items/Mutant Spider.png' },
    { id: 'epic_fetus', name: 'Epic Fetus', sprite: '/sprites/1_Passive Items/Epic Fetus.png' },
    { id: 'proptosis', name: 'Proptosis', sprite: '/sprites/1_Passive Items/Proptosis.png' },
    { id: 'the_ludovico_technique', name: 'The Ludovico Technique', sprite: '/sprites/1_Passive Items/The Ludovico Technique.png' },
    { id: 'inner_eye', name: 'The Inner Eye', sprite: '/sprites/1_Passive Items/The Inner Eye.png' },
];

export function SynergyAnalyzerMini() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [state, setState] = useState('empty'); // empty | searching | loading | result | error
    const [result, setResult] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    // Filtrar items por búsqueda
    const filteredItems = POPULAR_ITEMS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Agregar item
    const addItem = (item) => {
        if (selectedItems.length >= 3) return;
        if (selectedItems.find(i => i.id === item.id)) return;
        
        setSelectedItems([...selectedItems, item]);
        setSearchQuery('');
        setShowSearch(false);
        
        // Track analytics
        window.gtag?.('event', 'synergy_item_add', { item_id: item.id });
    };

    // Quitar item
    const removeItem = (itemId) => {
        setSelectedItems(selectedItems.filter(i => i.id !== itemId));
        setResult(null);
        setState('empty');
    };

    // Analizar sinergia
    const analyzeSynergy = async () => {
        if (selectedItems.length < 2) return;
        
        setState('loading');
        
        // Track analytics
        window.gtag?.('event', 'synergy_try', { 
            items: selectedItems.map(i => i.id).join('+'),
            item_count: selectedItems.length
        });

        // Simular llamada API (en producción sería real)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Buscar sinergia en database
        const key = selectedItems.map(i => i.id).sort().join('+');
        const reverseKey = selectedItems.map(i => i.id).sort().reverse().join('+');
        
        const synergy = SYNERGY_DATABASE[key] || SYNERGY_DATABASE[reverseKey];
        
        if (synergy) {
            setResult(synergy);
            setState('result');
            
            // Track result view
            window.gtag?.('event', 'synergy_result_view', {
                items: key,
                rating: synergy.rating,
                is_anti_synergy: synergy.isAntiSynergy || false
            });
        } else {
            // Generar resultado genérico si no está en DB
            setResult({
                rating: 'B',
                score: 5,
                isGeneric: true
            });
            setState('result');
        }
    };

    // Reset
    const reset = () => {
        setSelectedItems([]);
        setResult(null);
        setState('empty');
        setSearchQuery('');
    };

    // Ir a página completa
    const goToFullAnalyzer = () => {
        // Track conversion
        window.gtag?.('event', 'synergy_to_full', { 
            items: selectedItems.map(i => i.id).join('+'),
            had_result: !!result
        });
        
        navigate('/synergies', { 
            state: { preloadedItems: selectedItems } 
        });
    };

    return (
        <section className="relative w-full px-4 md:px-8 py-16 bg-gradient-to-b from-transparent via-black/5 to-transparent">
            <div className="max-w-4xl mx-auto">
                
                {/* Header - Menor jerarquía que el tracker */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-heading uppercase tracking-wider mb-4">
                        <FaBolt className="w-3 h-3" />
                        {t('synergy.quickAnalyzer')}
                    </div>
                    
                    <h2 className="font-heading text-2xl md:text-3xl text-text-heading mb-2">
                        {t('synergy.analyzerSubtitle')}
                    </h2>
                    <p className="font-handwriting text-text-dim max-w-md mx-auto">
                        {t('synergy.selectAtLeast2')}
                    </p>
                </motion.div>

                {/* Analyzer Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000]"
                >
                    {/* Selected Items */}
                    <div className="p-4 md:p-6 border-b-2 border-black/10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs text-text-dim font-heading uppercase">
                                Items ({selectedItems.length}/3)
                            </span>
                            {selectedItems.length > 0 && (
                                <button
                                    onClick={reset}
                                    className="text-xs text-text-dim hover:text-accent-blood transition-colors"
                                >
                                    {t('synergy.clear')}
                                </button>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3 min-h-[60px]">
                            {/* Selected items */}
                            <AnimatePresence>
                                {selectedItems.map(item => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="relative flex items-center gap-2 px-3 py-2 bg-black/5 border border-black/20"
                                    >
                                        <img 
                                            src={item.sprite}
                                            alt={item.name}
                                            className="w-8 h-8 pixelated"
                                            onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                                        />
                                        <span className="font-heading text-sm">{item.name}</span>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="ml-1 p-1 hover:text-accent-blood transition-colors"
                                        >
                                            <FaTimes className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {/* Plus signs between items */}
                            {selectedItems.length > 0 && selectedItems.length < 3 && (
                                <span className="flex items-center text-2xl text-text-dim">+</span>
                            )}
                            
                            {/* Add item button / Search */}
                            {selectedItems.length < 3 && (
                                <div className="relative">
                                    {showSearch ? (
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder={t('synergy.searchItem')}
                                                    className="pl-10 pr-4 py-2 w-48 border-2 border-black/20 bg-white font-sans text-sm focus:outline-none focus:border-accent-gold"
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                onClick={() => setShowSearch(false)}
                                                className="p-2 text-text-dim hover:text-black"
                                            >
                                                <FaTimes className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowSearch(true)}
                                            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-black/20 text-text-dim hover:border-accent-gold hover:text-accent-gold transition-colors"
                                        >
                                            <FaSearch className="w-4 h-4" />
                                            <span className="font-heading text-sm">{t('synergy.addItem')}</span>
                                        </button>
                                    )}
                                    
                                    {/* Search dropdown */}
                                    {showSearch && searchQuery && (
                                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border-2 border-black shadow-[3px_3px_0px_#000] z-20 max-h-48 overflow-auto">
                                            {filteredItems.length > 0 ? (
                                                filteredItems.map(item => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => addItem(item)}
                                                        disabled={selectedItems.find(i => i.id === item.id)}
                                                        className={cn(
                                                            "flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-accent-gold/10 transition-colors",
                                                            selectedItems.find(i => i.id === item.id) && "opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <img 
                                                            src={item.sprite}
                                                            alt={item.name}
                                                            className="w-6 h-6 pixelated"
                                                        />
                                                        <span className="font-heading text-sm">{item.name}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="px-3 py-2 text-sm text-text-dim">{t('synergy.notFound')}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Quick suggestions */}
                        {selectedItems.length === 0 && !showSearch && (
                            <div className="mt-4">
                                <p className="text-xs text-text-dim mb-2">{t('synergy.popular')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {POPULAR_ITEMS.slice(0, 6).map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => addItem(item)}
                                            className="flex items-center gap-1.5 px-2 py-1 bg-black/5 hover:bg-accent-gold/10 border border-transparent hover:border-accent-gold/30 transition-colors"
                                        >
                                            <img 
                                                src={item.sprite}
                                                alt={item.name}
                                                className="w-5 h-5 pixelated"
                                            />
                                            <span className="text-xs font-heading">{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analyze Button & Results */}
                    <div className="p-4 md:p-6">
                        <AnimatePresence mode="wait">
                            {/* Empty state - show analyze button */}
                            {state === 'empty' && selectedItems.length >= 2 && (
                                <motion.button
                                    key="analyze-btn"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={analyzeSynergy}
                                    className="w-full py-4 bg-accent-gold text-black font-heading text-lg hover:bg-accent-gold/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaBolt className="w-5 h-5" />
                                    {t('synergy.analyzeSynergy')}
                                </motion.button>
                            )}
                            
                            {/* Empty hint */}
                            {state === 'empty' && selectedItems.length < 2 && (
                                <motion.p
                                    key="hint"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-text-dim font-handwriting py-4"
                                >
                                    {t('synergy.selectAtLeast2')}
                                </motion.p>
                            )}
                            
                            {/* Loading */}
                            {state === 'loading' && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center gap-3 py-6"
                                >
                                    <FaSpinner className="w-5 h-5 animate-spin text-accent-gold" />
                                    <span className="font-heading">{t('synergy.analyzing')}</span>
                                </motion.div>
                            )}
                            
                            {/* Result */}
                            {state === 'result' && result && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Rating badge */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "w-12 h-12 flex items-center justify-center font-heading text-2xl border-2",
                                                result.rating === 'S' && "bg-accent-gold text-black border-accent-gold",
                                                result.rating === 'A' && "bg-green-500 text-white border-green-600",
                                                result.rating === 'B' && "bg-blue-500 text-white border-blue-600",
                                                result.rating === 'C' && "bg-orange-400 text-black border-orange-500",
                                                result.rating === 'D' && "bg-accent-blood text-white border-red-700"
                                            )}>
                                                {result.rating}
                                            </span>
                                            <div>
                                                <p className="font-heading text-lg">
                                                    {result.rating === 'S' && t('synergy.legendary')}
                                                    {result.rating === 'A' && t('synergy.excellent')}
                                                    {result.rating === 'B' && t('synergy.decent')}
                                                    {result.rating === 'C' && t('synergy.weak')}
                                                    {result.rating === 'D' && t('synergy.antiSynergy')}
                                                </p>
                                                <p className="text-xs text-text-dim">
                                                    {t('synergy.score')}: {result.score}/10
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Warning/Check icon */}
                                        {result.isAntiSynergy ? (
                                            <FaExclamationTriangle className="w-6 h-6 text-accent-blood" />
                                        ) : result.rating === 'S' || result.rating === 'A' ? (
                                            <FaCheckCircle className="w-6 h-6 text-green-500" />
                                        ) : null}
                                    </div>
                                    
                                    {/* Effect description */}
                                    <div className={cn(
                                        "p-3 border-l-4 font-handwriting",
                                        result.isAntiSynergy 
                                            ? "bg-accent-blood/10 border-accent-blood" 
                                            : "bg-accent-gold/10 border-accent-gold"
                                    )}>
                                        {result.effectKey 
                                            ? t(`synergies.data.${result.effectKey}.effect`)
                                            : result.isGeneric 
                                                ? t('synergy.neutralSynergy')
                                                : result.effect
                                        }
                                    </div>
                                    
                                    {/* CTAs */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                        <button
                                            onClick={goToFullAnalyzer}
                                            className="flex-1 py-3 bg-black text-white font-heading text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {t('synergy.viewFullAnalysis')}
                                            <FaArrowRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={reset}
                                            className="py-3 px-6 border-2 border-black/20 font-heading text-sm hover:bg-black/5 transition-colors"
                                        >
                                            {t('synergy.tryAnother')}
                                        </button>
                                    </div>
                                    
                                    {/* Generic result notice */}
                                    {result.isGeneric && (
                                        <p className="text-xs text-text-dim text-center">
                                            {t('synergy.knowThisSynergy')} <button className="underline hover:text-accent-blood">{t('synergy.contributeToWiki')}</button>
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Secondary CTA - Lower hierarchy than tracker */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-6 text-sm text-text-dim font-handwriting"
                >
                    {t('synergy.documentedSynergies', { count: 627 })}
                </motion.p>
            </div>
        </section>
    );
}

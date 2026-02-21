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
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaBolt, FaSearch, FaTimes, FaArrowLeft, FaHeart, FaSave, 
    FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaSpinner,
    FaArrowRight, FaPlus, FaTrash, FaExternalLinkAlt, FaShareAlt
} from 'react-icons/fa';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

// Extended synergy database
const SYNERGY_DATABASE = {
    // Tier S Synergies
    'brimstone+tammy_head': { 
        rating: 'S', 
        score: 10, 
        effect: 'Ráfaga de 10 lágrimas Brimstone en todas direcciones',
        details: 'Al activar Tammy\'s Head, dispara 10 rayos de Brimstone en todas direcciones. Destruye habitaciones enteras.',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Brimstone#Synergies'
    },
    'ipecac+my_reflection': { 
        rating: 'S', 
        score: 10, 
        effect: 'Explosiones masivas que vuelven hacia los enemigos',
        details: 'Las lágrimas venenosas regresan y explotan cerca de los enemigos. Cuidado con el daño a ti mismo.',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Ipecac#Synergies'
    },
    'tech_x+brimstone': { 
        rating: 'S', 
        score: 9, 
        effect: 'Anillos de Brimstone cargables y devastadores',
        details: 'Combina el anillo de Tech X con el rayo de Brimstone. Daño masivo en área.',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Tech_X#Synergies'
    },
    'sacred_heart+godhead': { 
        rating: 'S', 
        score: 10, 
        effect: 'Daño masivo con aura sagrada + homing',
        details: 'Sacred Heart da homing y +1 daño, Godhead añade aura de daño. Combo definitivo.',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Sacred_Heart#Synergies'
    },
    // Tier A
    'crickets_head+polyphemus': { 
        rating: 'A', 
        score: 8, 
        effect: 'Daño x4 combinado, mata todo de un tiro',
        details: 'Multiplicadores de daño se apilan. Un disparo mata prácticamente todo.',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Polyphemus#Synergies'
    },
    'technology+spoon_bender': { 
        rating: 'A', 
        score: 7, 
        effect: 'Láser teledirigido, nunca fallas',
        details: 'El láser de Technology gana homing. Auto-apuntado perfecto.',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Technology#Synergies'
    },
    'mom_knife+dead_eye': { 
        rating: 'A', 
        score: 8, 
        effect: 'Cuchillo con multiplicador de daño creciente',
        details: 'Dead Eye mantiene el multiplicador ya que el cuchillo siempre acierta.',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Mom%27s_Knife#Synergies'
    },
    // Tier B
    'tiny_planet+rubber_cement': { 
        rating: 'B', 
        score: 6, 
        effect: 'Órbitas rebotantes, cobertura total',
        details: 'Las lágrimas orbitan y rebotan. Cobertura excelente en salas cerradas.',
        wikiLink: null
    },
    'the_ludovico_technique+strange_attractor': { 
        rating: 'B', 
        score: 5, 
        effect: 'Lágrima controlable que atrae enemigos',
        details: 'Controla la lágrima mientras los enemigos son atraídos hacia ella.',
        wikiLink: null
    },
    // Anti-synergies
    'dr_fetus+ipecac': { 
        rating: 'D', 
        score: 2, 
        effect: '⚠️ Las bombas explotan al disparar, daño propio casi garantizado', 
        isAntiSynergy: true,
        details: 'PELIGROSO: Las bombas se vuelven inestables. Alta probabilidad de hacerte daño.',
        wikiLink: 'https://bindingofisaacrebirth.fandom.com/wiki/Dr._Fetus#Interactions'
    },
    'soy_milk+polyphemus': { 
        rating: 'C', 
        score: 4, 
        effect: '⚠️ Se anulan parcialmente: daño reducido', 
        isAntiSynergy: true,
        details: 'Soy Milk reduce drásticamente el daño de Polyphemus. No es worth.',
        wikiLink: null
    },
    'brimstone+chocolate_milk': { 
        rating: 'C', 
        score: 4, 
        effect: '⚠️ El cargado extra no suma mucho al Brimstone', 
        isAntiSynergy: true,
        details: 'Chocolate Milk no beneficia significativamente a Brimstone.',
        wikiLink: null
    },
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
];

// Suggested combinations to try
const SUGGESTED_COMBOS = [
    { items: ['brimstone', 'tammy_head'], tag: 'CLASICO' },
    { items: ['sacred_heart', 'godhead'], tag: 'GOD TIER' },
    { items: ['dr_fetus', 'ipecac'], tag: 'PELIGRO' },
];

export function SynergiesPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [shareTooltip, setShareTooltip] = useState(false);

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

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Find all pairwise synergies
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
        
        // Sort by score
        synergies.sort((a, b) => b.score - a.score);
        antiSynergies.sort((a, b) => a.score - b.score);
        
        // Calculate overall rating
        let overallScore = 5; // Neutral base
        synergies.forEach(s => overallScore += (s.score - 5) * 0.5);
        antiSynergies.forEach(s => overallScore -= (5 - s.score) * 0.5);
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
            itemCount: itemsToAnalyze.length
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
                state: { returnTo: '/synergies', message: 'Crea una cuenta para guardar tus combos favoritos' } 
            });
            return;
        }
        
        // TODO: Implement actual save functionality
        alert('Combo guardado! (funcionalidad próximamente)');
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
                        <span className="font-heading text-sm">Volver al inicio</span>
                    </Link>
                    
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="font-heading text-3xl md:text-4xl text-text-heading flex items-center gap-3">
                                <FaBolt className="text-accent-gold" />
                                Analizador de Sinergias
                            </h1>
                            <p className="font-handwriting text-text-dim mt-2">
                                Descubre qué combos rompen el juego y cuáles evitar
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-text-dim">
                            <span>627 sinergias documentadas</span>
                            <span>·</span>
                            <span>Actualizado a Repentance+</span>
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
                                        placeholder="Buscar item..."
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
                                            <p className="px-3 py-2 text-sm text-text-dim">No encontrado</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Selected Items */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-heading text-sm text-text-dim uppercase">
                                        Items ({selectedItems.length}/6)
                                    </span>
                                    {selectedItems.length > 0 && (
                                        <button
                                            onClick={clearAll}
                                            className="text-xs text-text-dim hover:text-accent-blood flex items-center gap-1"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                            Limpiar
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
                                            Busca y agrega items para analizar
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
                                            Analizando...
                                        </>
                                    ) : (
                                        <>
                                            <FaBolt className="w-4 h-4" />
                                            Analizar ({selectedItems.length} items)
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {/* Suggested Combos */}
                            <div className="p-4 border-t-2 border-black/10 bg-black/5">
                                <p className="font-heading text-xs text-text-dim uppercase mb-3">Prueba estos:</p>
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
                                    <h2 className="font-heading text-xl mb-2">Selecciona items para analizar</h2>
                                    <p className="font-handwriting text-text-dim max-w-md mx-auto">
                                        Agrega entre 2 y 6 items desde el panel izquierdo para descubrir sus sinergias
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
                                    <p className="font-heading">Analizando {selectedItems.length} items...</p>
                                    <p className="font-handwriting text-text-dim text-sm mt-2">
                                        Calculando {selectedItems.length * (selectedItems.length - 1) / 2} posibles combinaciones
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
                                                        {results.overallRating === 'S' && 'Build Legendario'}
                                                        {results.overallRating === 'A' && 'Build Excelente'}
                                                        {results.overallRating === 'B' && 'Build Decente'}
                                                        {results.overallRating === 'C' && 'Build Flojo'}
                                                        {results.overallRating === 'D' && 'Build Problemático'}
                                                    </h2>
                                                    <p className="text-text-dim">
                                                        Puntuación: {results.overallScore}/10 · {results.synergies.length} sinergias · {results.antiSynergies.length} conflictos
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <button
                                                        onClick={shareCombo}
                                                        className="p-2 border border-black/20 hover:bg-black/5 transition-colors"
                                                        title="Compartir"
                                                    >
                                                        <FaShareAlt className="w-4 h-4" />
                                                    </button>
                                                    {shareTooltip && (
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs whitespace-nowrap">
                                                            ¡Copiado!
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={saveCombo}
                                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white font-heading text-sm hover:bg-gray-800 transition-colors"
                                                >
                                                    <FaSave className="w-4 h-4" />
                                                    {user ? 'Guardar' : 'Guardar (registrarse)'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Synergies */}
                                    {results.synergies.length > 0 && (
                                        <div className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000]">
                                            <div className="p-4 border-b-2 border-black/10 bg-green-50">
                                                <h3 className="font-heading text-lg flex items-center gap-2">
                                                    <FaCheckCircle className="text-green-500" />
                                                    Sinergias Encontradas ({results.synergies.length})
                                                </h3>
                                            </div>
                                            <div className="divide-y-2 divide-black/10">
                                                {results.synergies.map((syn, idx) => (
                                                    <SynergyCard key={idx} synergy={syn} />
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
                                                    Conflictos Detectados ({results.antiSynergies.length})
                                                </h3>
                                            </div>
                                            <div className="divide-y-2 divide-black/10">
                                                {results.antiSynergies.map((syn, idx) => (
                                                    <SynergyCard key={idx} synergy={syn} isAnti />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* No synergies found */}
                                    {results.synergies.length === 0 && results.antiSynergies.length === 0 && (
                                        <div className="bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000] p-6 text-center">
                                            <p className="font-heading text-lg mb-2">Sin sinergias conocidas</p>
                                            <p className="font-handwriting text-text-dim">
                                                Estos items funcionan de forma independiente. No hay interacciones especiales documentadas.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Contribute CTA */}
                                    <div className="text-center py-4">
                                        <p className="text-sm text-text-dim mb-2">
                                            ¿Conoces una sinergia que falta?
                                        </p>
                                        <button
                                            className="text-sm font-heading text-accent-blood hover:underline"
                                            onClick={() => {
                                                window.gtag?.('event', 'synergy_contribute_click');
                                                // TODO: Open contribution form
                                            }}
                                        >
                                            Contribuye a la wiki →
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Synergy Card Component
function SynergyCard({ synergy, isAnti = false }) {
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
                        {synergy.effect}
                    </p>
                    
                    {synergy.details && (
                        <p className="text-xs text-text-dim mt-1">
                            {synergy.details}
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
                        title="Ver en Wiki"
                    >
                        <FaExternalLinkAlt className="w-4 h-4" />
                    </a>
                )}
            </div>
        </div>
    );
}

export default SynergiesPage;

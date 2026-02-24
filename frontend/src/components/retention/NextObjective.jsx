// NextObjective.jsx - Sistema de objetivo personal automático
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaTarget, FaClock, FaChartLine, FaCheck, FaLightbulb, FaChevronRight } from 'react-icons/fa';
import { cn } from '../../lib/utils';

// Algoritmo de selección de objetivo - returns reason keys for translation
function calculateNextObjective(userStats) {
    if (!userStats) return null;

    const objectives = [];

    // Analizar personajes con pocos marks faltantes (prioridad alta)
    userStats.characters?.forEach(char => {
        const missingMarks = char.totalMarks - char.completedMarks;
        if (missingMarks > 0 && missingMarks <= 3) {
            // Encontrar el mark más fácil que falta
            const easiestMissingMark = char.missingMarks
                ?.sort((a, b) => a.difficulty - b.difficulty)[0];
            
            if (easiestMissingMark) {
                objectives.push({
                    type: 'close_character',
                    character: char.name,
                    characterSprite: char.sprite,
                    boss: easiestMissingMark.boss,
                    missingMarks,
                    difficulty: easiestMissingMark.difficulty,
                    estimatedTime: easiestMissingMark.estimatedTime,
                    impactOnProgress: (1 / userStats.totalMarks) * 100,
                    priority: 10 - missingMarks, // Más alto si le falta menos
                    reasonKeys: [
                        { key: missingMarks === 1 ? 'missingMarks' : 'missingMarks_plural', params: { count: missingMarks, character: char.name } },
                        { key: 'bestWinrateBoss', params: { boss: easiestMissingMark.boss } },
                        { key: 'progressIncrease', params: { percent: Math.round(userStats.percentage + (1 / userStats.totalMarks) * 100) } }
                    ]
                });
            }
        }
    });

    // Analizar bosses nunca derrotados (prioridad media)
    userStats.undefeatedBosses?.forEach(boss => {
        const easiestCharacter = userStats.characters
            ?.filter(c => c.missingMarks?.some(m => m.boss === boss.name))
            ?.sort((a, b) => b.winrate - a.winrate)[0];
        
        if (easiestCharacter) {
            objectives.push({
                type: 'first_boss_kill',
                character: easiestCharacter.name,
                characterSprite: easiestCharacter.sprite,
                boss: boss.name,
                difficulty: boss.difficulty,
                estimatedTime: boss.estimatedTime,
                impactOnProgress: (1 / userStats.totalMarks) * 100,
                priority: 5,
                reasonKeys: [
                    { key: 'neverDefeated', params: { boss: boss.name } },
                    { key: 'bestWinrateCharacter', params: { character: easiestCharacter.name, percent: Math.round(easiestCharacter.winrate) } },
                    { key: 'unlockContent', params: {} }
                ]
            });
        }
    });

    // Ordenar por prioridad y seleccionar el mejor
    objectives.sort((a, b) => {
        // Primero por prioridad
        if (b.priority !== a.priority) return b.priority - a.priority;
        // Luego por dificultad (más fácil primero)
        return a.difficulty - b.difficulty;
    });

    return objectives[0] || null;
}

// Mock data para demo
const MOCK_USER_STATS = {
    percentage: 67,
    totalMarks: 408,
    completedMarks: 273,
    characters: [
        {
            name: 'Tainted Lazarus',
            sprite: '/sprites/0_Characters/1_Tainted/Tainted Lazarus.png',
            totalMarks: 12,
            completedMarks: 11,
            winrate: 45,
            missingMarks: [
                { boss: 'Mother', difficulty: 5, estimatedTime: 45 }
            ]
        },
        {
            name: 'Tainted Lost',
            sprite: '/sprites/0_Characters/1_Tainted/Tainted Lost.png',
            totalMarks: 12,
            completedMarks: 8,
            winrate: 23,
            missingMarks: [
                { boss: 'Delirium', difficulty: 9, estimatedTime: 60 },
                { boss: 'Mother', difficulty: 7, estimatedTime: 50 },
                { boss: 'The Beast', difficulty: 8, estimatedTime: 55 },
                { boss: 'Mega Satan', difficulty: 6, estimatedTime: 45 }
            ]
        }
    ],
    undefeatedBosses: []
};

const DIFFICULTY_COLORS = ['', 'green-500', 'green-500', 'green-400', 'yellow-500', 'yellow-500', 'orange-500', 'orange-500', 'red-500', 'red-600', 'accent-blood'];

// Function to get difficulty label by index
function getDifficultyLabel(t, index) {
    const labels = [
        '',
        t('objective.veryEasy'),
        t('objective.easy'),
        t('objective.easy'),
        t('objective.normal'),
        t('objective.normal'),
        t('objective.medium'),
        t('objective.medium'),
        t('objective.hard'),
        t('objective.veryHard'),
        t('objective.extreme')
    ];
    return labels[index] || t('objective.medium');
}

export function NextObjective({ userStats = MOCK_USER_STATS, onComplete }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [objective, setObjective] = useState(null);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        const calculated = calculateNextObjective(userStats);
        setObjective(calculated);
    }, [userStats]);

    const handleMarkComplete = async () => {
        setIsCompleting(true);
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        onComplete?.(objective);
        setIsCompleting(false);
    };

    if (!objective) {
        return (
            <div className="bg-accent-gold/10 border-2 border-accent-gold/30 p-6 text-center">
                <p className="font-heading text-xl text-accent-gold mb-2">🏆 {t('objective.congratulations')}</p>
                <p className="text-text-dim">{t('objective.reachedDeadGod')}</p>
            </div>
        );
    }

    const difficultyLabel = getDifficultyLabel(t, objective.difficulty);
    const difficultyColor = DIFFICULTY_COLORS[objective.difficulty] || 'yellow-500';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-paper border-[3px] border-black shadow-[6px_6px_0px_#000] overflow-hidden"
        >
            {/* Header */}
            <div className="bg-black text-white px-6 py-4 flex items-center gap-3">
                <FaTarget className="w-5 h-5 text-accent-gold" />
                <h3 className="font-heading text-lg uppercase tracking-wider">
                    {t('objective.yourNextObjective')}
                </h3>
            </div>

            <div className="p-6">
                {/* Main objective */}
                <div className="flex items-start gap-4 mb-6">
                    <img 
                        src={objective.characterSprite}
                        alt={objective.character}
                        className="w-16 h-16 pixelated flex-shrink-0"
                        onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                    />
                    <div>
                        <p className="font-heading text-2xl text-text-heading mb-1">
                            {t('objective.complete')} <span className="text-accent-blood">{objective.boss}</span>
                        </p>
                        <p className="font-handwriting text-lg text-text-dim">
                            {t('objective.with')} {objective.character}
                        </p>
                    </div>
                </div>

                {/* Reasons box */}
                <div className="bg-accent-gold/5 border-2 border-accent-gold/20 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <FaLightbulb className="w-4 h-4 text-accent-gold" />
                        <p className="font-heading text-sm text-accent-gold uppercase">
                            {t('objective.whyThisObjective')}
                        </p>
                    </div>
                    <ul className="space-y-2">
                        {objective.reasonKeys?.map((reason, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-text-ink">
                                <span className="text-accent-gold mt-0.5">•</span>
                                {t(`objective.reasons.${reason.key}`, reason.params)}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Difficulty */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black/5 flex items-center justify-center">
                            <FaChartLine className={cn("w-5 h-5", `text-${difficultyColor}`)} />
                        </div>
                        <div>
                            <p className="text-xs text-text-dim font-handwriting">{t('objective.difficulty')}</p>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                    {[...Array(10)].map((_, i) => (
                                        <div 
                                            key={i}
                                            className={cn(
                                                "w-2 h-3",
                                                i < objective.difficulty 
                                                    ? `bg-${difficultyColor}` 
                                                    : "bg-black/10"
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className={cn("text-sm font-heading", `text-${difficultyColor}`)}>
                                    {difficultyLabel}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Time estimate */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black/5 flex items-center justify-center">
                            <FaClock className="w-5 h-5 text-text-dim" />
                        </div>
                        <div>
                            <p className="text-xs text-text-dim font-handwriting">{t('objective.estimatedTime')}</p>
                            <p className="font-heading text-text-heading">
                                ~{objective.estimatedTime} min
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => navigate(`/bosses/${objective.boss.toLowerCase().replace(' ', '-')}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black/5 border-2 border-black/20 font-heading text-sm hover:bg-black/10 transition-colors"
                    >
                        {t('objective.viewGuide', { boss: objective.boss })}
                        <FaChevronRight className="w-3 h-3" />
                    </button>
                    <button
                        onClick={handleMarkComplete}
                        disabled={isCompleting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent-blood text-white font-heading text-sm border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                        {isCompleting ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FaCheck className="w-4 h-4" />
                        )}
                        {isCompleting ? t('objective.saving') : t('objective.markAsComplete')}
                    </button>
                </div>

                {/* Social proof */}
                <div className="mt-6 pt-4 border-t-2 border-dashed border-black/10 text-center">
                    <p className="text-sm text-text-dim font-handwriting">
                        💡 {t('objective.onlyPercent', { percent: 12, character: objective.character })}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

// Versión compacta para sidebar/widget
export function NextObjectiveCompact({ userStats = MOCK_USER_STATS }) {
    const { t } = useTranslation();
    const objective = calculateNextObjective(userStats);
    
    if (!objective) return null;

    return (
        <div className="bg-accent-gold/5 border-2 border-accent-gold/20 p-4">
            <div className="flex items-center gap-2 mb-2">
                <FaTarget className="w-4 h-4 text-accent-gold" />
                <p className="text-xs font-heading text-accent-gold uppercase">{t('objective.nextObjective')}</p>
            </div>
            <div className="flex items-center gap-3">
                <img 
                    src={objective.characterSprite}
                    alt={objective.character}
                    className="w-10 h-10 pixelated"
                    onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                />
                <div>
                    <p className="font-heading text-sm text-text-heading">
                        {objective.boss}
                    </p>
                    <p className="text-xs text-text-dim">
                        {t('objective.with')} {objective.character}
                    </p>
                </div>
            </div>
        </div>
    );
}

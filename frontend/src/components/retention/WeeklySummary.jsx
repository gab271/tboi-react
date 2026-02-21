// WeeklySummary.jsx - Email template + Dashboard component
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaTrophy, FaFire, FaArrowUp, FaArrowDown, FaMinus, FaBell, FaCog } from 'react-icons/fa';
import { cn } from '../../lib/utils';

// Mock data para el resumen semanal
const MOCK_WEEKLY_DATA = {
    dateRange: '13 - 19 Enero 2025',
    runs: {
        total: 23,
        wins: 17,
        losses: 6,
        winrate: 74,
        winrateChange: '+8' // vs semana anterior
    },
    progress: {
        marksObtained: 4,
        newMarks: ['Tainted Lazarus - Mother', 'Tainted Apollyon - Delirium', 'Cain - Greed', 'Bethany - Hush'],
        percentageBefore: 64,
        percentageNow: 67
    },
    streak: {
        current: 5,
        best: 8,
        lostAt: 'Tainted Lost vs Ultra Greed'
    },
    timeStats: {
        totalPlayed: '8h 34m',
        avgRunLength: '22m',
        longestRun: '48m (Tainted Eden → Boss Rush → Hush → Delirium)'
    },
    topCharacters: [
        { name: 'Azazel', runs: 8, winrate: 88, sprite: '/sprites/0_Characters/0_Vanilla/Azazel.png' },
        { name: 'Tainted Isaac', runs: 6, winrate: 67, sprite: '/sprites/0_Characters/1_Tainted/Tainted_Isaac.png' },
        { name: 'Cain', runs: 4, winrate: 75, sprite: '/sprites/0_Characters/0_Vanilla/Cain.png' }
    ],
    nextObjective: {
        character: 'Tainted Lazarus',
        mark: 'Greed Mode',
        reason: 'Solo le faltan 2 marcas para completarlo'
    },
    comparison: {
        vsLastWeek: '+15% más runs',
        globalPercentile: 'Top 18%'
    },
    highlights: [
        { type: 'first', text: 'Primera victoria con Tainted Apollyon' },
        { type: 'streak', text: 'Nueva racha de 8 victorias' },
        { type: 'boss', text: 'Venciste a Delirium 3 veces' }
    ]
};

// Componente principal del dashboard
export function WeeklySummary({ data = MOCK_WEEKLY_DATA, onOpenSettings }) {
    const winrateChange = parseInt(data.runs.winrateChange);
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-paper border-[3px] border-black shadow-[8px_8px_0px_#000]"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-black to-gray-900 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt className="w-5 h-5 text-accent-gold" />
                        <span className="font-heading text-lg">Tu semana en Isaac</span>
                    </div>
                    <button 
                        onClick={onOpenSettings}
                        className="p-2 hover:bg-white/10 transition-colors"
                        title="Configurar notificaciones"
                    >
                        <FaCog className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-white/60 font-handwriting">{data.dateRange}</p>
            </div>

            {/* Main stats */}
            <div className="grid grid-cols-4 divide-x-2 divide-black/10 border-b-2 border-black/10">
                <div className="p-4 text-center">
                    <p className="font-heading text-3xl text-text-heading">{data.runs.total}</p>
                    <p className="text-xs text-text-dim font-handwriting">runs</p>
                </div>
                <div className="p-4 text-center">
                    <p className="font-heading text-3xl text-green-500">{data.runs.wins}</p>
                    <p className="text-xs text-text-dim font-handwriting">victorias</p>
                </div>
                <div className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <span className="font-heading text-3xl text-accent-gold">{data.runs.winrate}%</span>
                        {winrateChange > 0 && <FaArrowUp className="w-3 h-3 text-green-500" />}
                        {winrateChange < 0 && <FaArrowDown className="w-3 h-3 text-red-500" />}
                        {winrateChange === 0 && <FaMinus className="w-3 h-3 text-gray-400" />}
                    </div>
                    <p className="text-xs text-text-dim font-handwriting">winrate</p>
                </div>
                <div className="p-4 text-center">
                    <p className="font-heading text-3xl text-accent-blood">+{data.progress.marksObtained}</p>
                    <p className="text-xs text-text-dim font-handwriting">marcas</p>
                </div>
            </div>

            {/* Content grid */}
            <div className="p-6 space-y-6">
                {/* Progress section */}
                <section>
                    <h3 className="font-heading text-sm text-text-dim uppercase mb-3 flex items-center gap-2">
                        <FaTrophy className="text-accent-gold" /> Progreso esta semana
                    </h3>
                    
                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-dim">Dead God</span>
                            <span className="font-heading text-accent-gold">{data.progress.percentageNow}%</span>
                        </div>
                        <div className="h-4 bg-black/10 border-2 border-black/20 overflow-hidden relative">
                            {/* Previous week marker */}
                            <div 
                                className="absolute top-0 bottom-0 border-r-2 border-dashed border-white/50 z-10"
                                style={{ left: `${data.progress.percentageBefore}%` }}
                            />
                            {/* Current progress */}
                            <motion.div
                                initial={{ width: `${data.progress.percentageBefore}%` }}
                                animate={{ width: `${data.progress.percentageNow}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-accent-gold to-yellow-500"
                            />
                        </div>
                        <p className="text-xs text-green-600 mt-1 font-handwriting">
                            +{data.progress.percentageNow - data.progress.percentageBefore}% esta semana
                        </p>
                    </div>

                    {/* New marks */}
                    {data.progress.newMarks.length > 0 && (
                        <div className="space-y-1">
                            <p className="text-xs text-text-dim mb-2">Marcas obtenidas:</p>
                            {data.progress.newMarks.map((mark, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <span className="text-green-500">✓</span>
                                    <span className="font-handwriting">{mark}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Streak section */}
                <section className="p-4 bg-orange-500/10 border-2 border-orange-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <FaFire className="text-orange-500" />
                            <span className="font-heading">Racha actual: {data.streak.current}</span>
                        </div>
                        <span className="text-sm text-text-dim">Mejor: {data.streak.best}</span>
                    </div>
                    {data.streak.lostAt && (
                        <p className="text-xs text-text-dim font-handwriting">
                            Racha perdida en: {data.streak.lostAt}
                        </p>
                    )}
                </section>

                {/* Top characters */}
                <section>
                    <h3 className="font-heading text-sm text-text-dim uppercase mb-3">
                        Personajes más jugados
                    </h3>
                    <div className="space-y-2">
                        {data.topCharacters.map((char, i) => (
                            <div key={char.name} className="flex items-center gap-3 p-2 bg-black/5">
                                <span className="text-text-dim font-heading w-4">#{i + 1}</span>
                                <img 
                                    src={char.sprite}
                                    alt={char.name}
                                    className="w-8 h-8 pixelated"
                                    onError={(e) => { e.target.src = '/sprites/placeholder.png'; }}
                                />
                                <span className="font-heading flex-1">{char.name}</span>
                                <span className="text-sm text-text-dim">{char.runs} runs</span>
                                <span className="text-sm text-green-500">{char.winrate}%</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Time stats */}
                <section className="flex justify-around text-center py-4 bg-black/5 border-2 border-black/10">
                    <div>
                        <p className="font-heading text-lg">{data.timeStats.totalPlayed}</p>
                        <p className="text-xs text-text-dim">jugadas</p>
                    </div>
                    <div className="border-l-2 border-black/10 pl-4">
                        <p className="font-heading text-lg">{data.timeStats.avgRunLength}</p>
                        <p className="text-xs text-text-dim">promedio/run</p>
                    </div>
                </section>

                {/* Highlights */}
                {data.highlights.length > 0 && (
                    <section>
                        <h3 className="font-heading text-sm text-text-dim uppercase mb-3">
                            Momentos destacados
                        </h3>
                        <div className="space-y-2">
                            {data.highlights.map((highlight, i) => (
                                <div 
                                    key={i}
                                    className={cn(
                                        "flex items-center gap-3 p-3 border-2",
                                        highlight.type === 'first' && "bg-accent-gold/10 border-accent-gold/30",
                                        highlight.type === 'streak' && "bg-orange-500/10 border-orange-500/30",
                                        highlight.type === 'boss' && "bg-accent-blood/10 border-accent-blood/30"
                                    )}
                                >
                                    <span className="text-lg">
                                        {highlight.type === 'first' && '⭐'}
                                        {highlight.type === 'streak' && '🔥'}
                                        {highlight.type === 'boss' && '💀'}
                                    </span>
                                    <span className="font-handwriting">{highlight.text}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Next objective suggestion */}
                <section className="p-4 bg-gradient-to-r from-accent-gold/10 to-transparent border-l-4 border-accent-gold">
                    <p className="text-xs text-accent-gold font-heading uppercase mb-1">
                        Próximo objetivo sugerido
                    </p>
                    <p className="font-heading text-text-heading">
                        {data.nextObjective.character} → {data.nextObjective.mark}
                    </p>
                    <p className="text-sm text-text-dim font-handwriting mt-1">
                        {data.nextObjective.reason}
                    </p>
                </section>
            </div>

            {/* CTA */}
            <div className="p-6 bg-black/5 border-t-2 border-black/10">
                <button className="w-full py-4 bg-black text-white font-heading text-sm hover:bg-gray-800 transition-colors">
                    VER DASHBOARD COMPLETO →
                </button>
            </div>
        </motion.div>
    );
}

// Email preview version (for template)
export function WeeklySummaryEmail({ data = MOCK_WEEKLY_DATA }) {
    return (
        <div 
            style={{ 
                fontFamily: 'Arial, sans-serif',
                maxWidth: '600px',
                margin: '0 auto',
                backgroundColor: '#ffffff'
            }}
        >
            {/* Email-safe header */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#000000' }}>
                <tr>
                    <td style={{ padding: '24px', textAlign: 'center' }}>
                        <h1 style={{ color: '#DAA520', margin: '0', fontSize: '24px' }}>
                            📊 Tu semana en Isaac
                        </h1>
                        <p style={{ color: '#ffffff80', margin: '8px 0 0', fontSize: '14px' }}>
                            {data.dateRange}
                        </p>
                    </td>
                </tr>
            </table>

            {/* Stats row */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderBottom: '2px solid #eee' }}>
                <tr>
                    <td width="25%" style={{ padding: '20px', textAlign: 'center', borderRight: '1px solid #eee' }}>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0' }}>{data.runs.total}</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>runs</p>
                    </td>
                    <td width="25%" style={{ padding: '20px', textAlign: 'center', borderRight: '1px solid #eee' }}>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#22c55e' }}>{data.runs.wins}</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>victorias</p>
                    </td>
                    <td width="25%" style={{ padding: '20px', textAlign: 'center', borderRight: '1px solid #eee' }}>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#DAA520' }}>{data.runs.winrate}%</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>winrate</p>
                    </td>
                    <td width="25%" style={{ padding: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#dc2626' }}>+{data.progress.marksObtained}</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>marcas</p>
                    </td>
                </tr>
            </table>

            {/* Progress */}
            <table width="100%" cellPadding="24" cellSpacing="0">
                <tr>
                    <td>
                        <h2 style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', margin: '0 0 12px' }}>
                            🏆 Progreso
                        </h2>
                        <p style={{ margin: '0 0 4px' }}>
                            Dead God: <strong style={{ color: '#DAA520' }}>{data.progress.percentageNow}%</strong>
                            <span style={{ color: '#22c55e', fontSize: '12px' }}>
                                {' '}(+{data.progress.percentageNow - data.progress.percentageBefore}% esta semana)
                            </span>
                        </p>
                        
                        {/* Progress bar for email */}
                        <div style={{ 
                            height: '16px', 
                            backgroundColor: '#f0f0f0', 
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginTop: '8px'
                        }}>
                            <div style={{ 
                                width: `${data.progress.percentageNow}%`,
                                height: '100%',
                                backgroundColor: '#DAA520'
                            }} />
                        </div>
                    </td>
                </tr>
            </table>

            {/* New marks */}
            {data.progress.newMarks.length > 0 && (
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ padding: '0 24px 24px' }}>
                    <tr>
                        <td style={{ padding: '0 24px' }}>
                            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px' }}>
                                Marcas obtenidas:
                            </p>
                            {data.progress.newMarks.map((mark, i) => (
                                <p key={i} style={{ margin: '4px 0', fontSize: '14px' }}>
                                    <span style={{ color: '#22c55e' }}>✓</span> {mark}
                                </p>
                            ))}
                        </td>
                    </tr>
                </table>
            )}

            {/* Streak box */}
            <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                    <td style={{ padding: '0 24px 24px' }}>
                        <div style={{ 
                            backgroundColor: '#fff7ed',
                            border: '2px solid #fed7aa',
                            padding: '16px'
                        }}>
                            <p style={{ margin: '0', fontWeight: 'bold' }}>
                                🔥 Racha actual: {data.streak.current}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                                Mejor esta semana: {data.streak.best}
                            </p>
                        </div>
                    </td>
                </tr>
            </table>

            {/* CTA */}
            <table width="100%" cellPadding="24" cellSpacing="0" style={{ backgroundColor: '#f5f5f5' }}>
                <tr>
                    <td style={{ textAlign: 'center' }}>
                        <a 
                            href="https://isaaccompanion.gg/dashboard"
                            style={{
                                display: 'inline-block',
                                backgroundColor: '#000000',
                                color: '#ffffff',
                                padding: '16px 32px',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            VER DASHBOARD COMPLETO →
                        </a>
                        <p style={{ margin: '16px 0 0', fontSize: '12px', color: '#666' }}>
                            <a href="https://isaaccompanion.gg/settings/notifications" style={{ color: '#666' }}>
                                Configurar notificaciones
                            </a>
                        </p>
                    </td>
                </tr>
            </table>

            {/* Footer */}
            <table width="100%" cellPadding="16" cellSpacing="0">
                <tr>
                    <td style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0', fontSize: '11px', color: '#999' }}>
                            Isaac Companion · El tracker para Dead God
                        </p>
                    </td>
                </tr>
            </table>
        </div>
    );
}

// Notification settings component
export function WeeklyEmailSettings({ settings, onUpdate }) {
    const [enabled, setEnabled] = useState(settings?.enabled ?? true);
    const [day, setDay] = useState(settings?.day ?? 'sunday');
    const [time, setTime] = useState(settings?.time ?? '18:00');

    const days = [
        { value: 'sunday', label: 'Domingo' },
        { value: 'monday', label: 'Lunes' }
    ];

    const times = [
        { value: '10:00', label: '10:00' },
        { value: '14:00', label: '14:00' },
        { value: '18:00', label: '18:00' },
        { value: '21:00', label: '21:00' }
    ];

    const handleSave = () => {
        onUpdate?.({ enabled, day, time });
    };

    return (
        <div className="p-4 bg-bg-paper border-2 border-black shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-3 mb-4">
                <FaBell className="text-accent-gold" />
                <h3 className="font-heading">Resumen Semanal</h3>
            </div>

            <label className="flex items-center gap-3 mb-4">
                <input 
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-5 h-5"
                />
                <span>Recibir resumen semanal por email</span>
            </label>

            {enabled && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-text-dim block mb-1">Día</label>
                        <select
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            className="w-full p-2 border-2 border-black bg-white"
                        >
                            {days.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-text-dim block mb-1">Hora</label>
                        <select
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full p-2 border-2 border-black bg-white"
                        >
                            {times.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <button
                onClick={handleSave}
                className="mt-4 w-full py-2 bg-black text-white font-heading text-sm hover:bg-gray-800"
            >
                Guardar configuración
            </button>
        </div>
    );
}

// EcosystemSection.jsx - Muestra todas las herramientas con beneficios claros
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBolt, FaUsers, FaChartLine, FaArrowRight } from 'react-icons/fa';
import { cn } from '../../../lib/utils';

const TOOLS = [
    {
        id: 'wiki',
        icon: FaSearch,
        title: 'Nunca más te preguntes qué hace un ítem',
        subtitle: 'Wiki de Ítems',
        description: 'Todos los ítems, trinkets, píldoras y cartas de Repentance con stats y efectos detallados.',
        stats: '637 ítems',
        cta: 'Explorar ítems',
        link: '/items',
        color: 'accent-blood',
    },
    {
        id: 'bosses',
        icon: FaBolt,
        title: 'Conoce a tu enemigo antes de enfrentarlo',
        subtitle: 'Wiki de Jefes',
        description: 'Guías de todos los jefes, patrones de ataque, estrategias y requisitos de desbloqueo.',
        stats: '108 jefes',
        cta: 'Estudiar jefes',
        link: '/bosses',
        color: 'accent-gold',
    },
    {
        id: 'builds',
        icon: FaUsers,
        title: 'Roba las mejores builds de otros jugadores',
        subtitle: 'Comunidad',
        description: 'Miles de builds votadas por la comunidad. Filtra por personaje, boss o ítems clave.',
        stats: '12.453 builds',
        cta: 'Ver top builds',
        link: '/builds',
        color: 'green-500',
    },
    {
        id: 'tracker',
        icon: FaChartLine,
        title: 'Sabe exactamente qué te falta para Dead God',
        subtitle: 'Progress Tracker',
        description: 'Análisis de save file con completion marks, ítems faltantes y estimación de tiempo.',
        stats: '3.247 usuarios',
        cta: 'Analizar mi save',
        link: '#upload-zone',
        color: 'blue-500',
    },
];

const GLOBAL_STATS = [
    { value: '637', label: 'ítems documentados' },
    { value: '108', label: 'jefes detallados' },
    { value: '12.453', label: 'builds compartidas' },
    { value: '3.247', label: 'usuarios activos' },
];

export function EcosystemSection() {
    const navigate = useNavigate();

    const handleToolClick = (link) => {
        if (link.startsWith('#')) {
            const elementId = link.slice(1);
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add highlight effect
                element.classList.add('ring-4', 'ring-accent-gold', 'ring-offset-4');
                setTimeout(() => {
                    element.classList.remove('ring-4', 'ring-accent-gold', 'ring-offset-4');
                }, 2000);
            }
        } else {
            navigate(link);
        }
    };

    return (
        <section className="relative w-full px-4 md:px-8 py-16">
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="font-heading text-2xl md:text-4xl text-text-heading uppercase tracking-wider mb-3">
                        Todo lo que necesitas para dominar Isaac
                    </h2>
                    <p className="font-handwriting text-lg text-text-dim max-w-2xl mx-auto">
                        Herramientas gratuitas diseñadas por jugadores, para jugadores
                    </p>
                </motion.div>

                {/* Tools grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {TOOLS.map((tool, index) => (
                        <ToolCard 
                            key={tool.id} 
                            tool={tool} 
                            index={index}
                            onClick={() => handleToolClick(tool.link)}
                        />
                    ))}
                </div>

                {/* Global stats bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-black text-white p-6"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {GLOBAL_STATS.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <p className="font-heading text-3xl md:text-4xl text-accent-gold mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-white/60 font-handwriting">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function ToolCard({ tool, index, onClick }) {
    const colorVariants = {
        'accent-blood': {
            bg: 'hover:bg-accent-blood/5',
            icon: 'bg-accent-blood text-white',
            badge: 'bg-accent-blood/10 text-accent-blood border-accent-blood/30',
            cta: 'hover:text-accent-blood',
        },
        'accent-gold': {
            bg: 'hover:bg-accent-gold/5',
            icon: 'bg-accent-gold text-black',
            badge: 'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
            cta: 'hover:text-accent-gold',
        },
        'green-500': {
            bg: 'hover:bg-green-500/5',
            icon: 'bg-green-500 text-white',
            badge: 'bg-green-500/10 text-green-500 border-green-500/30',
            cta: 'hover:text-green-500',
        },
        'blue-500': {
            bg: 'hover:bg-blue-500/5',
            icon: 'bg-blue-500 text-white',
            badge: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
            cta: 'hover:text-blue-500',
        },
    };

    const colors = colorVariants[tool.color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, boxShadow: '8px 8px 0px #000' }}
            onClick={onClick}
            className={cn(
                "relative bg-bg-paper border-[3px] border-black shadow-[6px_6px_0px_#000] p-6 cursor-pointer transition-all",
                colors.bg
            )}
        >
            {/* Stats badge */}
            <div className="absolute top-4 right-4">
                <span className={cn(
                    "px-3 py-1 text-xs font-heading border",
                    colors.badge
                )}>
                    {tool.stats}
                </span>
            </div>

            {/* Icon */}
            <div className={cn(
                "w-14 h-14 flex items-center justify-center mb-4",
                colors.icon
            )}>
                <tool.icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <p className="text-xs text-text-dim font-handwriting uppercase tracking-wider mb-1">
                {tool.subtitle}
            </p>
            <h3 className="font-heading text-lg text-text-heading mb-3">
                {tool.title}
            </h3>
            
            <p className="text-sm text-text-dim mb-4 line-clamp-2">
                {tool.description}
            </p>

            {/* CTA */}
            <div className={cn(
                "flex items-center gap-2 font-heading text-sm uppercase text-text-heading transition-colors",
                colors.cta
            )}>
                {tool.cta}
                <FaArrowRight className="w-3 h-3" />
            </div>
        </motion.div>
    );
}

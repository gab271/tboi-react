// FinalCTASection.jsx - Cierre de conversión para usuarios que scrollearon
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaDiscord, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';

const BENEFITS = [
    'Guarda tu progreso para siempre',
    'Comparte builds con la comunidad',
    'Recibe notificaciones de logros',
    'Compara tu progreso con amigos',
];

export function FinalCTASection() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Don't show if user is already logged in
    if (user) return null;

    return (
        <section className="relative w-full px-4 md:px-8 py-16">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden"
                >
                    {/* Main card - Dark theme for contrast */}
                    <div className="relative bg-[#0c0a09] border-[3px] border-black shadow-[8px_8px_0px_#000]">
                        {/* Basement texture overlay */}
                        <div 
                            className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        />
                        
                        {/* Vignette effect */}
                        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50 pointer-events-none" />

                        {/* Blood drip decoration at top */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-accent-blood" />

                        <div className="relative p-8 md:p-12">
                            {/* Emotional headline */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-8"
                            >
                                <h2 className="font-heading text-3xl md:text-4xl text-white uppercase tracking-tight mb-4">
                                    Tu progreso no debería
                                    <br />
                                    <span className="text-accent-blood">perderse en el Void</span>
                                </h2>

                                <p className="font-handwriting text-lg md:text-xl text-white/70 max-w-lg mx-auto">
                                    Crea tu cuenta y guarda progreso, builds y logros para siempre.
                                    <span className="text-accent-gold font-bold"> Es gratis.</span>
                                </p>
                            </motion.div>

                            {/* Benefits list */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap justify-center gap-4 mb-8"
                            >
                                {BENEFITS.map((benefit, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-center gap-2 text-sm text-white/80"
                                    >
                                        <FaCheck className="w-3 h-3 text-accent-gold" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </motion.div>

                            {/* CTA buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
                            >
                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-accent-blood text-white font-heading text-lg border-2 border-white/20 shadow-[4px_4px_0px_rgba(255,255,255,0.1)] hover:bg-white hover:text-accent-blood hover:shadow-[6px_6px_0px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all"
                                >
                                    <FaEnvelope className="w-5 h-5" />
                                    Registrarme con email
                                </button>
                                <button
                                    onClick={() => navigate('/auth/discord')}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#5865F2] text-white font-heading text-lg border-2 border-white/20 shadow-[4px_4px_0px_rgba(255,255,255,0.1)] hover:bg-white hover:text-[#5865F2] hover:shadow-[6px_6px_0px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all"
                                >
                                    <FaDiscord className="w-5 h-5" />
                                    Continuar con Discord
                                </button>
                            </motion.div>

                            {/* Trust message */}
                            <div className="text-center">
                                <p className="text-sm text-white/50 mb-2">
                                    Solo necesitamos tu email. Sin spam, prometido.
                                </p>
                                <p className="text-sm text-white/50">
                                    ¿Ya tienes cuenta?{' '}
                                    <button 
                                        onClick={() => navigate('/login')}
                                        className="text-accent-gold hover:underline"
                                    >
                                        Inicia sesión
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <motion.img
                        src="/sprites/1_Passive Items/The Soul.png"
                        alt=""
                        className="absolute -top-6 -left-6 w-16 h-16 pixelated opacity-30 hidden md:block"
                        initial={{ rotate: -15 }}
                        animate={{ rotate: [-15, -10, -15], y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.img
                        src="/sprites/1_Passive Items/Godhead.png"
                        alt=""
                        className="absolute -bottom-4 -right-4 w-12 h-12 pixelated opacity-20 hidden md:block"
                        initial={{ rotate: 10 }}
                        animate={{ rotate: [10, 15, 10], y: [0, -3, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                </motion.div>
            </div>
        </section>
    );
}

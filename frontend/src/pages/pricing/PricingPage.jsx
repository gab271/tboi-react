/**
 * PricingPage
 * 
 * Página de precios con 3 tiers: FREE, PRO, SUPPORTER
 * Diseño que destaca PRO como opción recomendada
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TIERS, TIER_CONFIG } from '../../config/subscriptions';
import { useFeatures } from '../../hooks/useFeatures';
import { useAuth } from '../../hooks/useAuth';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const { userTier, isPro, isSupporter } = useFeatures();
  const { user } = useAuth();
  
  const yearlyDiscount = 33; // ~2 meses gratis
  
  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading text-white mb-4">
            Elige tu plan
          </h1>
          <p className="text-lg text-text-dim max-w-2xl mx-auto">
            De jugador casual a experto. Desbloquea herramientas que te ayudan a ganar más runs.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg font-heading transition ${
                billingCycle === 'monthly' 
                  ? 'bg-isaac-red text-white' 
                  : 'text-text-dim hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg font-heading transition relative ${
                billingCycle === 'yearly' 
                  ? 'bg-isaac-red text-white' 
                  : 'text-text-dim hover:text-white'
              }`}
            >
              Anual
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded">
                -{yearlyDiscount}%
              </span>
            </button>
          </div>
        </div>
        
        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* FREE Tier */}
          <PricingCard
            tier={TIERS.FREE}
            config={TIER_CONFIG[TIERS.FREE]}
            billingCycle={billingCycle}
            isCurrentTier={userTier === TIERS.FREE}
            user={user}
          />
          
          {/* PRO Tier - Featured */}
          <PricingCard
            tier={TIERS.PRO}
            config={TIER_CONFIG[TIERS.PRO]}
            billingCycle={billingCycle}
            isCurrentTier={userTier === TIERS.PRO}
            isFeatured={true}
            user={user}
          />
          
          {/* SUPPORTER Tier */}
          <PricingCard
            tier={TIERS.SUPPORTER}
            config={TIER_CONFIG[TIERS.SUPPORTER]}
            billingCycle={billingCycle}
            isCurrentTier={userTier === TIERS.SUPPORTER}
            user={user}
          />
        </div>
        
        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-heading text-white text-center mb-8">
            Preguntas frecuentes
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FAQ 
              question="¿Puedo cancelar en cualquier momento?"
              answer="Sí, puedes cancelar tu suscripción cuando quieras. Mantendrás acceso hasta el final del período pagado."
            />
            <FAQ 
              question="¿Qué métodos de pago aceptan?"
              answer="Aceptamos tarjetas de crédito/débito, PayPal y Apple Pay a través de Stripe."
            />
            <FAQ 
              question="¿Qué pasa si ya soy PRO y quiero SUPPORTER?"
              answer="Solo pagarás la diferencia. Tu crédito restante se aplica automáticamente."
            />
            <FAQ 
              question="¿Los datos de mi save son privados?"
              answer="Absolutamente. Tus archivos de save se procesan y se eliminan inmediatamente. No almacenamos tus saves."
            />
          </div>
        </div>
        
        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-text-dim text-sm">
          <span className="flex items-center gap-2">
            <span>🔒</span> Pago seguro con Stripe
          </span>
          <span className="flex items-center gap-2">
            <span>↩️</span> Garantía de reembolso 7 días
          </span>
          <span className="flex items-center gap-2">
            <span>🚫</span> Sin compromisos
          </span>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ tier, config, billingCycle, isCurrentTier, isFeatured, user }) {
  const price = billingCycle === 'yearly' 
    ? (config.yearlyPrice || config.price * 12 * 0.67) / 12 
    : config.price;
    
  const totalPrice = billingCycle === 'yearly'
    ? config.yearlyPrice || config.price * 12 * 0.67
    : config.price;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl p-6 ${
        isFeatured 
          ? 'bg-gradient-to-b from-amber-500/10 to-surface-raised border-2 border-amber-500/50 scale-105 shadow-xl shadow-amber-500/10' 
          : 'bg-surface-raised border border-border'
      }`}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-heading rounded-full">
          Más popular
        </div>
      )}
      
      {/* Current tier badge */}
      {isCurrentTier && (
        <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-heading rounded-full">
          Tu plan actual
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          {config.badge && (
            <span className="text-2xl">{config.badge.icon}</span>
          )}
          <h3 
            className="text-2xl font-heading"
            style={{ color: config.color || '#fff' }}
          >
            {config.name}
          </h3>
        </div>
        
        {/* Price */}
        <div className="mt-4">
          {config.price === 0 ? (
            <span className="text-4xl font-heading text-white">Gratis</span>
          ) : (
            <>
              <span className="text-4xl font-heading text-white">
                €{price.toFixed(2)}
              </span>
              <span className="text-text-dim">/mes</span>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-text-dim mt-1">
                  €{totalPrice.toFixed(2)} facturado anualmente
                </p>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Features */}
      <ul className="space-y-3 mb-8">
        {getDisplayFeatures(tier).map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={feature.included ? 'text-green-500' : 'text-text-dim'}>
              {feature.included ? '✓' : '—'}
            </span>
            <span className={feature.included ? 'text-text' : 'text-text-dim'}>
              {feature.label}
              {feature.isNew && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                  Nuevo
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      
      {/* CTA */}
      {isCurrentTier ? (
        <button 
          disabled
          className="w-full py-3 bg-green-500/20 text-green-400 font-heading rounded-lg cursor-default"
        >
          Plan actual
        </button>
      ) : tier === TIERS.FREE ? (
        <Link
          to={user ? '/' : '/auth/login'}
          className="block w-full py-3 bg-surface text-text-dim font-heading text-center rounded-lg border border-border hover:border-white/30 transition"
        >
          {user ? 'Ya tienes acceso' : 'Crear cuenta gratis'}
        </Link>
      ) : (
        <button
          onClick={() => handleSubscribe(tier, billingCycle)}
          className={`w-full py-3 font-heading text-center rounded-lg transition ${
            isFeatured
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/20'
              : 'bg-isaac-red text-white hover:bg-isaac-red/80'
          }`}
        >
          {user ? 'Actualizar ahora' : 'Empezar'}
        </button>
      )}
    </motion.div>
  );
}

function FAQ({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="bg-surface-raised rounded-lg border border-border overflow-hidden cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between p-4">
        <h3 className="font-heading text-white">{question}</h3>
        <span className={`text-text-dim transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>
      
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <p className="px-4 pb-4 text-text-dim">{answer}</p>
      </motion.div>
    </div>
  );
}

// Helper: Get display-friendly feature list for each tier
function getDisplayFeatures(tier) {
  const allFeatures = [
    { key: 'browse', label: 'Navegar items, bosses y personajes', all: true },
    { key: 'search', label: 'Búsqueda completa', all: true },
    { key: 'saves', label: 'Analizar archivos de save', all: true },
    { key: 'synergy_basic', label: 'Ver sinergias básicas', all: true },
    { key: 'synergy_full', label: 'Explicaciones de sinergias detalladas', tiers: [TIERS.PRO, TIERS.SUPPORTER], isNew: true },
    { key: 'optimal_path', label: 'Camino óptimo sugerido', tiers: [TIERS.PRO, TIERS.SUPPORTER], isNew: true },
    { key: 'synergy_suggestions', label: 'Sugerencias de items', tiers: [TIERS.PRO, TIERS.SUPPORTER] },
    { key: 'builds_unlimited', label: 'Builds ilimitadas', tiers: [TIERS.PRO, TIERS.SUPPORTER] },
    { key: 'favorites_unlimited', label: 'Favoritos ilimitados', tiers: [TIERS.PRO, TIERS.SUPPORTER] },
    { key: 'no_ads', label: 'Sin anuncios', tiers: [TIERS.PRO, TIERS.SUPPORTER] },
    { key: 'profile_customization', label: 'Personalización de perfil', tiers: [TIERS.SUPPORTER] },
    { key: 'profile_badge', label: 'Badge exclusivo de Supporter', tiers: [TIERS.SUPPORTER] },
    { key: 'early_access', label: 'Acceso anticipado a nuevas features', tiers: [TIERS.SUPPORTER] },
    { key: 'priority_support', label: 'Soporte prioritario', tiers: [TIERS.SUPPORTER] },
  ];
  
  return allFeatures.map(f => ({
    ...f,
    included: f.all || (f.tiers && f.tiers.includes(tier))
  }));
}

// Placeholder for Stripe checkout
async function handleSubscribe(tier, billingCycle) {
  // TODO: Implement Stripe checkout
  console.log('Subscribe to', tier, billingCycle);
  alert('Stripe checkout coming soon! For now, contact support@tboi-codex.com');
}

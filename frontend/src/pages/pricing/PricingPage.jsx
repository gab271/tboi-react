/**
 * PricingPage
 * 
 * Pricing page with 3 tiers: FREE, PRO, SUPPORTER
 * Design that highlights PRO as recommended option
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TIERS, TIER_CONFIG } from '../../config/subscriptions';
import { useFeatures } from '../../hooks/useFeatures';
import { useAuth } from '../../hooks/useAuth';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const { userTier, isPro, isSupporter } = useFeatures();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const yearlyDiscount = 33; // ~2 months free
  
  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading text-white mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-text-dim max-w-2xl mx-auto">
            {t('pricing.subtitle')}
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
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg font-heading transition relative ${
                billingCycle === 'yearly' 
                  ? 'bg-isaac-red text-white' 
                  : 'text-text-dim hover:text-white'
              }`}
            >
              {t('pricing.yearly')}
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
            t={t}
          />
          
          {/* PRO Tier - Featured */}
          <PricingCard
            tier={TIERS.PRO}
            config={TIER_CONFIG[TIERS.PRO]}
            billingCycle={billingCycle}
            isCurrentTier={userTier === TIERS.PRO}
            isFeatured={true}
            user={user}
            t={t}
          />
          
          {/* SUPPORTER Tier */}
          <PricingCard
            tier={TIERS.SUPPORTER}
            config={TIER_CONFIG[TIERS.SUPPORTER]}
            billingCycle={billingCycle}
            isCurrentTier={userTier === TIERS.SUPPORTER}
            user={user}
            t={t}
          />
        </div>
        
        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-heading text-white text-center mb-8">
            {t('pricing.faq')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FAQ 
              question={t('pricing.faqCancel')}
              answer={t('pricing.faqCancelAnswer')}
            />
            <FAQ 
              question={t('pricing.faqPayment')}
              answer={t('pricing.faqPaymentAnswer')}
            />
            <FAQ 
              question={t('pricing.faqUpgrade')}
              answer={t('pricing.faqUpgradeAnswer')}
            />
            <FAQ 
              question={t('pricing.faqPrivacy')}
              answer={t('pricing.faqPrivacyAnswer')}
            />
          </div>
        </div>
        
        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-text-dim text-sm">
          <span className="flex items-center gap-2">
            <span>🔒</span> {t('pricing.securePayment')}
          </span>
          <span className="flex items-center gap-2">
            <span>↩️</span> {t('pricing.moneyBackGuarantee')}
          </span>
          <span className="flex items-center gap-2">
            <span>🚫</span> {t('pricing.noCommitments')}
          </span>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ tier, config, billingCycle, isCurrentTier, isFeatured, user, t }) {
  const navigate = useNavigate();
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
          {t('pricing.mostPopular')}
        </div>
      )}
      
      {/* Current tier badge */}
      {isCurrentTier && (
        <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-heading rounded-full">
          {t('pricing.currentPlan')}
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
            <span className="text-4xl font-heading text-white">{t('pricing.free')}</span>
          ) : (
            <>
              <span className="text-4xl font-heading text-white">
                €{price.toFixed(2)}
              </span>
              <span className="text-text-dim">{t('pricing.perMonth')}</span>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-text-dim mt-1">
                  {t('pricing.billedAnnually', { total: totalPrice.toFixed(2) })}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Features */}
      <ul className="space-y-3 mb-8">
        {getDisplayFeatures(tier, t).map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={feature.included ? 'text-green-500' : 'text-text-dim'}>
              {feature.included ? '✓' : '—'}
            </span>
            <span className={feature.included ? 'text-text' : 'text-text-dim'}>
              {feature.label}
              {feature.isNew && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                  {t('pricing.features.new')}
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
          {t('pricing.currentPlanButton')}
        </button>
      ) : tier === TIERS.FREE ? (
        <Link
          to={user ? '/' : '/login'}
          className="block w-full py-3 bg-surface text-text-dim font-heading text-center rounded-lg border border-border hover:border-white/30 transition"
        >
          {user ? t('pricing.alreadyHaveAccess') : t('pricing.createFreeAccount')}
        </Link>
      ) : (
        <button
          onClick={() => {
            if (!user) {
              navigate('/login');
              return;
            }
            handleSubscribe(tier, billingCycle, t);
          }}
          className={`w-full py-3 font-heading text-center rounded-lg transition ${
            isFeatured
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/20'
              : 'bg-isaac-red text-white hover:bg-isaac-red/80'
          }`}
        >
          {user ? t('pricing.upgradeNow') : t('pricing.start')}
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
function getDisplayFeatures(tier, t) {
  const allFeatures = [
    { key: 'browse', label: t('pricing.features.browse'), all: true },
    { key: 'search', label: t('pricing.features.search'), all: true },
    { key: 'saves', label: t('pricing.features.saves'), all: true },
    { key: 'synergy_basic', label: t('pricing.features.synergyBasic'), all: true },
    { key: 'synergy_full', label: t('pricing.features.synergyFull'), tiers: [TIERS.PRO, TIERS.SUPPORTER], isNew: true },
    { key: 'optimal_path', label: t('pricing.features.optimalPath'), tiers: [TIERS.PRO, TIERS.SUPPORTER], isNew: true },
    { key: 'synergy_suggestions', label: t('pricing.features.synergySuggestions'), tiers: [TIERS.PRO, TIERS.SUPPORTER] },
    { key: 'builds_unlimited', label: t('pricing.features.buildsUnlimited'), tiers: [TIERS.PRO, TIERS.SUPPORTER] },
    { key: 'favorites_unlimited', label: t('pricing.features.favoritesUnlimited'), tiers: [TIERS.PRO, TIERS.SUPPORTER] },
    { key: 'no_ads', label: t('pricing.features.noAds'), tiers: [TIERS.PRO, TIERS.SUPPORTER] },
    { key: 'profile_customization', label: t('pricing.features.profileCustomization'), tiers: [TIERS.SUPPORTER] },
    { key: 'profile_badge', label: t('pricing.features.profileBadge'), tiers: [TIERS.SUPPORTER] },
    { key: 'early_access', label: t('pricing.features.earlyAccess'), tiers: [TIERS.SUPPORTER] },
    { key: 'priority_support', label: t('pricing.features.prioritySupport'), tiers: [TIERS.SUPPORTER] },
  ];
  
  return allFeatures.map(f => ({
    ...f,
    included: f.all || (f.tiers && f.tiers.includes(tier))
  }));
}

// Placeholder for Stripe checkout
async function handleSubscribe(tier, billingCycle, t) {
  // TODO: Implement Stripe checkout
  console.log('Subscribe to', tier, billingCycle);
  alert(t('pricing.stripeComingSoon'));
}

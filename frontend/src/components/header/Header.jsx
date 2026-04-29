import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { 
  FaSearch, FaUserCircle, FaSignOutAlt, FaHeart, FaBars, FaTimes, 
  FaChevronDown, FaCrown, FaCompass, FaPuzzlePiece
} from 'react-icons/fa';
import { CommandPalette } from '../layout/CommandPalette';
import { useAuth } from '../../hooks/useAuth';
import { useFeatures } from '../../hooks/useFeatures';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../ui/DropdownMenu';
import { supabase } from '../../lib/supabaseClient';
import { useIsAdmin } from '../../hooks/useAdmin';
import LanguageSwitcher from './LanguageSwitcher';
import './Header.css';

/**
 * Header - TBOI Codex
 * 
 * Estructura de 3 bloques:
 * A) Izquierda: Logo + Nav (Explorar, Synergies)
 * B) Centro: Search (flexible)
 * C) Derecha: My Progress + Utils (Lang, Profile)
 * 
 * Jerarquía visual:
 * L1 - Primary: My Progress (700 weight, ink color)
 * L2 - Secondary: Nav items (500 weight, secondary color)
 * L3 - Utility: Search, Lang, Profile (400 weight, dim color)
 */
function Header() {
  const { t } = useTranslation();
  const [showCmd, setShowCmd] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, signOut } = useAuth();
  const { isPro, isSupporter, userBadge } = useFeatures();
  const [profile, setProfile] = useState(null);
  const isAdmin = useIsAdmin();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single();
      if (!ignore && data) {
         if (data.avatar_url) {
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.avatar_url);
            setProfile({ ...data, avatarUrl: publicUrl });
         } else {
            setProfile(data);
         }
      }
    }
    getProfile();
    return () => { ignore = true; };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isHomePage = location.pathname === '/';

  return (
    <>
      <header className="header">
        <div className="header-container">
          
          {/* ========== BLOQUE A: Logo + Nav ========== */}
          <div className="header-left">
            {/* Logo */}
            <NavLink to="/" className="header-logo group">
              <div className="logo-text font-heading text-lg sm:text-xl tracking-tight leading-none">
                <span className="text-text-ink font-extrabold">TBOI</span>
                <span className="text-accent-blood font-extrabold">CODEX</span>
              </div>
            </NavLink>

            {/* Desktop Nav - Explorar + Synergies */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Explorar Dropdown */}
              <ExploreDropdown t={t} />
              
              {/* Synergies (destacado con PRO) */}
              <NavLink
                to="/synergies"
                className={({ isActive }) => cn(
                  "nav-secondary font-heading relative",
                  isActive && "text-accent-blood font-semibold"
                )}
                data-active={location.pathname === '/synergies'}
              >
                <FaPuzzlePiece className="w-3.5 h-3.5" />
                <span>{t('nav.synergies')}</span>
                <span className="badge-pro">PRO</span>
              </NavLink>
            </nav>
          </div>

          {/* ========== BLOQUE B: Search (Centro) ========== */}
          <div className="header-center">
            <button 
              onClick={() => setShowCmd(true)}
              className="search-trigger group"
              aria-label={t('accessibility.search')}
            >
              <FaSearch className="w-3.5 h-3.5 text-text-dim group-hover:text-text-secondary transition-colors" />
              <span className="hidden md:inline text-[13px] text-text-dim">{t('search.placeholder')}</span>
              <kbd className="hidden xl:inline-flex px-1.5 py-0.5 text-[10px] text-text-disabled bg-bg-paper rounded border border-border-light ml-auto">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* ========== BLOQUE C: Actions (Derecha) ========== */}
          <div className="header-right">
            
            {/* Separador visual */}
            <div className="header-separator hidden lg:block" />
            
            {/* My Progress - SIEMPRE visible (acción principal) */}
            <NavLink
              to="/progress"
              className={({ isActive }) => cn(
                "nav-primary font-heading hidden sm:flex",
                isActive && "text-accent-blood bg-accent-blood/10"
              )}
            >
              <span>{t('nav.myProgress')}</span>
            </NavLink>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Menu / Auth */}
            {user ? (
              <UserMenu 
                user={user}
                profile={profile}
                isPro={isPro}
                isSupporter={isSupporter}
                isAdmin={isAdmin}
                navigate={navigate}
                handleLogout={handleLogout}
                t={t}
              />
            ) : (
              <div className="auth-buttons">
                <button 
                  onClick={() => navigate('/login')}
                  className="btn-login hidden sm:block font-heading"
                >
                  {t('nav.login')}
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="btn-register font-heading"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-toggle lg:hidden"
              aria-label={t('accessibility.toggleMenu')}
            >
              {mobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ========== MOBILE MENU ========== */}
        <MobileMenu 
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          user={user}
          profile={profile}
          isPro={isPro}
          isSupporter={isSupporter}
          isAdmin={isAdmin}
          navigate={navigate}
          handleLogout={handleLogout}
          t={t}
        />
      </header>

      <CommandPalette open={showCmd} onOpenChange={setShowCmd} />
    </>
  );
}

// ============================================
// SUBCOMPONENTES
// ============================================

// Dropdown "Explorar" - agrupa Wiki + Community
function ExploreDropdown({ t }) {
  const location = useLocation();
  const explorePaths = ['/items', '/bosses', '/characters', '/builds'];
  const isExploreActive = explorePaths.some(path => location.pathname.startsWith(path));

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button 
          type="button"
          className={cn(
            "nav-secondary font-heading",
            isExploreActive && "text-accent-blood font-semibold"
          )}
          data-active={isExploreActive}
        >
          <FaCompass className="w-3.5 h-3.5" />
          <span>{t('nav.explore', 'Explorar')}</span>
          <FaChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start"
        sideOffset={8}
        className="dropdown-content bg-bg-paper border-2 border-border min-w-[200px] shadow-lg p-1"
      >
        {/* Wiki Section */}
        <div className="px-2 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-text-dim font-heading">
            {t('nav.wiki', 'Wiki')}
          </span>
        </div>
        <DropdownMenuItem asChild>
          <NavLink to="/items" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bg-paper-dark cursor-pointer text-[13px]">
            <span className="font-heading text-text-ink">{t('nav.items')}</span>
          </NavLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <NavLink to="/bosses" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bg-paper-dark cursor-pointer text-[13px]">
            <span className="font-heading text-text-ink">{t('nav.bosses')}</span>
          </NavLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <NavLink to="/characters" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bg-paper-dark cursor-pointer text-[13px]">
            <span className="font-heading text-text-ink">{t('nav.characters')}</span>
          </NavLink>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1" />
        
        {/* Community Section */}
        <div className="px-2 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-text-dim font-heading">
            {t('nav.community')}
          </span>
        </div>
        <DropdownMenuItem asChild>
          <NavLink to="/builds" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bg-paper-dark cursor-pointer text-[13px]">
            <span className="font-heading text-text-ink">{t('nav.builds')}</span>
          </NavLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// User Menu (logged in)
function UserMenu({ user, profile, isPro, isSupporter, isAdmin, navigate, handleLogout, t }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="avatar-trigger">
          <div className="avatar-img">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <FaUserCircle className="w-full h-full text-text-dim" />
            )}
          </div>
          <FaChevronDown className="w-2.5 h-2.5 text-text-dim hidden lg:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="dropdown-content bg-bg-paper border-2 border-border min-w-[180px] shadow-lg p-1"
      >
        {/* User info */}
        <div className="px-3 py-2 border-b border-border-light mb-1">
          <p className="font-heading text-[13px] text-text-ink truncate max-w-[150px]">
            {profile?.username || t('profile.user')}
          </p>
          {isPro && (
            <span className="text-[11px] text-accent-gold font-bold">
              {isSupporter ? `❤️ ${t('common.supporter')}` : `⚡ ${t('common.pro')}`}
            </span>
          )}
        </div>
        
        <DropdownMenuItem 
          onClick={() => navigate('/favorites')} 
          className="flex items-center gap-2 px-3 py-2 rounded text-[13px] text-text-secondary hover:text-text-ink hover:bg-bg-paper-dark cursor-pointer"
        >
          <FaHeart className="w-3.5 h-3.5" /> {t('nav.favorites')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/account')} 
          className="flex items-center gap-2 px-3 py-2 rounded text-[13px] text-text-secondary hover:text-text-ink hover:bg-bg-paper-dark cursor-pointer"
        >
          <FaUserCircle className="w-3.5 h-3.5" /> {t('nav.account')}
        </DropdownMenuItem>
        
        {!isPro && (
          <DropdownMenuItem 
            onClick={() => navigate('/pricing')} 
            className="flex items-center gap-2 px-3 py-2 rounded text-[13px] text-accent-gold hover:bg-accent-gold/10 cursor-pointer font-bold"
          >
            <FaCrown className="w-3.5 h-3.5" /> {t('nav.upgradeToPro')}
          </DropdownMenuItem>
        )}
        
        {isAdmin && (
          <DropdownMenuItem 
            onClick={() => navigate('/admin')} 
            className="flex items-center gap-2 px-3 py-2 rounded text-[13px] text-text-secondary hover:text-text-ink hover:bg-bg-paper-dark cursor-pointer"
          >
            {t('nav.admin')}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className="my-1" />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="flex items-center gap-2 px-3 py-2 rounded text-[13px] text-accent-blood hover:bg-accent-blood/10 cursor-pointer font-bold"
        >
          <FaSignOutAlt className="w-3.5 h-3.5" /> {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile Menu
function MobileMenu({ isOpen, onClose, user, profile, isPro, isSupporter, isAdmin, navigate, handleLogout, t }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[80] lg:hidden"
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed top-0 right-0 h-full w-[280px] bg-bg-paper z-[90] lg:hidden overflow-y-auto shadow-xl"
          >
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-ink"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            <div className="flex flex-col p-5 pt-14 min-h-full">
              {/* User section */}
              {user && (
                <div className="flex items-center gap-3 pb-5 mb-5 border-b border-border-light">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-border-light flex-shrink-0">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FaUserCircle className="w-full h-full text-text-dim" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading text-[13px] text-text-ink truncate">{profile?.username}</p>
                    {isPro && (
                      <span className="text-[11px] text-accent-gold font-bold">
                        {isSupporter ? `❤️ ${t('common.supporter')}` : `⚡ ${t('common.pro')}`}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex flex-col gap-0.5">
                {/* Primary Action */}
                <MobileNavItem to="/progress" label={t('nav.myProgress')} onClick={onClose} primary />
                
                <div className="h-3" />
                
                {/* Synergies */}
                <MobileNavItem to="/synergies" label={t('nav.synergies')} onClick={onClose} badge="PRO" />
                
                {/* Wiki Section */}
                <div className="mt-4 mb-1.5">
                  <span className="text-[10px] text-text-dim uppercase tracking-wider font-heading px-3">
                    {t('nav.wiki')}
                  </span>
                </div>
                <MobileNavItem to="/items" label={t('nav.items')} onClick={onClose} />
                <MobileNavItem to="/bosses" label={t('nav.bosses')} onClick={onClose} />
                <MobileNavItem to="/characters" label={t('nav.characters')} onClick={onClose} />
                
                {/* Community Section */}
                <div className="mt-4 mb-1.5">
                  <span className="text-[10px] text-text-dim uppercase tracking-wider font-heading px-3">
                    {t('nav.community')}
                  </span>
                </div>
                <MobileNavItem to="/builds" label={t('nav.builds')} onClick={onClose} />
                
                {/* User Section */}
                {user && (
                  <>
                    <div className="mt-4 mb-1.5">
                      <span className="text-[10px] text-text-dim uppercase tracking-wider font-heading px-3">
                        {t('nav.account', 'Mi cuenta')}
                      </span>
                    </div>
                    <MobileNavItem to="/favorites" label={t('nav.favorites')} onClick={onClose} icon={<FaHeart className="w-4 h-4" />} />
                    <MobileNavItem to="/account" label={t('nav.account')} onClick={onClose} icon={<FaUserCircle className="w-4 h-4" />} />
                    {isAdmin && (
                      <MobileNavItem to="/admin" label={t('nav.admin')} onClick={onClose} />
                    )}
                  </>
                )}
              </nav>

              {/* Bottom actions */}
              <div className="mt-auto pt-5 border-t border-border-light">
                {!isPro && (
                  <Button
                    onClick={() => { navigate('/pricing'); onClose(); }}
                    className="w-full mb-2.5 bg-accent-gold hover:bg-accent-gold/80 text-text-ink font-heading font-bold text-[13px] h-10"
                  >
                    <FaCrown className="mr-2 w-4 h-4" /> {t('nav.upgradeToPro')}
                  </Button>
                )}
                
                {user ? (
                  <Button
                    onClick={() => { handleLogout(); onClose(); }}
                    variant="ghost"
                    className="w-full text-accent-blood hover:bg-accent-blood/10 font-heading text-[13px] h-10"
                  >
                    <FaSignOutAlt className="mr-2 w-4 h-4" /> {t('nav.logout')}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => { navigate('/login'); onClose(); }}
                      variant="ghost"
                      className="w-full text-text-secondary font-heading text-[13px] h-10"
                    >
                      {t('nav.login')}
                    </Button>
                    <Button
                      onClick={() => { navigate('/register'); onClose(); }}
                      className="w-full bg-accent-blood hover:bg-accent-blood-dark text-white font-heading font-bold text-[13px] h-10"
                    >
                      {t('nav.register')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile nav item
function MobileNavItem({ to, label, onClick, icon, badge, primary }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors font-heading text-[13px]",
        primary && "font-bold text-text-ink",
        isActive 
          ? "bg-accent-blood/10 text-accent-blood font-semibold" 
          : !primary && "text-text-secondary hover:text-text-ink hover:bg-bg-paper-dark"
      )}
    >
      {icon && <span className="text-text-dim flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
      {badge && (
        <span className="badge-pro ml-auto flex-shrink-0">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default Header;
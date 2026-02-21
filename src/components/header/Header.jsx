import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { FaSearch, FaUserCircle, FaSignOutAlt, FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import { CommandPalette } from '../layout/CommandPalette';
import { useAuth } from '../../hooks/useAuth';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../ui/DropdownMenu';
import { supabase } from '../../lib/supabaseClient';
import { useIsAdmin } from '../../hooks/useAdmin';
import LanguageSwitcher from './LanguageSwitcher';

function Header() {
  const { t } = useTranslation();
  const [showCmd, setShowCmd] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const isAdmin = useIsAdmin();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

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
  }

  const NavItem = ({ to, label, onClick }) => (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => cn(
        "font-pixel text-xl sm:text-2xl tracking-widest text-text-heading transition-all duration-200 uppercase transform",
        isActive ? "text-accent-blood scale-110 rotate-1" : "hover:text-accent-blood hover:animate-wiggle"
      )}
    >
      {label}
    </NavLink>
  );

  return (
    <>
      <header className="relative w-full z-50 pt-4 sm:pt-8 pb-4 sm:pb-6 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between lg:grid lg:grid-cols-[1fr_2fr_1fr] lg:gap-4">
            
            {/* Left: Logo */}
            <div className="flex justify-start">
                <NavLink to="/" className="group relative block transform transition-transform hover:-rotate-2 hover:scale-105">
                     <div className="font-heading text-2xl sm:text-4xl text-black drop-shadow-[2px_2px_0_rgba(255,255,255,1)] tracking-tighter leading-none">
                        TBOI<br/>
                        <span className="text-accent-blood block mt-1">CODEX</span>
                     </div>
                     {/* Rough scribble under logo */}
                     <svg className="absolute -bottom-4 -left-4 w-[120%] h-6 text-black opacity-80 group-hover:scale-x-110 transition-transform hidden sm:block" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0 5 Q 20 8 40 4 T 80 6 T 100 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                     </svg>
                </NavLink>
            </div>

            {/* Center: Navigation - Desktop */}
            <nav className="hidden lg:flex items-center justify-center gap-8 xl:gap-16">
                <NavItem to="/items" label={t('nav.items')} />
                <NavItem to="/bosses" label={t('nav.bosses')} />
                <NavItem to="/characters" label={t('nav.characters')} />
                <NavItem to="/builds" label={t('nav.builds')} />
            </nav>

            {/* Right: Tools (Search, Favs, Login) - Desktop */}
            <div className="hidden lg:flex items-center justify-end gap-4 xl:gap-6 pr-4">
                {/* Search Bar (Game Input Style) */}
                <div 
                    className="cursor-pointer group relative flex items-center bg-black border-[3px] border-white/90 rounded-none px-3 py-2 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] rotate-1 hover:rotate-0 transition-all hover:scale-105 w-auto xl:w-48 justify-between"
                    onClick={() => setShowCmd(true)}
                >
                    <span className="font-pixel text-white text-lg xl:text-xl tracking-wider opacity-90 hidden xl:block">SEARCH</span>
                    <FaSearch className="text-white w-4 h-4 group-hover:text-accent-blood transition-colors" />
                </div>

                {/* Favorites */}
                {user && (
                    <NavLink to="/favorites">
                        <Button variant="ghost" className="relative p-2 group hover:scale-110 transition-transform">
                             <FaHeart className="w-6 h-6 xl:w-7 xl:h-7 text-black drop-shadow-sm group-hover:text-accent-blood group-hover:animate-pulse transition-colors" />
                        </Button>
                    </NavLink>
                )}

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Login / Profile */}
                {user ? (
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="p-0.5 rounded-full border-2 border-black overflow-hidden w-10 h-10 hover:ring-2 ring-accent-blood transition-all shadow-sm">
                             {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                             ) : (
                                <FaUserCircle className="w-full h-full text-black" />
                             )}
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="bg-bg-paper border-2 border-black font-handwriting min-w-[200px]">
                           {isAdmin && (
                               <DropdownMenuItem onClick={() => navigate('/admin')}>
                                   {t('nav.admin')}
                               </DropdownMenuItem>
                           )}
                           <DropdownMenuItem onClick={() => navigate('/account')}>
                               {t('nav.account')}
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={handleLogout} className="text-accent-blood font-bold">
                               <FaSignOutAlt className="mr-2" /> {t('nav.logout')}
                           </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button 
                        onClick={() => navigate('/login')}
                        className="font-handwriting text-lg xl:text-xl font-bold bg-transparent border-[3px] border-black text-black hover:bg-black hover:text-white transition-all px-4 xl:px-6 py-1 transform hover:-rotate-2"
                        style={{
                            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' // Hand-drawn border radius
                        }}
                    >
                        {t('nav.login')}
                    </Button>
                )}
            </div>

            {/* Mobile: Right side actions */}
            <div className="flex lg:hidden items-center gap-3">
                {/* Mobile Search */}
                <button 
                    onClick={() => setShowCmd(true)}
                    className="p-2 text-black hover:text-accent-blood transition-colors"
                >
                    <FaSearch className="w-5 h-5" />
                </button>
                
                {/* Language Switcher - Mobile */}
                <LanguageSwitcher />

                {/* Mobile Hamburger Menu */}
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-black hover:text-accent-blood transition-colors z-[100]"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
                </button>
            </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
            className={cn(
                "fixed inset-0 bg-black/50 z-[80] lg:hidden transition-opacity duration-300",
                mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile Menu Panel */}
        <div 
            className={cn(
                "fixed top-0 right-0 h-full w-[280px] bg-bg-paper z-[90] lg:hidden transform transition-transform duration-300 ease-out shadow-xl",
                mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
        >
            <div className="flex flex-col h-full pt-20 pb-8 px-6">
                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-6 mb-8">
                    <NavItem to="/items" label={t('nav.items')} onClick={() => setMobileMenuOpen(false)} />
                    <NavItem to="/bosses" label={t('nav.bosses')} onClick={() => setMobileMenuOpen(false)} />
                    <NavItem to="/characters" label={t('nav.characters')} onClick={() => setMobileMenuOpen(false)} />
                    <NavItem to="/builds" label={t('nav.builds')} onClick={() => setMobileMenuOpen(false)} />
                </nav>

                <div className="h-px w-full bg-black/20 my-4" />

                {/* Mobile User Section */}
                <div className="flex flex-col gap-4">
                    {user && (
                        <NavLink 
                            to="/favorites" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 font-pixel text-lg text-text-heading hover:text-accent-blood transition-colors"
                        >
                            <FaHeart className="w-5 h-5" />
                            {t('nav.favorites')}
                        </NavLink>
                    )}
                    
                    {user ? (
                        <>
                            <NavLink 
                                to="/account" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 font-pixel text-lg text-text-heading hover:text-accent-blood transition-colors"
                            >
                                <FaUserCircle className="w-5 h-5" />
                                {t('nav.account')}
                            </NavLink>
                            {isAdmin && (
                                <NavLink 
                                    to="/admin" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 font-pixel text-lg text-text-heading hover:text-accent-blood transition-colors"
                                >
                                    {t('nav.admin')}
                                </NavLink>
                            )}
                            <button 
                                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                className="flex items-center gap-3 font-pixel text-lg text-accent-blood hover:text-red-800 transition-colors"
                            >
                                <FaSignOutAlt className="w-5 h-5" />
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <Button 
                            onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                            className="font-handwriting text-xl font-bold bg-transparent border-[3px] border-black text-black hover:bg-black hover:text-white transition-all px-6 py-2 w-full"
                            style={{
                                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
                            }}
                        >
                            {t('nav.login')}
                        </Button>
                    )}
                </div>
            </div>
        </div>

        {/* Irregular bottom border (SVG Divider) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none select-none pointer-events-none translate-y-1/2 z-0 hidden sm:block">
            <svg 
               viewBox="0 0 1200 20" 
               preserveAspectRatio="none" 
               className="w-full h-6 text-black opacity-60"
            >
                <path d="M0,10 Q 300,18 600,10 T 1200,10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" strokeLinecap="round" />
            </svg>
        </div>
      </header>

      <CommandPalette open={showCmd} onOpenChange={setShowCmd} />
    </>
  )
}

export default Header
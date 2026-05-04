import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { FaSearch, FaSignOutAlt, FaHeart, FaBars, FaTimes } from 'react-icons/fa'
import { CommandPalette } from './CommandPalette'
import { useAuth } from '../../hooks/useAuth';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../ui/DropdownMenu'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { supabase } from '../../lib/supabaseClient'
import { useIsAdmin } from '../../hooks/useAdmin'

export function Navbar() {
  const { t } = useTranslation()
  const [showCmd, setShowCmd] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const isAdmin = useIsAdmin();

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

  const links = [
    { name: t('nav.items'), path: '/items' },
    { name: t('nav.bosses'), path: '/bosses' },
    { name: t('nav.characters'), path: '/characters' },
    { name: t('nav.builds'), path: '/builds' },
    { name: t('nav.tierlist', 'Tier List'), path: '/tierlist' },
  ]

  return (
    <>
      <CommandPalette open={showCmd} onOpenChange={setShowCmd} />

      <nav className="w-full mb-6 border-b-[3px] border-text-ink pb-4 relative">
        <div className="flex flex-row items-center justify-between gap-4">
            
            {/* Logo / Title Area */}
            <NavLink to="/" className="group z-50">
                <h1 className="text-3xl md:text-5xl font-heading text-text-heading wiggle inline-block relative">
                TBOI <span className="text-accent-blood">Codex</span>
                {/* Sketchy Underline */}
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-text-ink" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                </h1>
            </NavLink>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6 font-handwriting text-2xl">
            {links.map(link => (
                <NavLink 
                    key={link.path} 
                    to={link.path}
                    className={({ isActive }) => cn(
                        "relative px-2 transition-transform font-bold group",
                        isActive ? "text-accent-blood scale-110 -rotate-2" : "text-text-ink hover:text-accent-blood hover:scale-105"
                    )}
                >
                    {({ isActive }) => (
                        <>
                        {link.name}
                        {/* Shaky Hand-drawn Underline on Hover/Active */}
                        <svg className={cn(
                            "absolute -bottom-2 left-0 w-full h-2 text-current transition-opacity",
                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )} viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q25,8 50,5 T100,6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        </>
                    )}
                </NavLink>
            ))}
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
                className="md:hidden z-50 text-2xl p-2" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-bg-paper flex flex-col items-center justify-center gap-8 md:hidden">
                <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
                {links.map(link => (
                    <NavLink 
                        key={link.path} 
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) => cn(
                            "font-heading text-3xl uppercase tracking-widest",
                            isActive ? "text-accent-blood border-b-4 border-accent-blood" : "text-text-ink"
                        )}
                    >
                        {link.name}
                    </NavLink>
                ))}
            </div>
        )}


        {/* Actions (Search, Favorites, User) */}
        <div className="flex items-center gap-4">
           
           {/* Search Bar - 'Markers' Style */}
           <button 
                onClick={() => setShowCmd(true)} 
                className="hidden md:flex items-center gap-2 border-b-2 border-text-ink/80 px-2 py-1 text-text-ink/60 hover:text-text-ink hover:border-accent-blood transition-colors group"
                title="Search"
           >
               <FaSearch className="w-4 h-4" />
               <span className="font-handwriting font-bold text-lg leading-none">Search...</span>
           </button>
           <Button variant="ghost" size="icon" onClick={() => setShowCmd(true)} className="md:hidden">
              <FaSearch className="h-5 w-5" />
           </Button>

            {/* Favorites Link (Restored) */}
            <NavLink 
                to="/favorites" 
                className={({ isActive }) => cn(
                    "relative text-text-ink hover:text-accent-blood transition-colors p-2",
                    isActive && "text-accent-blood"
                )}
                title="My Favorites"
            >
                <FaHeart className="w-5 h-5" />
            </NavLink>

           <LanguageSwitcher />

           {user ? (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <button className="flex items-center gap-2 hover:underline decoration-wavy outline-none group">
                   {profile?.avatarUrl ? (
                     <img src={profile.avatarUrl} alt="User" className="w-10 h-10 rounded border-2 border-text-ink group-hover:rotate-6 transition-transform" />
                   ) : (
                     <div className="w-10 h-10 bg-text-ink text-bg-paper flex items-center justify-center border-2 border-transparent group-hover:rotate-6 transition-transform">
                        <span className="font-heading text-xs">{profile?.username?.[0]?.toUpperCase() || 'U'}</span>
                     </div>
                   )}
                 </button>
               </DropdownMenuTrigger>

               <DropdownMenuContent align="end" className="w-56 bg-bg-paper border-2 border-text-ink shadow-[4px_4px_0px_#000]">
                 <div className="px-2 py-1.5 text-sm font-bold border-b border-text-ink/20">
                    {profile?.username || 'User'}
                 </div>
                 {isAdmin && (
                   <DropdownMenuItem onClick={() => navigate('/admin')}>
                     Admin Dashboard
                   </DropdownMenuItem>
                 )}
                 <DropdownMenuItem onClick={() => navigate('/account')}>
                   Profile
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleLogout} className="text-accent-blood focus:text-accent-blood">
                   Sign Out <FaSignOutAlt className="ml-auto" />
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           ) : (
             <Button variant="secondary" size="sm" onClick={() => navigate('/login')} className="font-handwriting font-bold text-lg whitespace-nowrap min-w-fit px-4 h-10 border-2 border-transparent hover:border-red-500 animate-pulse">
               LOG IN (START)
             </Button>
           )}
        </div>

      </nav>
    </>
  )
}

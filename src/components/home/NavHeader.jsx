// NavHeader.jsx - Updated Header with robust visibility
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { FaSearch, FaUserCircle, FaSignOutAlt, FaHeart } from 'react-icons/fa';
import { CommandPalette } from '../layout/CommandPalette';
import { useAuth } from '../../hooks/useAuth';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../ui/DropdownMenu';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { supabase } from '../../lib/supabaseClient';
import { useIsAdmin } from '../../hooks/useAdmin';

export function NavHeader() {
  const { t } = useTranslation();
  const [showCmd, setShowCmd] = useState(false);
  const navigate = useNavigate();
  
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
  ];

  return (
    <>
      <CommandPalette open={showCmd} onOpenChange={setShowCmd} />

      <nav className="w-full mb-8 pb-4 relative z-50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Logo Area */}
            <NavLink to="/" className="group z-10 order-1">
                <h1 className="text-5xl lg:text-6xl font-heading text-text-heading wiggle inline-block relative tracking-tighter shadow-black drop-shadow-lg">
                TBOI <span className="text-accent-blood">Codex</span>
                </h1>
            </NavLink>

            {/* Navigation Links - Centered on Desktop, 2nd on Mobile */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 z-10 order-3 md:order-2">
            {links.map(link => (
                <NavLink 
                    key={link.path} 
                    to={link.path}
                    className={({ isActive }) => cn(
                        "relative text-xl md:text-2xl lg:text-3xl font-heading uppercase transition-all duration-200",
                        isActive ? "text-accent-blood drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] scale-110" : "text-text-ink/80 hover:text-accent-blood hover:scale-105"
                    )}
                >
                    {link.name}
                </NavLink>
            ))}
            </div>

            {/* Actions - Right on Desktop, 2nd row on Mobile */}
            <div className="flex items-center gap-4 z-10 order-2 md:order-3">
            
            {/* Search Trigger */}
            <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCmd(true)} 
                className="flex items-center gap-2 text-text-ink hover:text-accent-blood font-heading text-lg"
            >
                <FaSearch className="w-5 h-5" />
                <span className="hidden lg:inline">Search</span>
            </Button>

            {/* Favorites */}
            <NavLink 
                to="/favorites" 
                className={({ isActive }) => cn(
                    "text-text-ink hover:text-accent-blood transition-colors p-2 flex items-center justify-center",
                    isActive && "text-accent-blood"
                )}
            >
                <FaHeart className="w-6 h-6" />
            </NavLink>

            <LanguageSwitcher />

            {/* User Profile / Login */}
            {user ? (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center outline-none group ml-2">
                    {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="User" className="w-10 h-10 md:w-12 md:h-12 rounded border-hand-drawn border-black group-hover:rotate-6 transition-transform block" />
                    ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-text-ink text-bg-paper flex items-center justify-center border-hand-drawn border-black group-hover:rotate-6 transition-transform">
                            <span className="font-heading text-lg">{profile?.username?.[0]?.toUpperCase() || 'U'}</span>
                        </div>
                    )}
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-[#fdfbf7] border-hand-drawn border-black shadow-[4px_4px_0px_#000] z-[100]">
                    <div className="px-2 py-1.5 text-sm font-bold border-b-2 border-black/10 font-handwriting">
                        {profile?.username || 'User'}
                    </div>
                    {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="font-heading uppercase text-sm">
                        Dashboard
                    </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/account')} className="font-heading uppercase text-sm">
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-accent-blood focus:text-accent-blood font-heading uppercase text-sm">
                        Sign Out <FaSignOutAlt className="ml-auto" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => navigate('/login')} 
                    className={cn(
                        "font-heading whitespace-nowrap px-4 md:px-6 h-10 md:h-12 text-lg md:text-xl ml-2",
                        "border-hand-drawn border-black bg-white text-black",
                        "hover:bg-black hover:text-accent-blood transition-all duration-300 hover:-rotate-1"
                    )}
                >
                    LOG IN
                </Button>
            )}
            </div>
        </div>

        {/* Separator Line */}
        <div className="absolute bottom-0 left-0 w-full h-[6px] mt-4 opacity-50" 
             style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='1200' height='10' viewBox='0 0 1200 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,5 Q300,9 600,4 T1200,6' stroke='%231f1f1f' stroke-width='3' fill='none' stroke-linecap='round' /%3E%3C/svg%3E")`,
                 backgroundSize: 'cover'
             }}
        />
      </nav>
    </>
  );
}

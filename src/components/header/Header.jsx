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
import { supabase } from '../../lib/supabaseClient';
import { useIsAdmin } from '../../hooks/useAdmin';

function Header() {
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

  const NavItem = ({ to, label }) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "font-pixel text-2xl tracking-widest text-text-heading transition-all duration-200 uppercase transform",
        isActive ? "text-accent-blood scale-110 rotate-1" : "hover:text-accent-blood hover:animate-wiggle"
      )}
    >
      {label}
    </NavLink>
  );

  return (
    <>
      <header className="relative w-full z-50 pt-8 pb-6 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-[1fr_2fr_1fr] items-center gap-4">
            
            {/* Left: Logo */}
            <div className="flex justify-start pl-4 md:pl-8">
                <NavLink to="/" className="group relative block transform transition-transform hover:-rotate-2 hover:scale-105">
                     <div className="font-heading text-4xl text-black drop-shadow-[2px_2px_0_rgba(255,255,255,1)] tracking-tighter leading-none">
                        TBOI<br/>
                        <span className="text-accent-blood block mt-1">CODEX</span>
                     </div>
                     {/* Rough scribble under logo */}
                     <svg className="absolute -bottom-4 -left-4 w-[120%] h-6 text-black opacity-80 group-hover:scale-x-110 transition-transform" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0 5 Q 20 8 40 4 T 80 6 T 100 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                     </svg>
                </NavLink>
            </div>

            {/* Center: Navigation */}
            <nav className="flex items-center justify-center gap-8 lg:gap-16">
                <NavItem to="/items" label="Items" />
                <NavItem to="/bosses" label="Bosses" />
                <NavItem to="/characters" label="Characters" />
                <NavItem to="/builds" label="Builds" />
            </nav>

            {/* Right: Tools (Search, Favs, Login) */}
            <div className="flex items-center justify-end gap-6 pr-4">
                {/* Search Bar (Game Input Style) */}
                <div 
                    className="cursor-pointer group relative flex items-center bg-black border-[3px] border-white/90 rounded-none px-3 py-2 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] rotate-1 hover:rotate-0 transition-all hover:scale-105 w-auto md:w-48 justify-between"
                    onClick={() => setShowCmd(true)}
                >
                    <span className="font-pixel text-white text-xl tracking-wider opacity-90 hidden md:block">SEARCH</span>
                    <FaSearch className="text-white w-4 h-4 group-hover:text-accent-blood transition-colors" />
                </div>

                {/* Favorites */}
                {user && (
                    <NavLink to="/favorites">
                        <Button variant="ghost" className="relative p-2 group hover:scale-110 transition-transform">
                             <FaHeart className="w-7 h-7 text-black drop-shadow-sm group-hover:text-accent-blood group-hover:animate-pulse transition-colors" />
                        </Button>
                    </NavLink>
                )}

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
                                   Admin Dashboard
                               </DropdownMenuItem>
                           )}
                           <DropdownMenuItem onClick={() => navigate('/account')}>
                               Account
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={handleLogout} className="text-accent-blood font-bold">
                               <FaSignOutAlt className="mr-2" /> Logout
                           </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button 
                        onClick={() => navigate('/login')}
                        className="font-handwriting text-xl font-bold bg-transparent border-[3px] border-black text-black hover:bg-black hover:text-white transition-all px-6 py-1 transform hover:-rotate-2"
                        style={{
                            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' // Hand-drawn border radius
                        }}
                    >
                        Login
                    </Button>
                )}
            </div>
        </div>

        {/* Irregular bottom border (SVG Divider) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none select-none pointer-events-none translate-y-1/2 z-0">
            <svg 
               viewBox="0 0 1200 20" 
               preserveAspectRatio="none" 
               className="w-full h-6 text-black opacity-60"
            >
                <path d="M0,10 Q 300,18 600,10 T 1200,10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" strokeLinecap="round" />
            </svg>
        </div>
      </header>

      <CommandPalette open={showCmd} setOpen={setShowCmd} />
    </>
  )
}

export default Header
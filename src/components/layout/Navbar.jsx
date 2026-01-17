import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { CommandPalette } from './CommandPalette'
import { useAuth } from '../../contexts/AuthContext'
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
  ]

  return (
    <>
      <CommandPalette open={showCmd} onOpenChange={setShowCmd} />

      <nav className="w-full mb-6 border-b-[3px] border-text-ink pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo / Title Area */}
        <NavLink to="/" className="group">
            <h1 className="text-4xl md:text-5xl font-heading text-text-heading wiggle inline-block relative">
               TBOI <span className="text-accent-blood">Codex</span>
               {/* Sketchy Underline */}
               <svg className="absolute -bottom-2 left-0 w-full h-3 text-text-ink" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="2" fill="none" />
               </svg>
            </h1>
        </NavLink>

        {/* Doodle Links */}
        <div className="flex items-center gap-6 font-handwriting text-2xl">
           {links.map(link => (
              <NavLink 
                 key={link.path} 
                 to={link.path}
                 className={({ isActive }) => cn(
                    "relative px-2 hover:scale-110 transition-transform rotate-1",
                    isActive ? "font-bold text-accent-blood" : "text-text-ink"
                 )}
              >
                 {({ isActive }) => (
                    <>
                       {link.name}
                       {isActive && (
                          <div className="absolute -inset-1 border-2 border-accent-blood rounded-[50%] -rotate-2 opacity-70 pointer-events-none"></div>
                       )}
                    </>
                 )}
              </NavLink>
           ))}
        </div>

        {/* Actions (Search, User) */}
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" onClick={() => setShowCmd(true)} title="Search">
              <FaSearch className="h-5 w-5" />
           </Button>

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
             <Button variant="secondary" size="sm" onClick={() => navigate('/login')} className="font-handwriting font-bold text-lg">
               Log In
             </Button>
           )}
        </div>

      </nav>
    </>
  )
}

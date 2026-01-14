import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { FaSearch, FaBars, FaTimes, FaHeart, FaLayerGroup, FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa'
import { CommandPalette } from './CommandPalette'
import { useAuth } from '../../contexts/AuthContext'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuItem 
} from '../ui/DropdownMenu'
import { supabase } from '../../lib/supabaseClient'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false) // Mobile menu
  const [showCmd, setShowCmd] = useState(false) // Command palette
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);

  // Scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch minimal profile info for navbar avatar
  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', user.id)
        .single();
      
      if (!ignore && data) {
         if (data.avatar_url) {
            // Get public URL for avatar
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
    { name: 'Items', path: '/items' },
    { name: 'Bosses', path: '/bosses' },
    { name: 'Characters', path: '/characters' },
    { name: 'Builds', path: '/builds' },
  ]

  return (
    <>
      <CommandPalette open={showCmd} onOpenChange={setShowCmd} />

      <nav className={cn(
        "fixed top-0 z-40 w-full transition-all duration-300 border-b",
        scrolled 
          ? "bg-bg-0/80 backdrop-blur-md border-border/50 py-2 shadow-lg" 
          : "bg-transparent border-transparent py-4 bg-gradient-to-b from-bg-0/80 to-transparent"
      )}>
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 flex items-center justify-center bg-bg-1 border border-white/10 rounded overflow-hidden group-hover:border-gold/50 transition-colors">
               <span className="text-xl relative z-10 group-hover:scale-110 transition-transform">⚡</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-fg leading-none tracking-tight group-hover:text-gold transition-colors">TBOI: Codex</span>
              <span className="text-[9px] text-muted uppercase tracking-[0.2em] leading-none opacity-70">Repentance</span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
             {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium px-4 py-2 rounded-full transition-all hover:bg-white/5",
                      isActive ? "text-gold bg-white/5 font-bold" : "text-muted hover:text-fg"
                    )
                  }
                >
                  {link.name}
                </NavLink>
              ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
             {/* Command Trigger */}
            <button 
                onClick={() => setShowCmd(true)}
                className="flex items-center gap-2 text-xs text-muted bg-bg-1/50 border border-white/10 px-3 py-1.5 rounded-full hover:border-gold/30 hover:bg-bg-1 transition-all group"
            >
                 <FaSearch size={10} className="group-hover:text-gold" /> 
                 <span className="mr-2">Search...</span>
                 <kbd className="hidden lg:inline-block font-mono text-[9px] bg-black/20 px-1 rounded border border-white/5 text-muted-2 group-hover:text-muted">Ctrl K</kbd>
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <Button variant="ghost" size="icon" className="rounded-full text-muted hover:text-blood" onClick={() => navigate('/favorites')}>
               <FaHeart size={16} />
            </Button>

            {user ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-white/10 overflow-hidden ml-2 p-0 ring-offset-bg-0 focus:ring-2 focus:ring-gold focus:ring-offset-2">
                      {profile?.avatarUrl ? (
                         <img src={profile.avatarUrl} alt={profile.username || 'User'} className="h-full w-full object-cover" />
                      ) : (
                         <div className="h-full w-full bg-accent text-accent-foreground flex items-center justify-center font-serif text-sm border-2 border-gold/20">
                            {profile?.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                         </div>
                      )}
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-56 bg-bg-1/95 backdrop-blur border border-border/50 text-fg shadow-2xl animate-in zoom-in-95">
                   <DropdownMenuLabel className="font-normal">
                     <div className="flex flex-col space-y-1">
                       <p className="text-sm font-medium leading-none text-gold font-serif">{profile?.username || 'Usuario'}</p>
                       <p className="text-xs leading-none text-muted-foreground opacity-60">
                         {user.email}
                       </p>
                     </div>
                   </DropdownMenuLabel>
                   <DropdownMenuSeparator className="bg-white/10" />
                   <DropdownMenuItem onClick={() => navigate('/account')} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-gold data-[highlighted]:bg-white/5 gap-2">
                     <FaCog size={14} className="opacity-70" /> 
                     <span>Configurar Cuenta</span>
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => navigate('/favorites')} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-gold data-[highlighted]:bg-white/5 gap-2">
                     <FaHeart size={14} className="opacity-70" /> 
                     <span>Favoritos</span>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator className="bg-white/10" />
                   <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 focus:text-red-400 hover:bg-red-900/10 focus:bg-red-900/10 gap-2">
                     <FaSignOutAlt size={14} />
                     <span>Cerrar Sesión</span>
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            ) : (
               <div className="flex items-center gap-2 ml-2">
                   <Button variant="ghost" size="sm" className="text-muted hover:text-fg font-medium hidden lg:inline-flex" onClick={() => navigate('/login')}>
                     Log In
                   </Button>
                   <Button size="sm" className="bg-gold hover:bg-gold/80 text-black font-bold font-serif px-6 shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all rounded-xl" onClick={() => navigate('/register')}>
                     Join
                   </Button>
               </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="sm" className="md:hidden text-fg" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </Button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-bg-0/95 backdrop-blur-xl pt-24 px-6 animate-fade-in md:hidden">
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                  {user ? (
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-1 border border-border w-full" onClick={() => { navigate('/account'); setIsOpen(false); }}>
                        <div className="h-10 w-10 rounded-full border border-gold/30 overflow-hidden bg-bg-2">
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Me" className="h-full w-full object-cover" />
                            ) : (
                                <span className="h-full w-full flex items-center justify-center text-lg font-serif text-gold">
                                    {profile?.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gold font-serif font-bold">{profile?.username || 'Usuario'}</span>
                            <span className="text-xs text-muted">{user.email}</span>
                        </div>
                        <FaCog className="ml-auto text-muted" />
                     </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 w-full">
                       <Button variant="secondary" onClick={() => { navigate('/login'); setIsOpen(false); }}>Log In</Button>
                       <Button className="bg-gold text-black" onClick={() => { navigate('/register'); setIsOpen(false); }}>Sign Up</Button>
                    </div>
                  )}
              </div>
              <button 
                  onClick={() => { setShowCmd(true); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-bg-2 border border-border text-left text-muted mb-4"
              >
                  <FaSearch /> Search anything...
              </button>
              
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "text-2xl font-serif font-bold py-2 border-l-2 pl-4 transition-all",
                      isActive ? "border-gold text-gold" : "border-transparent text-muted hover:text-fg hover:border-white/20"
                    )
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              
              <div className="h-px bg-white/10 my-4" />
              
              <div className="flex gap-4">
                 <Button className="flex-1 gap-2" variant="secondary" onClick={() => navigate('/favorites')}>
                    <FaHeart className="text-blood" /> Favorites
                 </Button>
              </div>
           </div>
        </div>
      )}
    </>
  )
}

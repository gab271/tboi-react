import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { FaSearch, FaBars, FaTimes, FaHeart, FaLayerGroup } from 'react-icons/fa'
import { CommandPalette } from './CommandPalette'

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false) // Mobile menu
  const [showCmd, setShowCmd] = React.useState(false) // Command palette
  const [scrolled, setScrolled] = React.useState(false)
  const navigate = useNavigate()

  // Scroll effect for glassmorphism
  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            <Button variant="ghost" size="icon" className="rounded-full text-muted hover:text-tea" onClick={() => navigate('/builds')}>
               <FaLayerGroup size={16} />
            </Button>
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

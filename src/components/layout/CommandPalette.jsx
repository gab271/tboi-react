import React, { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { FaSearch, FaSpinner, FaBoxOpen, FaSkull, FaUser, FaHome, FaHammer, FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Toggle/Escape Logic
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange((prev) => !prev)
      }
      if (e.key === 'Escape' && open) {
        // Prevent default only if we want to override system behavior, 
        // but here we just want to close.
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  // Backend Search
  useEffect(() => {
    if (!value || value.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(value)}`)
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error("Search failed:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  const runCommand = (action) => {
    // 1. Close first
    onOpenChange(false)
    // 2. Clear input
    setValue('')
    // 3. Execute navigation
    action()
  }

  const handleSelectResult = (item) => {
    if (!item) return;

    let path = '/items';
    let slug = item.slug || item.id || item.name?.toLowerCase().replace(/\s+/g, '-');

    if (item.type === 'boss') path = '/bosses'; // Or /bosses/:slug if supported
    else if (item.type === 'character') path = '/characters';
    else if (item.type === 'item') path = `/items/${slug}`;
    else path = `/items/${slug}`; // Default fallback

    runCommand(() => navigate(path));
  }

  // Handle Backdrop Click
  const handleBackdropClick = (e) => {
      // If the click is strictly on the backdrop (not bubbled from child)
      if (e.target === e.currentTarget) {
          onOpenChange(false)
      }
  }

  if (!open) return null;

  return (
    <div 
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[10vh]"
        onPointerDown={handleBackdropClick} // Use PointerDown for better UX than Click
    >
       <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-200 px-4">
           
           {/* Paper Container */}
           <div className="bg-[#e6dcc8] border-2 border-[#8f7e63] rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
             
             {/* Decorative Tape */}
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#f4e7c3] rotate-1 shadow-sm border-l border-r border-[#dcd0ac] z-10 pointer-events-none opacity-90"></div>

             <Command 
                label="Global Search" 
                shouldFilter={false} // We handle filtering/fetching manually
                className="w-full h-full"
             >
                
               {/* Search Header */}
               <div className="flex items-center px-4 py-4 border-b-2 border-[#8f7e63] border-dashed" >
                 <FaSearch className="text-[#5c503f] mr-4 w-5 h-5" />
                 <Command.Input 
                   value={value}
                   onValueChange={setValue}
                   className="flex-1 h-8 bg-transparent outline-none text-2xl font-handwriting font-bold text-[#2c241b] placeholder:text-[#8f7e63]/60 lowercase"
                   placeholder="search wiki..."
                   autoFocus
                 />
                 <div className="flex items-center gap-2">
                     {loading && <FaSpinner className="animate-spin text-[#8f7e63]" />}
                     <div 
                        className="hidden md:flex items-center justify-center px-2 py-1 text-[10px] font-bold text-[#5c503f] bg-[#d3c5ad] border border-[#b0a086] rounded cursor-pointer hover:bg-red-900 hover:text-white transition-colors"
                        onClick={() => onOpenChange(false)}
                     >
                        ESC
                     </div>
                 </div>
               </div>

               {/* Results Area */}
               <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#8f7e63] scrollbar-track-transparent">
                 
                 {/* Empty State */}
                 {!loading && results.length === 0 && value.length >= 2 && (
                    <div className="py-12 text-center">
                        <p className="font-handwriting text-xl text-[#8f7e63]">No scraps found for "{value}"...</p>
                    </div>
                 )}

                 {/* Default Quick Links (When no search) */}
                 {!value && (
                     <Command.Group heading="QUICK TRAVEL" className="text-xs font-heading tracking-widest text-[#5c503f] uppercase px-2 py-2 mb-2">
                        <QuickLink 
                            icon={<FaHome />} 
                            label="Home" 
                            shortcut="H"
                            onClick={() => runCommand(() => navigate('/'))} 
                        />
                         <QuickLink 
                            icon={<FaBoxOpen />} 
                            label="All Items" 
                            shortcut="I"
                            onClick={() => runCommand(() => navigate('/items'))} 
                        />
                         <QuickLink 
                            icon={<FaSkull />} 
                            label="Bosses" 
                            shortcut="B"
                            onClick={() => runCommand(() => navigate('/bosses'))} 
                        />
                         <QuickLink 
                            icon={<FaUser />} 
                            label="Characters" 
                            shortcut="C"
                            onClick={() => runCommand(() => navigate('/characters'))} 
                        />
                        <QuickLink 
                            icon={<FaHammer />} 
                            label="Builds" 
                            shortcut="T"
                            onClick={() => runCommand(() => navigate('/builds'))} 
                        />
                     </Command.Group>
                 )}

                 {/* Search Results */}
                 {results.length > 0 && (
                     <Command.Group heading="RESULTS" className="text-xs font-heading tracking-widest text-[#5c503f] uppercase px-2 py-2">
                        {results.map((item, i) => (
                            <Command.Item 
                                key={item.slug || i} 
                                value={`${item.name}-${i}`} // Ensure unique value
                                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors group aria-selected:bg-[#d3c5ad] hover:bg-[#d3c5ad]"
                                onSelect={() => handleSelectResult(item)}
                            >
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded border border-[#8f7e63] shadow-sm overflow-hidden p-1">
                                    {item.icon_url ? (
                                        <img src={item.icon_url} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <ItemIcon type={item.type} />
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-xl font-handwriting font-bold text-[#2c241b] group-aria-selected:text-red-900">
                                        {item.name}
                                    </span>
                                    {item.description && (
                                        <span className="text-sm text-[#5c503f] truncate font-sans font-medium">
                                            {item.description}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-heading uppercase text-[#5c503f]/70 bg-[#cbbba0] px-1.5 py-0.5 rounded">
                                    {item.type}
                                </span>
                            </Command.Item>
                        ))}
                     </Command.Group>
                 )}

               </Command.List>

             </Command>
             
             {/* Close Fab for Mobile */}
             <button 
               className="md:hidden absolute top-2 right-2 p-2 text-[#5c503f]"
               onClick={() => onOpenChange(false)}
             >
                 <FaTimes />
             </button>

           </div>
       </div>
    </div>
  )
}

// Helpers
function QuickLink({ icon, label, onClick, shortcut }) {
    return (
        <Command.Item 
            value={label} 
            onSelect={onClick}
            className="flex items-center justify-between px-3 py-3 rounded cursor-pointer transition-colors group aria-selected:bg-[#d3c5ad] hover:bg-[#d3c5ad]"
        >
            <div className="flex items-center gap-3">
                <span className="text-[#2c241b] text-lg opacity-80 group-aria-selected:scale-110 transition-transform">{icon}</span>
                <span className="text-xl font-handwriting font-bold text-[#2c241b] pt-1">{label}</span>
            </div>
            {shortcut && (
                <span className="text-[10px] opacity-0 group-aria-selected:opacity-50">↵</span>
            )}
        </Command.Item>
    );
}

function ItemIcon({ type }) {
   if (type === 'boss') return <FaSkull className="text-red-800" />;
   if (type === 'character') return <FaUser className="text-blue-800" />;
   return <FaBoxOpen className="text-yellow-700" />;
}

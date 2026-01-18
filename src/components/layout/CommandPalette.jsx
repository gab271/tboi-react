import React from 'react'
import { Command } from 'cmdk'
import { FaSearch, FaSpinner, FaBoxOpen, FaSkull, FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate()
  const [value, setValue] = React.useState('')
  const [results, setResults] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const down = (e) => {
      // Toggle with Ctrl+K
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange((open) => !open)
      }
      // Close with Escape
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange, open])

  // Search Effect
  React.useEffect(() => {
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

  const runCommand = (command) => {
    onOpenChange(false)
    command()
  }

  const handleSelectResult = (item) => {
      if (!item) return;

      if (item.type === 'item') {
          // Check for valid slug or fallback to name (url friendly)
          const slug = item.slug || item.id || item.name.toLowerCase().replace(/\s+/g, '-');
          runCommand(() => navigate(`/items/${slug}`))
      } else if (item.type === 'boss') {
          runCommand(() => navigate(`/bosses`)) 
      } else if (item.type === 'character') {
          runCommand(() => navigate(`/characters`))
      } else {
          // Generic fallback
          const slug = item.slug || item.id || 'unknown';
          runCommand(() => navigate(`/items/${slug}`))
      }
  }

  // Helper for icons based on type
  const getIcon = (type) => {
      switch(type) {
          case 'boss': return <FaSkull className="text-red-900" />;
          case 'character': return <FaUser className="text-blue-800" />;
          case 'item': default: return <FaBoxOpen className="text-yellow-700" />;
      }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] transition-opacity font-sans">
       {/* 
          Paper-Style Container
          - Uses 'bg-[#e6dcc8]' (paper color) 
          - Border 'border-[#8f7e63]' to look like old paper edge
          - Shadow to lift it off
       */}
       <div className="bg-[#e6dcc8] border-2 border-[#8f7e63] rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.5)] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
         
         {/* Decorative 'Tape' at top */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-yellow-100/50 rotate-1 shadow-sm z-10 pointer-events-none"></div>

         <Command label="Global Search" className="w-full" shouldFilter={false}>
           
           {/* Header / Input Area */}
           <div className="flex items-center px-4 py-4 border-b-2 border-[#8f7e63] border-dashed" >
             <FaSearch className="text-[#5c503f] mr-3 w-5 h-5" />
             <Command.Input 
               value={value}
               onValueChange={setValue}
               className="flex-1 h-10 bg-transparent outline-none text-2xl font-handwriting font-bold text-[#2c241b] placeholder:text-[#8f7e63]/60"
               placeholder="Search Wiki..."
               autoFocus
             />
             <div className="flex items-center gap-2">
                 {loading && <FaSpinner className="animate-spin text-[#8f7e63]" />}
                 <div className="hidden md:flex items-center justify-center h-6 px-2 text-[10px] font-bold text-[#5c503f] bg-[#d3c5ad] border border-[#b0a086] rounded shadow-sm">
                    ESC
                 </div>
             </div>
           </div>
           
           {/* Results List */}
           <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#8f7e63] scrollbar-track-transparent">
             
             {!loading && results.length === 0 && value.length >= 2 && (
                <div className="py-8 text-center font-handwriting text-xl text-[#8f7e63]">
                    No scraps found for "{value}"...
                </div>
             )}

             {!value && (
                 <Command.Group heading="QUICK TRAVEL" className="text-xs font-heading tracking-widest text-[#5c503f] uppercase px-2 py-2 mb-2">
                    <Command.Item 
                        className="flex items-center gap-3 px-3 py-3 rounded hover:bg-[#d3c5ad] cursor-pointer transition-colors group text-[#2c241b] font-handwriting text-xl font-bold"
                        onSelect={() => runCommand(() => navigate('/'))}
                    >
                        <span className="opacity-70 group-hover:scale-110 transition-transform">🏠</span> Home
                    </Command.Item>
                    <Command.Item 
                        className="flex items-center gap-3 px-3 py-3 rounded hover:bg-[#d3c5ad] cursor-pointer transition-colors group text-[#2c241b] font-handwriting text-xl font-bold"
                        onSelect={() => runCommand(() => navigate('/items'))}
                    >
                        <span className="opacity-70 group-hover:scale-110 transition-transform">📦</span> All Items
                    </Command.Item>
                 </Command.Group>
             )}

             {results.length > 0 && (
                 <Command.Group heading="RESULTS" className="text-xs font-heading tracking-widest text-[#5c503f] uppercase px-2 py-2">
                    {results.map((item, i) => (
                        <Command.Item 
                            key={item.slug + i + item.name} 
                            value={item.name} 
                            // Important: cmdk uses 'value' for internal filtering/selection. ensures uniqueness.
                            
                            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#d3c5ad] aria-selected:bg-[#d3c5ad] cursor-pointer transition-colors group"
                            onSelect={() => handleSelectResult(item)}
                        >
                            {/* Icon Box */}
                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded border border-[#8f7e63] shadow-sm overflow-hidden p-1">
                                {item.icon_url ? (
                                    <img src={item.icon_url} alt="" className="w-full h-full object-contain" />
                                ) : (
                                    getIcon(item.type)
                                )}
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className={cn(
                                    "text-xl font-handwriting font-bold text-[#2c241b]",
                                    // Highlight if selected
                                    "group-aria-selected:text-red-900 group-hover:text-red-900"
                                )}>
                                    {item.name}
                                </span>
                                {item.description && (
                                    <span className="text-sm text-[#5c503f] truncate font-sans font-medium">
                                        {item.description}
                                    </span>
                                )}
                            </div>

                            {/* Tag */}
                            <span className="text-[10px] font-heading uppercase text-[#5c503f]/70 bg-[#cbbba0] px-1.5 py-0.5 rounded">
                                {item.type}
                            </span>
                        </Command.Item>
                    ))}
                 </Command.Group>
             )}
            
           </Command.List>
         </Command>
         
         {/* Close Button X */}
         <div 
           className="absolute top-2 right-2 cursor-pointer p-2 hover:bg-[#d3c5ad] rounded-full transition-colors text-[#5c503f]"
           onClick={() => onOpenChange(false)}
         >
             <span className="sr-only">Close</span>
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
         </div>
       </div>
       
       {/* Dark overlay backdrop close trigger */}
       <div className="fixed inset-0 -z-10" onClick={() => onOpenChange(false)} />
    </div>
  )
}

import React from 'react'
import { Command } from 'cmdk'
import { FaSearch } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

export function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate()
  // Mock data for command palette - usually you'd fetch this
  const [value, setValue] = React.useState('')

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange])

  const runCommand = (command) => {
    onOpenChange(false)
    command()
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
       <div className="bg-bg-1 border border-border rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in relative">
         <Command label="Global Search" className="w-full">
           <div className="flex items-center px-4 border-b border-white/5" >
             <FaSearch className="text-muted mr-2" />
             <Command.Input 
               value={value}
               onValueChange={setValue}
               className="flex-1 h-12 bg-transparent outline-none text-fg placeholder:text-muted"
               placeholder="Type a command or search..."
             />
             <kbd className="text-[10px] bg-white/5 border border-white/10 px-1.5 rounded text-muted">ESC</kbd>
           </div>
           
           <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
             <Command.Empty className="py-6 text-center text-sm text-muted">
               No results found.
             </Command.Empty>

             <Command.Group heading="Navigation" className="text-xs text-muted font-bold uppercase px-2 py-1.5">
               <Command.Item 
                 className="flex items-center gap-2 px-2 py-2 rounded text-sm text-fg cursor-pointer aria-selected:bg-gold/20 aria-selected:text-gold transition-colors"
                 onSelect={() => runCommand(() => navigate('/'))}
               >
                 Go to Home
               </Command.Item>
               <Command.Item 
                 className="flex items-center gap-2 px-2 py-2 rounded text-sm text-fg cursor-pointer aria-selected:bg-gold/20 aria-selected:text-gold transition-colors"
                 onSelect={() => runCommand(() => navigate('/items'))}
               >
                 Go to Items
               </Command.Item>
               <Command.Item 
                 className="flex items-center gap-2 px-2 py-2 rounded text-sm text-fg cursor-pointer aria-selected:bg-gold/20 aria-selected:text-gold transition-colors"
                 onSelect={() => runCommand(() => navigate('/bosses'))}
               >
                 Go to Bosses
               </Command.Item>
                <Command.Item 
                 className="flex items-center gap-2 px-2 py-2 rounded text-sm text-fg cursor-pointer aria-selected:bg-gold/20 aria-selected:text-gold transition-colors"
                 onSelect={() => runCommand(() => navigate('/characters'))}
               >
                 Go to Characters
               </Command.Item>
             </Command.Group>

             <Command.Group heading="Tools" className="text-xs text-muted font-bold uppercase px-2 py-1.5 mt-2">
                <Command.Item 
                 className="flex items-center gap-2 px-2 py-2 rounded text-sm text-fg cursor-pointer aria-selected:bg-gold/20 aria-selected:text-gold transition-colors"
                 onSelect={() => runCommand(() => navigate('/favorites'))}
               >
                 ✨ Open Favorites
               </Command.Item>
             </Command.Group>
            
           </Command.List>
         </Command>
         
         {/* Click outside to close helper */}
         <div 
           className="absolute top-2 right-2 cursor-pointer p-2"
           onClick={() => onOpenChange(false)}
         />
       </div>
       <div className="fixed inset-0 -z-10" onClick={() => onOpenChange(false)} />
    </div>
  )
}

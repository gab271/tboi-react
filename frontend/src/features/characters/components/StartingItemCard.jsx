/**
 * StartingItemCard - Muestra un item inicial del personaje
 */
import { cn } from '../../../lib/utils';

// Mapeo de tipo de item a badge
const ITEM_TYPE_BADGES = {
  passive: { label: 'Passive', color: 'bg-emerald-100 text-emerald-700' },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-700' },
  trinket: { label: 'Trinket', color: 'bg-amber-100 text-amber-700' },
  innate: { label: 'Innate', color: 'bg-purple-100 text-purple-700' },
  card: { label: 'Card', color: 'bg-pink-100 text-pink-700' },
  pill: { label: 'Pill', color: 'bg-orange-100 text-orange-700' },
  random: { label: 'Random', color: 'bg-gray-100 text-gray-600' }
};

// Rutas de sprites por tipo
function getItemSpritePath(item) {
  if (!item.id && item.type === 'random') {
    return null;
  }
  
  switch (item.type) {
    case 'passive':
      return `/sprites/1_Passive Items/${item.id}_${item.name?.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    case 'active':
      return `/sprites/2_Active Items/${item.id}_${item.name?.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    case 'trinket':
      return `/sprites/3_Trinkets/${item.id}_${item.name?.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    default:
      return null;
  }
}

/**
 * StartingItemCard - Card individual de item inicial
 */
export function StartingItemCard({ item, compact = false, className }) {
  if (!item) return null;
  
  const badge = ITEM_TYPE_BADGES[item.type] || ITEM_TYPE_BADGES.passive;
  const spritePath = getItemSpritePath(item);
  
  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors",
          className
        )}
        title={item.description || item.name}
      >
        {spritePath ? (
          <img 
            src={spritePath} 
            alt={item.name}
            className="w-8 h-8 object-contain pixelated"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded">
            <span className="text-lg">❓</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
        </div>
        <span className={cn("text-xs px-1.5 py-0.5 rounded-full", badge.color)}>
          {badge.label}
        </span>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "flex flex-col p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {spritePath ? (
          <img 
            src={spritePath} 
            alt={item.name}
            className="w-12 h-12 object-contain pixelated flex-shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
              e.target.className = 'hidden';
            }}
          />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center bg-slate-200 rounded-lg flex-shrink-0">
            <span className="text-2xl">{item.type === 'random' ? '🎲' : '❓'}</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
            <span className={cn("text-xs px-2 py-0.5 rounded-full flex-shrink-0", badge.color)}>
              {badge.label}
            </span>
          </div>
          
          {item.description && (
            <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
          )}
          
          {item.charges !== undefined && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs text-slate-500">Charges:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: item.charges || 0 }).map((_, i) => (
                  <div key={i} className="w-2 h-4 bg-green-500 rounded-sm" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * StartingItemsGrid - Grid de todos los items iniciales
 */
export function StartingItemsGrid({ items, className }) {
  if (!items || items.length === 0) {
    return (
      <div className={cn("text-sm text-slate-500 italic", className)}>
        Sin items iniciales
      </div>
    );
  }
  
  // Agrupar por tipo
  const grouped = {
    passive: items.filter(i => i.type === 'passive'),
    active: items.filter(i => i.type === 'active'),
    trinket: items.filter(i => i.type === 'trinket'),
    other: items.filter(i => !['passive', 'active', 'trinket'].includes(i.type))
  };
  
  const hasMultiple = items.length > 3;
  
  return (
    <div className={cn("space-y-2", className)}>
      {hasMultiple ? (
        // Vista compacta para muchos items
        <div className="grid gap-2">
          {items.map((item, idx) => (
            <StartingItemCard key={idx} item={item} compact />
          ))}
        </div>
      ) : (
        // Vista expandida para pocos items
        <div className="grid gap-3">
          {items.map((item, idx) => (
            <StartingItemCard key={idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default StartingItemCard;

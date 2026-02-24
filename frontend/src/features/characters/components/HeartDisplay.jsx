/**
 * HeartDisplay - Muestra la vida inicial del personaje con iconos reales
 */
import { cn } from '../../../lib/utils';

// Sprite paths
const HEART_SPRITES = {
  redFull: '/sprites/6_Environment/Hearts/Red Heart.png',
  redHalf: '/sprites/6_Environment/Hearts/Half Red Heart.png',
  redEmpty: '/sprites/6_Environment/Hearts/Double Heart.png',
  soulFull: '/sprites/6_Environment/Hearts/Soul Heart.png',
  soulHalf: '/sprites/6_Environment/Hearts/Half Soul Heart.png',
  blackFull: '/sprites/6_Environment/Hearts/Black Heart.png',
  boneFull: '/sprites/6_Environment/Hearts/Bone Heart.png',
  eternal: '/sprites/6_Environment/Hearts/Eternal Heart.png',
  rotten: '/sprites/6_Environment/Hearts/Rotten Heart.png'
};

// Fallback emojis si no cargan sprites
const HEART_EMOJI = {
  red: '❤️',
  redHalf: '💔',
  soul: '💙',
  black: '🖤',
  bone: '🦴',
  coin: '🪙',
  empty: '🤍'
};

/**
 * Un corazón individual
 */
function Heart({ type, half = false, className }) {
  const getSprite = () => {
    switch (type) {
      case 'red': return half ? HEART_SPRITES.redHalf : HEART_SPRITES.redFull;
      case 'soul': return half ? HEART_SPRITES.soulHalf : HEART_SPRITES.soulFull;
      case 'black': return HEART_SPRITES.blackFull;
      case 'bone': return HEART_SPRITES.boneFull;
      case 'empty': return HEART_SPRITES.redEmpty;
      default: return HEART_SPRITES.redFull;
    }
  };
  
  const getEmoji = () => {
    switch (type) {
      case 'red': return half ? HEART_EMOJI.redHalf : HEART_EMOJI.red;
      case 'soul': return HEART_EMOJI.soul;
      case 'black': return HEART_EMOJI.black;
      case 'bone': return HEART_EMOJI.bone;
      case 'coin': return HEART_EMOJI.coin;
      case 'empty': return HEART_EMOJI.empty;
      default: return HEART_EMOJI.red;
    }
  };

  return (
    <div className={cn("w-6 h-6 flex items-center justify-center", className)}>
      <img 
        src={getSprite()} 
        alt={`${type} heart`}
        className="w-full h-full object-contain pixelated"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <span 
        className="hidden text-base items-center justify-center"
        style={{ display: 'none' }}
      >
        {getEmoji()}
      </span>
    </div>
  );
}

/**
 * HeartDisplay - Renderiza la vida inicial completa
 */
export function HeartDisplay({ health, className }) {
  if (!health) return null;
  
  // Random (Eden)
  if (health.isRandom) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className="text-sm text-purple-500 animate-pulse">??? Random</span>
      </div>
    );
  }
  
  // Keeper - coin hearts
  if (health.healthType === 'coin') {
    return (
      <div className={cn("flex items-center gap-1 flex-wrap", className)}>
        {Array.from({ length: health.coinHearts || 2 }).map((_, i) => (
          <div key={i} className="w-6 h-6 flex items-center justify-center">
            <span className="text-lg">{HEART_EMOJI.coin}</span>
          </div>
        ))}
      </div>
    );
  }
  
  // Lost - sin vida
  if (!health.canHaveRedHealth && health.redContainers === 0 && health.soulHearts === 0 && health.blackHearts === 0) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {health.hasHolyMantle && (
          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
            ✨ Holy Mantle
          </span>
        )}
        {health.hasFlight && (
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            🪽 Flight
          </span>
        )}
        {!health.hasHolyMantle && !health.hasFlight && (
          <span className="text-sm text-red-500">Sin vida</span>
        )}
      </div>
    );
  }
  
  const hearts = [];
  let key = 0;
  
  // Bone Hearts (primero, pueden contener rojos)
  if (health.boneHearts > 0) {
    for (let i = 0; i < health.boneHearts; i++) {
      hearts.push(<Heart key={key++} type="bone" />);
    }
  }
  
  // Red Hearts
  const redContainers = health.redContainers || 0;
  const redFilled = health.redFilled || 0;
  
  // Corazones rojos llenos
  const fullRed = Math.floor(redFilled / 2);
  for (let i = 0; i < fullRed; i++) {
    hearts.push(<Heart key={key++} type="red" />);
  }
  
  // Medio corazón rojo
  if (redFilled % 2 === 1) {
    hearts.push(<Heart key={key++} type="red" half />);
  }
  
  // Contenedores vacíos
  const emptyContainers = redContainers - Math.ceil(redFilled / 2);
  for (let i = 0; i < emptyContainers; i++) {
    hearts.push(<Heart key={key++} type="empty" />);
  }
  
  // Soul Hearts
  const soulHearts = health.soulHearts || 0;
  const fullSoul = Math.floor(soulHearts / 2);
  for (let i = 0; i < fullSoul; i++) {
    hearts.push(<Heart key={key++} type="soul" />);
  }
  if (soulHearts % 2 === 1) {
    hearts.push(<Heart key={key++} type="soul" half />);
  }
  
  // Black Hearts
  const blackHearts = health.blackHearts || 0;
  const fullBlack = Math.floor(blackHearts / 2);
  for (let i = 0; i < fullBlack; i++) {
    hearts.push(<Heart key={key++} type="black" />);
  }
  
  return (
    <div className={cn("flex items-center gap-0.5 flex-wrap", className)}>
      {hearts}
      
      {/* Special indicators */}
      {health.hasHolyMantle && (
        <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full" title="Holy Mantle">
          ✨
        </span>
      )}
      {health.hasFlight && (
        <span className="ml-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full" title="Flight">
          🪽
        </span>
      )}
      {health.healthDrain && (
        <span className="ml-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full" title="Life Drain">
          ⬇️
        </span>
      )}
    </div>
  );
}

export default HeartDisplay;

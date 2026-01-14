import { useFavorites } from '../../features/favorites/useFavorites';
import { useAuth } from '../../contexts/AuthContext';

const FavoriteButton = ({ entityType, entityId }) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites();
  const favorite = isFavorite(entityType, entityId);

  const handleClick = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to add to favorites');
      return;
    }
    toggleFavorite({ entityType, entityId, isFavorite: favorite });
  };

  if (!user) return null;

  return (
    <button 
      onClick={handleClick}
      disabled={isToggling}
      className={`p-2 rounded-full focus:outline-none transition-colors ${favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
};

export default FavoriteButton;

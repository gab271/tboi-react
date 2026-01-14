import { useFavorites } from '../../features/favorites/useFavorites';
// Need a way to display items/bosses. Assuming ItemCard/BossCard exist or I reuse list logic.
// For now, simple list.

const FavoritesList = () => {
  const { favorites, isLoading } = useFavorites();

  if (isLoading) return <div>Loading favorites...</div>;

  if (favorites.length === 0) {
      return <div>No favorites yet!</div>;
  }

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((fav) => (
          <div key={fav.id} className="bg-gray-800 p-4 rounded shadow">
              <h3 className="font-bold text-lg">{fav.entity_type}</h3>
              <p>ID: {fav.entity_id}</p>
              {/* Here we would ideally fetch details using the ID and display ItemCard */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;

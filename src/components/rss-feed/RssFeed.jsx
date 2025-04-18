import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './RssFeed.css';
import dummyNews from '../../services/updates';

function RssFeed() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="rss-feed">
      {dummyNews.map((item) => (
        <div 
          key={item.id} 
          className="news-item" 
          id={item.id}
        >
          <h2>{item.title}</h2>
          <p className="date">{item.date}</p>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export default RssFeed;
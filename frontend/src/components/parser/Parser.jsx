import { useState, useEffect } from 'react';
import Parser from 'rss-parser';
import './RssFeed.css';

const RssFeed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRSS = async () => {
      const parser = new Parser();
      
      const CORS_PROXY = "https://api.allorigins.win/raw?url=";
      const steamRSS = "https://store.steampowered.com/feeds/news/app/250900/?l=english";
      
      try {
        const feed = await parser.parseURL(CORS_PROXY + encodeURIComponent(steamRSS));
        setFeed(feed.items.slice(0, 5)); 
        setLoading(false);
      } catch (error) {
        console.error('Error fetching RSS:', error);
        setLoading(false);
      }
    };
    
    fetchRSS();
  }, []);

  if (loading) return <div>Loading news...</div>;

  return (
    <div className="rss-container">
      <h2>Latest News</h2>
      <div className="rss-items">
        {feed.map((item, index) => (
          <div key={index} className="rss-item">
            <h3>{item.title}</h3>
            <p>{new Date(item.pubDate).toLocaleDateString()}</p>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RssFeed;
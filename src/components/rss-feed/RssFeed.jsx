import { useState, useEffect } from 'react';
import './RssFeed.css';

const RssFeed = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Here you would typically fetch RSS feed data
    // For now, let's add some dummy data
    const dummyNews = [
      {
        id: 1,
        title: "The Binding of Isaac: Latest Update",
        date: "2024-03-15",
        description: "New items and challenges added!"
      },
      {
        id: 2,
        title: "Community Challenge Winners",
        date: "2024-03-14",
        description: "Check out this week's best runs!"
      }
    ];
    
    setNews(dummyNews);
  }, []);

  return (
    <div className="rss-feed">
      {news.map((item) => (
        <div key={item.id} className="news-item">
          <h2>{item.title}</h2>
          <p className="date">{item.date}</p>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
};

export default RssFeed;
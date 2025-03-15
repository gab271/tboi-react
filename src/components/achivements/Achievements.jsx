import React, { useState } from 'react';
import Banner from "../banner/Banner";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import achievementsData from "../../services/achievementsData"; // Make sure this matches the file name exactly
import "./Achievements.css";


function Achievements() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAchievements = achievementsData.filter(achievement =>
    achievement.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <Banner title="Achievements" />
      
      <div className="achievements-container">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="achievements-grid">
          {filteredAchievements.map((achievement) => (
            <div key={achievement.id} className="achievement-card">
              <img 
                src={achievement.image} 
                alt={achievement.name} 
                className="achievement-image" 
              />
              <h3>{achievement.name}</h3>
              <p className="achievement-description">{achievement.description}</p>
              <span className={`difficulty-badge ${achievement.difficulty.toLowerCase()}`}>
                {achievement.difficulty}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Achievements;
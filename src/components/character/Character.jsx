import React from 'react';
import './Character.css';

function Character({ characterName, characterImage, characterLife, characterDescription }) {
  return (
    <div className="character-card">
      <div className="character-image">
        <img src={characterImage} alt={characterName} />
      </div>
      <div className="character-info">
        <h3>{characterName}</h3>
        <p className="character-life">{characterLife}</p>
        <p className="character-description">{characterDescription}</p>
      </div>
    </div>
  );
}

export default Character;
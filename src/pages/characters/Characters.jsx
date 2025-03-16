import React, { useState, useEffect } from 'react';
import Banner from "../../components/banner/Banner";
import Header from "../../components/header/Header";
import Character from "../../components/character/Character";
import Footer from "../../components/footer/Footer";
import "./Characters.css";
import { db } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

function Characters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const charactersRef = ref(db, 'characters');
    
    onValue(charactersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the object to an array if necessary
        const charactersArray = Object.values(data);
        setCharacters(charactersArray);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <Banner title={"Characters"} />
        <div className="characters-container">Loading...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Banner title={"Characters"} />
      <div className="characters-container">
        {characters.map((character, index) => (
          <Character
            key={index}
            characterName={character.name}
            characterImage={character.image}
            characterLife={character.life}
            characterDescription={character.description}
          />
        ))}
      </div>
      <Footer />
    </>
  );
}

export default Characters;
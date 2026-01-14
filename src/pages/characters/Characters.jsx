import React from 'react';
import Banner from "../../components/banner/Banner";
import Header from "../../components/header/Header";
import Character from "../../components/character/Character";
import Footer from "../../components/footer/Footer";
import "./Characters.css";
import { charactersData } from "../../features/characters/data/charactersData";

function Characters() {
  const characters = charactersData;

  return (
    <>
      <Header />
      <Banner title={"Characters"} />
      <div className="characters-container p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character, index) => (
            <Character
              key={character.id || index}
              characterName={character.name}
              characterImage={character.sprite_url} 
            />
          ))}
      </div>
      <Footer />
    </>
  );
}

export default Characters;

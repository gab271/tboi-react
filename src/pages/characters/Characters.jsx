import React from 'react';
import Banner from "../../components/banner/Banner";
import Header from "../../components/header/Header";
import charactersData from "../../services/charactersData";
import Character from "../../components/character/Character";
import Footer from "../../components/footer/Footer"; // Ruta corregida
import "./Characters.css";

function Characters() {
  return (
    <>
      <Header />
      <Banner title={"Characters"} />
      
      <div className="characters-container">
        {charactersData.map((character, index) => (
          <Character 
            key={index}
            characterName={character.name}
            characterImage={character.image}
            characterLife={character.life}
            characterDescription={character.description} // Asegúrate de pasar la descripción
          />
        ))}
      </div>
      <Footer /> {/* Mueve el Footer fuera del contenedor de personajes */}
    </>
  );
}

export default Characters;
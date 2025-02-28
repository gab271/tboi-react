import Banner from "../../components/banner/Banner"
import Header from "../../components/header/Header"
import charactersData from "../../services/charactersData"
import Character from "../../components/character/Character"
import "./Characters.css"

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
    </>
  )

}

export default Characters
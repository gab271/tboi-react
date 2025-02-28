function Character({ characterName, characterImage, CharacterLife }) {
  return (
    <div className="character">
      <p className="characterName">{characterName}</p>
      <img className="characterImage" src={characterImage} alt="" />
      <p className="characterLife">{CharacterLife}</p>
    </div>
  )
}

export default Character
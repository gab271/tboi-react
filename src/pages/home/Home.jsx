import Banner from "../../components/banner/Banner"
import Footer from "../../components/footer/Footer"
import Header from "../../components/header/Header"
import Mapa from "../../components/mapa/Mapa"
import "./Home.css"

function Home() {
  return (
    <>
      <Header />
      <Banner title={"The Binding of isaac"} />

      <div className="home-content">
        <img
          src="/esau-dancing.gif"
          alt="Essau Dancing"
          className="home-image"
        />
        <div className="home-description">
          <p>
            The Binding of Isaac is an action and dungeon exploration game with roguelike elements, developed by Edmund McMillen and originally released in 2011.
            It is inspired by the biblical story of Isaac and combines challenging gameplay with a dark and grotesque aesthetic.
            <br />
            📜 Story: The game follows Isaac, a boy whose mother hears "the voice of God," commanding her to sacrifice him to prove her faith.
            Isaac manages to escape to a basement full of monsters, where he must fight for his life while uncovering secrets about his past.
          </p>
        </div>
        <img
          src="/jacob.dancing.gif"
          alt="Jacob Dancing"
          className="home-image right-image"
        />
      </div>

      <div className="map-section">
        <h2>find us here</h2> 
        <Mapa />
      </div>

      <Footer />
    </>
  )
}

export default Home
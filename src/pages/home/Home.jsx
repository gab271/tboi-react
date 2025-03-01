import Banner from "../../components/banner/Banner"
import Footer from "../../components/footer/Footer"
import Header from "../../components/header/Header"
import "./Home.css"

function Home() {
  return (
    <>
      <Header />
      <Banner title={"The Binding of isaac"} />

      <div className="home-content">
        <img
          src="public\esau-dancing.gif" // Añade la barra inicial
          alt="Essau Dancing"
          className="home-image"
        />
        <div className="home-description">
          <p>
            The Binding of Isaac es un juego de acción y exploración de mazmorras
            con elementos de roguelike, desarrollado por Edmund McMillen y lanzado
            originalmente en 2011. Se inspira en la historia bíblica de Isaac y
            combina una jugabilidad desafiante con una estética oscura y grotesca.
            📜 Historia:
            El juego sigue a Isaac, un niño cuya madre escucha "la voz de Dios", que le ordena sacrificarlo para demostrar su fe. Isaac logra escapar a un sótano lleno de monstruos, donde debe luchar por su vida mientras descubre secretos sobre su pasado.
          </p>
        </div>
        <img
          src="public\jacob.dancing.gif"
          alt="Jacob Dancing"
          className="home-image right-image"
        />
      </div>

      <Footer />
    </>
  )
}

export default Home
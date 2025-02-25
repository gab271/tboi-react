import { useState } from "react";
import { FaBars } from "react-icons/fa6";


function Navbar(){

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };


  return ( 
    <>
    <header>
  <div className="container">
    <nav>
      <div className="logo">
        <img src="azazel-dancing.gif"/>
        
      </div>
      <ul className={isOpen ? "nav-link active" : "nav-link"}>
        <li>
          <a href="/home" className="active">Home</a>
        </li>
        <li>
          <a href="/characters">Characters</a>
        </li>
        <li>
        <a href="/items">Items</a>
        </li>
      </ul>
      <div className="icon" onClick={toggleMenu}>
      <FaBars />
      </div>
    </nav>
  </div>
  </header>
  <section> 
    <div className="container">
      <div className="content">
        <h2>Responsive Navbar</h2>
      </div>
    </div>
  </section>
    </>
  );
}

export default Navbar
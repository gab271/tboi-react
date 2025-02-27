import { useState } from "react";
import { FaBars } from "react-icons/fa6";

function Navbar({ title }) {
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
              <img src="azazel-dancing.gif" alt="Logo" />
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
      <div className="header-logo">
        
      </div>
      <section>
        <div className="container">
          <div className="content">
            {/* Content goes here */}
          </div>
        </div>
      </section>
    </>
  );
}

export default Navbar;
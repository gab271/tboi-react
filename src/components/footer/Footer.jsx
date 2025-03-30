import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <div className="footer-column">
            <h4>Isaac</h4>
            <a href="/employer">Fandom</a>
            <a href="/healthplan">Fanatical</a>
            <a href="/individual">Multhead</a>
          </div>
          <div className="footer-column">
            <h4>Resources</h4>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <a href="/faq">FAQ</a>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <a href="/privacy">Privacy</a>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <a href="https://www.instagram.com/officaledmundmcmillen/?hl=es">Instagram</a>
            <a href="https://www.facebook.com/theedmundmcmillen/">Contact</a>
          </div>
          <div className="footer-column">
            <h4>More info on</h4>
            <div className="social-media">
              <a href="https://store.steampowered.com/app/1426300/The_Binding_of_Isaac_Repentance/"><img src="steam-icon.jpg" alt="Steam" /></a>
              <a href="https://github.com/gab271/tboi-react/tree/main"><img src="github-icon.jpg" alt="GitHub" /></a>
              <a href="/news-rss.xml"><img src="rss.jpg" alt="RSS Feed" /></a>
            </div>
          </div>
        </div>

        <hr />

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Edmund. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="/terms">Terms & conditions</a>
            <a href="/Politicadeprivacidad.pdf" download="Politica_de_Privacidad.pdf">Privacy Policy</a>
            <a href="/security">Security</a>
            <a href="/cookie">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
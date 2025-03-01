import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <div className="footer-column">
            <h4>Isaac</h4>
            <a href="/employer">Employer</a>
            <a href="/healthplan">Healthplan</a>
            <a href="/individual">Individual</a>
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
            <a href="/about">Facebook</a>
            <a href="/press">Twitter</a>
            <a href="/career">Instagram</a>
            <a href="/contact">Contact</a>
          </div>
          <div className="footer-column">
            <h4>Coming soon on</h4>
            <div className="social-media">
              <a href="https://steam.com"><img src="path/to/steam/image" alt="Steam" /></a>
              <a href="https://github.com"><img src="path/to/github/image" alt="GitHub" /></a>
              <a href="https://twitter.com"><img src="path/to/twitter/image" alt="Twitter" /></a>
              <a href="https://instagram.com"><img src="path/to/insta/image" alt="Instagram" /></a>
            </div>
          </div>
        </div>

        <hr />

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Edmund. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="/terms">Terms & conditions</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/security">Security</a>
            <a href="/cookie">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
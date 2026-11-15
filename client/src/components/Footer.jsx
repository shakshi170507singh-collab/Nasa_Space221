
import "./Footer.css";

function Footer() {
  return (
    <footer className="space-footer">

      <div className="footer-top">

        {/* ABOUT */}
        <div className="footer-about">
          <h2 className="footer-logo">
            <span>✦</span> SPACE MUSEUM
          </h2>

          <p className="footer-description">
            The universe is full of wonders waiting to be discovered.
            Space Museum is your gateway to exploring planets, galaxies,
            celestial bodies and the mysteries beyond Earth.
          </p>

          <p className="footer-tagline">
            LOOK UP. DREAM BIG. EXPLORE BEYOND.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-links">
          <h3>EXPLORE</h3>
          <a href="/">Home</a>
          <a href="/explore">Explore the Universe</a>
          <a href="/quiz">Space Quiz</a>
        </div>

        {/* DISCOVER */}
        <div className="footer-links">
          <h3>DISCOVER</h3>
          <a href="https://science.nasa.gov/solar-system/" target="_blank" rel="noreferrer">Solar System</a>
          <a href="https://science.nasa.gov/universe/" target="_blank" rel="noreferrer">Galaxies & Universe</a>
          <a href="https://science.nasa.gov/moon/" target="_blank" rel="noreferrer">The Moon</a>
         
        </div>

        
      </div>

      {/* COSMIC BANNER */}
      <div className="footer-banner">
        <h2>THE UNIVERSE HAS NO LIMITS.</h2>
        <p>AND NEITHER SHOULD YOUR CURIOSITY.</p>
        <span>✦</span>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>© 2026 SPACE MUSEUM. ALL RIGHTS RESERVED.</p>

        <p className="footer-credit">
          MADE WITH <span>♥</span> FOR THE LOVE OF SPACE
        </p>

        <a href="#top" className="back-top">BACK TO TOP ↑</a>
      </div>

    </footer>
  );
}

export default Footer;

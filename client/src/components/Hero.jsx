
import "./Hero.css";


function Hero() {
  return (
    <div className="space-zero">

      {/* Background video */}
      <video
        className="space-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/space123.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="video-overlay"></div>

      {/* Hero section */}
      <section className="hero">
        <div className="hero-content">

          <p className="hero-eyebrow">
            <span className="eyebrow-line"></span>
            JOURNEY BEYOND THE KNOWN
            <span className="eyebrow-line"></span>
          </p>

          <h1 className="hero-title">
            <span className="title-space">SPACE</span>
            <span className="title-museum">MUSEUM</span>
          </h1>

          <p className="hero-subtitle">
            THE UNIVERSE IS WAITING TO BE DISCOVERED.
          </p>

          <p className="hero-description">
            Explore distant galaxies, uncover cosmic mysteries,
            and experience the wonders of our universe — all in one place.
          </p>

          <div className="hero-actions">
            

            <a href="#about" className="hero-btn secondary-btn">
              DISCOVER MORE
            </a>
          </div>

          <div className="hero-caption">
            <span>01 / 04</span>
            <span className="caption-line"></span>
            <span>AN INTERACTIVE COSMIC EXPERIENCE</span>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Hero;

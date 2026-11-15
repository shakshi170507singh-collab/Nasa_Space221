
import "./Explore.css";


function Explore() {
  const destinations = [
    {
      name: "THE MOON",
      description: "Our closest celestial neighbour.",
      image:
        "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=900",
      tag: "EARTH'S SATELLITE",
    },
    {
      name: "MARS",
      description: "Discover the mysterious red planet.",
      image:
        "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=900",
      tag: "THE RED PLANET",
    },
    
  ];

  return (
    <div className="explore-page">

      <nav className="explore-nav">
        
        <span>SPACE MUSEUM / EXPLORE</span>
      </nav>
      <a href="/" className="back-home">← HOME</a>
      <section className="explore-heading">
        <p className="explore-eyebrow">A JOURNEY BEYOND EARTH</p>

        <h1>
          EXPLORE THE <span>UNIVERSE</span>
        </h1>

        <p className="explore-intro">
          From distant galaxies to mysterious planets,
          discover the wonders hidden across our universe.
        </p>
      </section>

      <section className="destination-grid">
        {destinations.map((planet, index) => (
          <div className="destination-card" key={index}>
            <img src={planet.image} alt={planet.name} />

            <div className="card-overlay">
              <span className="planet-tag">{planet.tag}</span>
              <h2>{planet.name}</h2>
              <p>{planet.description}</p>
              <span className="discover-link">
                DISCOVER MORE ↗
              </span>
            </div>
          </div>
        ))}
      </section>

      <footer className="explore-footer">
        <p>THE UNIVERSE IS WAITING.</p>
        <span>SPACE MUSEUM © 2026</span>
      </footer>

    </div>
  );
}

export default Explore;

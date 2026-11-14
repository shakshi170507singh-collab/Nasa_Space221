
import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <div className="space-hero">

      {/* Navbar */}
      <nav className="navbar">

        {/* Logo */}
        <div className="nav-logo">
          <span className="logo-icon">✦</span>
          <span>SPACE MUSEUM</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <a href="#home" className="active">Home</a>
          <a href="#explore">Explore</a>
          <a href="#quiz">Quiz</a>
          <a href="#about">About Us</a>
        </div>

        {/* CTA Button */}
        <a href="#explore" className="nav-button">
          Discover Space <span>↗</span>
        </a>

      </nav>

    </div>
  );
}

export default Navbar;

import React from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Explore from "./components/Explore";
import Quiz from "./components/Quiz";
import Footer from "./components/Footer";



function App() {
  
  
  return(
  <>
  <Navbar/> 
  <Hero />
  <Explore />
  <Quiz/>
  <Footer/>
  </>
  );
}

export default App;
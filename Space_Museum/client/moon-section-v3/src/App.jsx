import React, { Suspense, lazy } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Explore from "./components/Explore";
import Quiz from "./components/Quiz";
import Footer from "./components/Footer";
import SafeSection from "./components/SafeSection";

// The Moon section carries the 3D code, so it loads in its own chunk and the Hero stays fast.
const MoonExplorer = lazy(() => import("./components/MoonExplorer"));



function App() {
  
  
  return(
  <>
  <Navbar/> 
  <Hero />
  <Explore />
  <SafeSection
    fallback={
      <section id="moon" style={{ padding: "80px 7%", background: "#050711", color: "#aab0c1", textAlign: "center" }}>
        The Moon section could not load. Please refresh the page.
      </section>
    }
  >
    <Suspense fallback={<section id="moon" style={{ minHeight: "100vh", background: "#050711" }} />}>
      <MoonExplorer />
    </Suspense>
  </SafeSection>
  <Quiz/>
  <Footer/>
  </>
  );
}

export default App;
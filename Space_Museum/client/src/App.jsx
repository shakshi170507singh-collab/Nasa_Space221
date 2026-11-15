import { Suspense, lazy } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Explore from "./components/Explore";
import Quiz from "./components/Quiz";
import Footer from "./components/Footer";
import SafeSection from "./components/SafeSection";
import "./components/MoonFallback.css";

const MoonExplorer = lazy(() => import("./components/MoonExplorer"));



function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Explore />
      <SafeSection
        fallback={
          <section id="moon" className="moon-load-fallback" role="alert">
            The Moon exhibit could not load. Please refresh the page.
          </section>
        }
      >
        <Suspense fallback={<section id="moon" className="moon-load-fallback">Loading the Moon exhibit…</section>}>
          <MoonExplorer />
        </Suspense>
      </SafeSection>
      <Quiz />
      <Footer />
    </>
  );
}

export default App;

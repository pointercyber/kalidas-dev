import Intro from "./Intro";
import Background from "./Background";
import Cursor from "./Cursor";
import { Hero, Marquee, Drop, Work, Services, Process, About, Contact } from "./sections";

export default function App() {
  return (
    <>
      <Intro />
      <Background />
      <Cursor />
      <div id="bar" />
      <header className="z">
        <a href="#top">Kalidas.</a>
        <nav><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
      </header>
      <main id="top">
        <Hero />
        <Marquee text="Developer — Designer — Builder — Developer — Designer — Builder —" k={-0.6} />
        <Drop />
        <Work />
        <Services />
        <Marquee text="Let’s build — Let’s build — Let’s build — Let’s build —" k={0.6} o={-120} outline />
        <Process />
        <About />
        <Contact />
      </main>
      <footer className="z"><span>© 2026 Kalidas R.</span><span>Designed with intention.</span></footer>
    </>
  );
}

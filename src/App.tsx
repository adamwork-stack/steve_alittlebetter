import { useSkillCards } from "./hooks/useSkillCards";

export default function App() {
  const skillLayerRef = useSkillCards();

  return (
    <>
      <div className="wrap">
        <header>
          <span className="logo">Steve Kravchenko</span>
          <nav>
            <a
              href="https://www.linkedin.com/in/Steve-Kravchenko-680670/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a href="https://github.com/SteveKravchenko" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="tel:+14406552947">440-655-2947</a>
          </nav>
        </header>

        <main>
          <img
            className="portrait"
            src="/steve.png"
            alt="Steve Kravchenko"
            width={560}
            height={560}
          />

          <p className="intro">Hi, I’m Steve Kravchenko, and I build robust software.</p>
          <p className="sub">Full-stack application developer / software engineer · Cleveland, Ohio</p>
          <a className="cta" href="mailto:Cmakota@gmail.com">
            Let’s talk or grab a coffee?
          </a>

          <section className="pitch" aria-label="Summary">
            <p>
              I don&apos;t iterate toward the right answer. I start there ⌖. <strong>27+ years</strong> of building{" "}
              <strong>scalable, battle-tested</strong> ⚔ systems means your problem isn&apos;t new to me — just the{" "}
              <strong>complete solution</strong> ◉ I deliver for it is.
            </p>
          </section>
        </main>
      </div>
      <div ref={skillLayerRef} className="skill-cards-layer" aria-hidden />
    </>
  );
}

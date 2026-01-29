import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="logo-wrap">
          <img src="/vuevocale.svg" alt="VueVocale logo" className="logo" />
          <span className="logo-text">VueVocale</span>
        </div>
        <nav className="nav">
          <Link href="#features">Features</Link>
          <Link href="#how">How it works</Link>
          <Link href="#faq">FAQ</Link>
          <Link href="/app" className="btn btn-ghost">Open app</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="pill">Conversational French, in the moment</p>
          <h1>
            Speak about the world around you,
            <span className="accent"> in real French</span>.
          </h1>
          <p className="sub">
            VueVocale turns everyday objects into instant conversation prompts.
            Scan, talk, listen, and build fluency the way people actually speak.
          </p>
          <div className="cta-row">
            <Link href="/signin" className="btn btn-primary">
              Sign in
            </Link>
            <Link href="/app" className="btn btn-secondary">
              Try the demo
            </Link>
          </div>
          <div className="mini">
            No flashcards. No drills. Just low-pressure, real-world conversation.
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-top">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
          <div className="hero-screen">
            <div className="screen-badge">Live object scan</div>
            <div className="scan-ring" />
            <div className="scan-label">
              <span>Detected:</span>
              <strong>chapeau / hat</strong>
            </div>
            <div className="chat-bubble">
              Tu préfères le porter en ville ou en voyage ?
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <h2>Why it clicks for intermediate learners</h2>
        <div className="feature-grid">
          <div className="feature">
            <h3>Visual grounding</h3>
            <p>Camera-based prompts keep conversations concrete and easy to start.</p>
          </div>
          <div className="feature">
            <h3>Speech-first practice</h3>
            <p>Talk naturally and hear it back with friendly, native-like TTS.</p>
          </div>
          <div className="feature">
            <h3>On-demand grammar fixes</h3>
            <p>Get corrections only when you ask—no interruptions or lectures.</p>
          </div>
          <div className="feature">
            <h3>Fast, lightweight AI</h3>
            <p>Optimized pipeline keeps latency low and the flow conversational.</p>
          </div>
        </div>
      </section>

      <section id="how" className="section how">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <span>1</span>
            <p>Scan an object around you.</p>
          </div>
          <div className="step">
            <span>2</span>
            <p>Start a French-only chat about it.</p>
          </div>
          <div className="step">
            <span>3</span>
            <p>Listen, respond, and refine.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="section faq">
        <h2>FAQ</h2>
        <div className="faq-grid">
          <div>
            <h4>Is this for beginners?</h4>
            <p>It is best for learners who already know basic grammar and want speaking fluency.</p>
          </div>
          <div>
            <h4>Do I need to speak perfectly?</h4>
            <p>No. VueVocale is designed for imperfect, natural speech.</p>
          </div>
          <div>
            <h4>Can I type instead of speak?</h4>
            <p>Yes. You can switch between text and voice at any time.</p>
          </div>
        </div>
      </section>

      <section className="section cta">
        <h2>Ready to practice French the way you actually use it?</h2>
        <Link href="/signin" className="btn btn-primary">
          Sign in to start
        </Link>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} VueVocale</span>
        <span>Built for real-life French.</span>
      </footer>
    </div>
  );
}

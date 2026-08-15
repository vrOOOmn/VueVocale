import Link from "next/link";
import Image from "next/image";
import { colors, spacing, typography } from "../theme";

const STEPS = [
  {
    number: "01",
    title: "Scan",
    body: "Point your camera at anything around you. VueVocale identifies it and gives you the French word instantly.",
  },
  {
    number: "02",
    title: "Converse",
    body: "Talk about it out loud or by text with an AI companion that replies in natural, conversational French.",
  },
  {
    number: "03",
    title: "Improve",
    body: "Ask for grammar feedback on demand and hear correct pronunciation with on-tap text-to-speech.",
  },
];

const FEATURES = [
  {
    title: "Camera-based object detection",
    body: "Your surroundings become conversation starters instead of a static vocabulary list.",
  },
  {
    title: "Context-aware conversation",
    body: "The AI keeps the topic grounded in what you just scanned, so responses stay relevant.",
  },
  {
    title: "Hands-free speech input",
    body: "Speak naturally and let speech-to-text handle the rest — no typing required.",
  },
  {
    title: "On-demand playback",
    body: "Hear any reply spoken aloud to build listening comprehension alongside speaking.",
  },
  {
    title: "Grammar feedback, on request",
    body: "Correction is available whenever you want it, without interrupting the flow of conversation.",
  },
  {
    title: "Mobile-first by design",
    body: "Built for quick, frequent practice sessions on the device already in your pocket.",
  },
];

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100svh",
        background: colors.ivory,
        color: colors.navy,
      }}
    >
      {/* Nav */}
      <header
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: `${spacing.lg}px ${spacing.lg}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/vuevocale.svg" alt="" width={28} height={28} priority />
          <span
            style={{
              fontFamily: typography.header.fontFamily,
              fontWeight: 700,
              fontSize: 19,
              color: colors.navy,
            }}
          >
            VueVocale
          </span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#how-it-works" className="lp-nav-link">
            How it works
          </a>
          <a href="#features" className="lp-nav-link">
            Features
          </a>
          <Link href="/app" className="lp-btn lp-btn-primary" style={{ padding: "10px 20px", fontSize: 15 }}>
            Launch App
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: `${spacing.xl}px ${spacing.lg}px ${spacing.xl * 2}px`,
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-block",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.4,
              color: colors.electric,
              background: "rgba(49, 104, 255, 0.1)",
              borderRadius: 999,
              padding: "6px 14px",
              marginBottom: 20,
            }}
          >
            AI-powered spoken French practice
          </span>
          <h1
            style={{
              fontFamily: typography.display.fontFamily,
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.15,
              margin: 0,
              color: colors.navy,
            }}
          >
            Point your camera.
            <br />
            Say what you see.
            <br />
            Actually speak French.
          </h1>
          <p
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: 18,
              lineHeight: 1.6,
              color: colors.textMuted,
              marginTop: 20,
              maxWidth: 480,
            }}
          >
            VueVocale turns everyday objects into conversation starters, then lets
            you practice speaking naturally with an AI companion — no vocab lists,
            no multiple choice.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
            <Link href="/app" className="lp-btn lp-btn-primary">
              Launch App
            </Link>
            <a href="#how-it-works" className="lp-btn lp-btn-secondary">
              See how it works
            </a>
          </div>
          <p
            style={{
              fontFamily: typography.display.fontFamily,
              fontStyle: "italic",
              fontSize: 17,
              color: colors.brass,
              marginTop: 18,
            }}
          >
            avec nuance
          </p>
        </div>

        <PhoneMockup />
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: `${spacing.xl}px ${spacing.lg}px`,
        }}
      >
        <SectionHeading eyebrow="How it works" title="From a glance to a conversation" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginTop: 36,
          }}
        >
          {STEPS.map((step) => (
            <div key={step.number} className="lp-step-card">
              <span
                style={{
                  fontFamily: typography.header.fontFamily,
                  fontWeight: 700,
                  fontSize: 14,
                  color: "rgba(49, 104, 255, 0.35)",
                  letterSpacing: 1,
                }}
              >
                {step.number}
              </span>
              <h3
                style={{
                  fontFamily: typography.header.fontFamily,
                  fontWeight: 700,
                  fontSize: 20,
                  margin: "10px 0 8px",
                  color: colors.navy,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: typography.body.fontFamily,
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: colors.textMuted,
                  margin: 0,
                }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: `${spacing.xl}px ${spacing.lg}px`,
        }}
      >
        <SectionHeading eyebrow="Features" title="Built for real conversational practice" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
            marginTop: 36,
          }}
        >
          {FEATURES.map((feature) => (
            <div key={feature.title} className="lp-feature-card">
              <h3
                style={{
                  fontFamily: typography.header.fontFamily,
                  fontWeight: 700,
                  fontSize: 17,
                  margin: "0 0 8px",
                  color: colors.navy,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontFamily: typography.body.fontFamily,
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: colors.textMuted,
                  margin: 0,
                }}
              >
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: `${spacing.xl}px ${spacing.lg}px ${spacing.xl * 1.5}px`,
        }}
      >
        <div
          style={{
            borderRadius: borderRadiusXl,
            padding: "48px 32px",
            textAlign: "center",
            background: colors.electric,
            boxShadow: "0 20px 50px rgba(49, 104, 255, 0.3)",
          }}
        >
          <h2
            style={{
              fontFamily: typography.display.fontFamily,
              fontWeight: 400,
              fontSize: "clamp(24px, 3vw, 36px)",
              color: "#fff",
              margin: "0 0 12px",
            }}
          >
            Ready to start talking?
          </h2>
          <p
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: 16,
              color: "rgba(255,255,255,0.85)",
              margin: "0 0 28px",
            }}
          >
            No sign-up friction. Scan something nearby and start your first conversation.
          </p>
          <Link
            href="/app"
            className="lp-btn"
            style={{ background: "#fff", color: colors.electric, padding: "14px 30px" }}
          >
            Launch App
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: `${spacing.lg}px ${spacing.lg}px ${spacing.xl}px`,
          textAlign: "center",
          fontFamily: typography.body.fontFamily,
          fontSize: 13,
          color: colors.textMuted,
        }}
      >
        VueVocale — built by Varun Narayanan
      </footer>
    </div>
  );
}

const borderRadiusXl = 28;

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: colors.brass,
          marginBottom: 8,
        }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontFamily: typography.display.fontFamily,
          fontWeight: 400,
          fontSize: "clamp(22px, 3vw, 34px)",
          margin: 0,
          color: colors.navy,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 280,
          borderRadius: 36,
          background: colors.paper,
          border: `1px solid ${colors.hairline}`,
          boxShadow: "0 30px 60px rgba(17, 27, 63, 0.14)",
          padding: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 60,
              height: 5,
              borderRadius: 999,
              background: colors.hairline,
            }}
          />
        </div>

        <div
          style={{
            borderRadius: 20,
            height: 140,
            background: "linear-gradient(135deg, #FDE68A, #F97316)",
            position: "relative",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              background: colors.navy,
              color: "#fff",
              fontFamily: typography.body.fontFamily,
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 999,
              padding: "5px 10px",
            }}
          >
            🍊 orange
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            className="lp-bubble"
            style={{
              alignSelf: "flex-end",
              maxWidth: "80%",
              background: colors.electric,
              color: "#fff",
              borderRadius: "16px 16px 4px 16px",
              padding: "9px 13px",
              fontFamily: typography.body.fontFamily,
              fontSize: 13.5,
              animationDelay: "0.1s",
            }}
          >
            C&apos;est sucré et un peu acide, non&nbsp;?
          </div>
          <div
            className="lp-bubble"
            style={{
              alignSelf: "flex-start",
              maxWidth: "85%",
              background: colors.mist,
              color: colors.navy,
              borderRadius: "16px 16px 16px 4px",
              padding: "9px 13px",
              fontFamily: typography.body.fontFamily,
              fontSize: 13.5,
              animationDelay: "0.35s",
            }}
          >
            Exactement&nbsp;! Tu en manges souvent le matin&nbsp;?
          </div>
        </div>
      </div>
    </div>
  );
}

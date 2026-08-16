"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IoCheckmarkCircle, IoCloseOutline, IoMenuOutline, IoMic, IoMicOutline, IoVolumeHighOutline } from "react-icons/io5";
import BrandMark from "./BrandMark";
import { colors, spacing, typography } from "../theme";

// Grounded in the real product (src/routes/Scanner.tsx, Chat.tsx,
// MessageBubble.tsx) — not marketing fluff. No bounding boxes, no
// pronunciation score, no fabricated timing: those features don't exist.
const HOW_IT_WORKS_STEPS = [
  {
    id: "scan",
    number: "01",
    title: "Scan",
    subtitle: "Snap a photo — get the word instantly",
    dotColor: colors.citrusObject,
    state: {
      title: "Scan step active",
      body: "One photo is enough. VueVocale's vision model names what you're looking at in French and English — no bounding boxes, no live scanning.",
      highlights: [
        "Identifies the object in your photo",
        "Names it in French and English",
        "One tap hands it straight to your AI companion",
      ],
    },
  },
  {
    id: "converse",
    number: "02",
    title: "Converse",
    subtitle: "Your AI French companion opens the conversation",
    dotColor: colors.skyAI,
    state: {
      title: "Converse step active",
      body: "Talk it out loud or type — your AI French companion replies in natural spoken French, grounded in what you just scanned, one question at a time.",
      highlights: [
        "Speaks every reply aloud in French",
        "Stays grounded in your photo, not a generic drill",
        "Answers your voice, not just your typing",
      ],
    },
  },
  {
    id: "refine",
    number: "03",
    title: "Refine",
    subtitle: "Tap for a grammar check, only when you want one",
    dotColor: colors.rouge,
    state: {
      title: "Refine step active",
      body: "Correction is opt-in — one button under any message. Never automatic, never interrupts the conversation.",
      highlights: [
        "One tap: “Corriger la grammaire”",
        "Skip it and keep talking, no penalty",
        "Never automatic, never a pop-up",
      ],
    },
  },
] as const;

const PAGE_MAX_WIDTH = 1312;
// One consistent vertical rhythm for every major section — the page is
// short enough to afford generous, uniform spacing rather than ad hoc values.
const SECTION_PAD_Y = "clamp(56px, 7.5vw, 96px)";
// The nav is compact by nature, so the gap into the hero should read
// noticeably tighter than the rhythm between the sections below it.
const HERO_TOP_PAD = "clamp(8px, 1.2vw, 16px)";
// Side margins that grow with viewport width instead of a fixed 24px everywhere.
const SIDE_PAD = "clamp(24px, 6vw, 80px)";
// Every section header (How it works / Features / CTA) shares this exact size.
const SECTION_TITLE_SIZE = "clamp(26px, 4vw, 42px)";

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

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
          position: "relative",
          maxWidth: PAGE_MAX_WIDTH,
          margin: "0 auto",
          padding: `${spacing.md}px ${SIDE_PAD}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <BrandMark
          logoSize={34}
          style={{ gap: 12 }}
          textClassName="lp-brand"
          textStyle={{
            fontFamily: typography.header.fontFamily,
            fontWeight: 700,
            color: colors.navy,
          }}
        />
        <nav className="lp-nav-links">
          <a href="#how-it-works" className="lp-nav-link">
            Method
          </a>
          <a href="#features" className="lp-nav-link">
            Practice
          </a>
          <a href="#cta" className="lp-nav-link">
            Progress
          </a>
          <Link
            href="/app"
            className="lp-btn"
            style={{
              background: "#2F65F6",
              color: "#fff",
              borderRadius: 16,
              padding: "12px 22px",
              fontSize: 16,
            }}
          >
            Launch
          </Link>
        </nav>

        <button
          type="button"
          className="lp-nav-toggle"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <IoCloseOutline size={22} /> : <IoMenuOutline size={22} />}
        </button>

        {mobileMenuOpen && (
          <nav className="lp-nav-mobile-panel" aria-label="Mobile">
            <a href="#how-it-works" className="lp-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Method
            </a>
            <a href="#features" className="lp-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Practice
            </a>
            <a href="#cta" className="lp-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Progress
            </a>
            <Link
              href="/app"
              className="lp-btn"
              style={{
                background: "#2F65F6",
                color: "#fff",
                borderRadius: 16,
                padding: "10px 20px",
                fontSize: 15,
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Launch
            </Link>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: PAGE_MAX_WIDTH,
          margin: "0 auto",
          padding: `${HERO_TOP_PAD} ${SIDE_PAD} ${SECTION_PAD_Y}`,
        }}
      >
        <div className="lp-hero-grid">
        <div>
          <span
            style={{
              display: "inline-block",
              fontFamily: typography.header.fontFamily,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.4,
              color: colors.paper,
              background: colors.navy,
              borderRadius: 8,
              padding: "9px 18px",
              marginBottom: 32,
            }}
          >
            PARISIAN AI PRACTICE
          </span>
          <h1
            style={{
              fontFamily: typography.display.fontFamily,
              fontWeight: 400,
              fontSize: "clamp(24px, 3.75vw, 57px)",
              lineHeight: 1.12,
              margin: 0,
              color: colors.navy,
            }}
          >
            Capture the room.
            <br />
            Name it in French.
            <br />
            Speak with confidence.
          </h1>
          <div
            style={{
              width: "100%",
              maxWidth: 500,
              height: 1,
              background: colors.brass,
              margin: "40px 0 32px",
            }}
          />
          <p
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: "clamp(15px, 4vw, 20px)",
              lineHeight: 1.65,
              color: "#4F5B6F",
              margin: 0,
              maxWidth: 580,
            }}
          >
            VueVocale turns the objects around you into short French
            conversations — like chatting with a local at a café abroad,
            minus the plane ticket. Grammar correction is there when you tap
            for it, never automatic.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 44, flexWrap: "wrap" }}>
            <Link href="/app" className="lp-btn lp-btn-primary">
              Start speaking
            </Link>
            <a href="#how-it-works" className="lp-btn lp-btn-secondary">
              See method
            </a>
            <span
              style={{
                fontFamily: typography.display.fontFamily,
                fontStyle: "italic",
                fontSize: 18,
                color: colors.brass,
              }}
            >
              avec nuance
            </span>
          </div>
        </div>

          <PhoneMockup />
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        style={{
          maxWidth: PAGE_MAX_WIDTH,
          margin: "0 auto",
          padding: `${SECTION_PAD_Y} ${SIDE_PAD}`,
        }}
      >
        <div
          style={{
            background: colors.paper,
            border: `1px solid ${colors.hairline}`,
            borderRadius: borderRadiusXl,
            padding: "clamp(32px, 6vw, 56px)",
            boxShadow: "0 16px 42px rgba(24, 29, 48, 0.08)",
          }}
        >
          <div style={{ maxWidth: 640, marginBottom: 48 }}>
            <span
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                color: colors.brass,
                marginBottom: 12,
              }}
            >
              How it works
            </span>
            <h2
              style={{
                fontFamily: typography.display.fontFamily,
                fontWeight: 400,
                fontSize: SECTION_TITLE_SIZE,
                margin: 0,
                color: colors.navy,
              }}
            >
              From a glance to a conversation
            </h2>
            <p
              style={{
                fontFamily: typography.body.fontFamily,
                fontSize: "clamp(15px, 3.6vw, 16.5px)",
                lineHeight: 1.6,
                color: colors.textMuted,
                marginTop: 16,
              }}
            >
              Three real steps, not a slideshow — pick one to see exactly what your AI French companion
              does.
            </p>
          </div>

          <div className="lp-how-body">
            <div className="lp-steps" role="group" aria-label="Practice steps">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  className="lp-step-btn"
                  aria-pressed={activeStep === index}
                  onClick={() => setActiveStep(index)}
                >
                  <span className="lp-step-num">{step.number}</span>
                  <span>
                    <strong className="lp-step-title">{step.title}</strong>
                    <span className="lp-step-subtitle">{step.subtitle}</span>
                  </span>
                  <span className="lp-step-dot" style={{ background: step.dotColor }} />
                </button>
              ))}
            </div>

            <StepPhonePreview stepId={HOW_IT_WORKS_STEPS[activeStep].id} />

            <aside
              aria-label="Live product state"
              style={{
                background: colors.navy,
                borderRadius: 22,
                padding: 36,
                color: "#fff",
                display: "grid",
                alignContent: "center",
                gap: 20,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: colors.skyAI,
                }}
              >
                Live product state
              </span>
              <h3
                style={{
                  fontFamily: typography.header.fontFamily,
                  fontWeight: 700,
                  fontSize: "clamp(22px, 5vw, 27px)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {HOW_IT_WORKS_STEPS[activeStep].state.title}
              </h3>
              <p
                style={{
                  fontFamily: typography.body.fontFamily,
                  fontSize: "clamp(14.5px, 3.6vw, 15.5px)",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.82)",
                  margin: 0,
                }}
              >
                {HOW_IT_WORKS_STEPS[activeStep].state.body}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginTop: 4,
                }}
              >
                {HOW_IT_WORKS_STEPS[activeStep].state.highlights.map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 14,
                      lineHeight: 1.4,
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    <IoCheckmarkCircle size={18} color={colors.skyAI} style={{ flexShrink: 0, marginTop: 1 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{
          maxWidth: PAGE_MAX_WIDTH,
          margin: "0 auto",
          padding: `${SECTION_PAD_Y} ${SIDE_PAD}`,
        }}
      >
        <SectionHeading eyebrow="Inside the app" title="Every feature is something you'll actually tap" />
        <div className="lp-feature-grid" style={{ marginTop: 48 }}>
          <article className="lp-feature-card lp-fragment" style={{ gridColumn: "span 2" }}>
            <div>
              <h3 className="lp-fragment-title">Snap a photo, get the word</h3>
              <p className="lp-fragment-body">
                A single photo is enough — no bounding boxes, no live scanning. Just the French word and its
                English translation.
              </p>
            </div>
            <div
              style={{
                borderRadius: 16,
                height: 80,
                background: colors.mist,
                border: `1px solid ${colors.hairline}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  bottom: 10,
                  background: colors.navy,
                  color: colors.paper,
                  fontSize: 11.5,
                  fontWeight: 700,
                  borderRadius: 999,
                  padding: "5px 11px",
                }}
              >
                une orange
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: colors.citrusObject, marginTop: 20 }} />
          </article>

          <article className="lp-feature-card lp-fragment" style={{ gridColumn: "span 2" }}>
            <div>
              <h3 className="lp-fragment-title">Your AI companion, not a script</h3>
              <p className="lp-fragment-body">
                It opens with a real, spoken question about your photo — always in French, one question at
                a time.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "88%",
                  background: "#F4F0FF",
                  border: "1px solid #D8D0FF",
                  color: colors.navy,
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 12.5,
                }}
              >
                Je vois une orange&nbsp;!
              </span>
              <span
                style={{
                  alignSelf: "flex-end",
                  maxWidth: "88%",
                  background: colors.electric,
                  color: "#fff",
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                Oui, j&apos;adore ça.
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: colors.skyAI, marginTop: 20 }} />
          </article>

          <article className="lp-feature-card lp-fragment" style={{ gridColumn: "span 2" }}>
            <div>
              <h3 className="lp-fragment-title">Hear your companion talk back</h3>
              <p className="lp-fragment-body">
                Pick your microphone, tap to record, and hear every reply spoken aloud in natural French —
                a real conversation, not a transcript.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: colors.electric,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IoMic size={24} color="#fff" />
              </div>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: colors.electric, marginTop: 20 }} />
          </article>

          <article className="lp-feature-card lp-fragment" style={{ gridColumn: "span 3" }}>
            <div>
              <h3 className="lp-fragment-title">Not a red pen — a tap when you want one</h3>
              <p className="lp-fragment-body">
                Every message has a “Corriger la grammaire” button. Skip it and keep chatting, or tap it for
                one focused fix.
              </p>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <div
                style={{
                  borderRadius: 14,
                  background: "rgba(30, 167, 131, 0.12)",
                  border: "1px solid rgba(30, 167, 131, 0.35)",
                  color: colors.mint,
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: "12px 16px",
                }}
              >
                ✓ Bien&nbsp;!
              </div>
              <div
                style={{
                  borderRadius: 14,
                  background: "rgba(185, 74, 72, 0.08)",
                  border: `1px solid ${colors.rouge}`,
                  color: colors.rouge,
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: "12px 16px",
                }}
              >
                ➡ une orange
              </div>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: colors.rouge, marginTop: 20 }} />
          </article>

          <article className="lp-feature-card lp-fragment" style={{ gridColumn: "span 3" }}>
            <div>
              <h3 className="lp-fragment-title">One conversation a day</h3>
              <p className="lp-fragment-body">
                Each day&apos;s chat rolls into your Historique automatically when you come back — return
                daily and the streak badge grows.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  background: colors.navy,
                  color: "#fff",
                  borderRadius: 999,
                  padding: "10px 16px",
                  fontWeight: 700,
                  fontSize: 14.5,
                }}
              >
                🔥 4
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: i < 3 ? colors.lavenderProgress : colors.hairline,
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: colors.lavenderProgress, marginTop: 20 }} />
          </article>
        </div>
      </section>

      {/* CTA band */}
      <section
        id="cta"
        style={{
          maxWidth: PAGE_MAX_WIDTH,
          margin: "0 auto",
          padding: `${SECTION_PAD_Y} ${SIDE_PAD}`,
        }}
      >
        <div
          style={{
            borderRadius: borderRadiusXl,
            padding: "clamp(48px, 9vw, 72px) 40px",
            textAlign: "center",
            background: colors.electric,
            boxShadow: "0 20px 50px rgba(49, 104, 255, 0.3)",
          }}
        >
          <h2
            style={{
              fontFamily: typography.display.fontFamily,
              fontWeight: 400,
              fontSize: SECTION_TITLE_SIZE,
              color: "#fff",
              margin: "0 0 20px",
            }}
          >
            Ready to start talking?
          </h2>
          <p
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: "clamp(15px, 3.8vw, 18px)",
              color: "rgba(255,255,255,0.85)",
              margin: "0 0 36px",
            }}
          >
            No sign-up friction. Scan something nearby and start your first conversation.
          </p>
          <Link
            href="/app"
            className="lp-btn"
            style={{ background: "#fff", color: colors.electric, padding: "16px 34px", fontSize: 16 }}
          >
            Launch App
          </Link>
        </div>
      </section>
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
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: colors.brass,
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontFamily: typography.display.fontFamily,
          fontWeight: 400,
          fontSize: SECTION_TITLE_SIZE,
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
      <div style={{ position: "relative" }}>
        {/* Speaker/mic accents — this is a spoken-conversation app, not a
            texting app, so the phone mockup should read that way at a
            glance. */}
        <IoVolumeHighOutline
          size={56}
          color={colors.electric}
          style={{
            position: "absolute",
            top: -30,
            right: -38,
            transform: "rotate(8deg)",
            opacity: 0.8,
          }}
        />
        <IoMicOutline
          size={46}
          color={colors.electric}
          style={{
            position: "absolute",
            bottom: -18,
            left: -30,
            transform: "rotate(-10deg)",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            width: 330,
            borderRadius: 40,
            background: colors.paper,
            border: `1px solid ${colors.hairline}`,
            boxShadow: "0 30px 60px rgba(17, 27, 63, 0.14)",
            padding: 18,
          }}
        >
        <div
          style={{
            borderRadius: 26,
            height: 212,
            background: colors.mist,
            border: `1px solid ${colors.hairline}`,
            position: "relative",
            overflow: "hidden",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 78,
              background: colors.skyAI,
            }}
          />
          <span
            style={{
              position: "absolute",
              left: 24,
              bottom: 50,
              background: colors.navy,
              color: colors.paper,
              fontFamily: typography.body.fontFamily,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 999,
              padding: "7px 14px",
            }}
          >
            une orange
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            className="lp-bubble"
            style={{
              alignSelf: "flex-start",
              maxWidth: "88%",
              background: "#F4F0FF",
              border: "1px solid #D8D0FF",
              color: colors.navy,
              borderRadius: 20,
              padding: "12px 17px",
              fontFamily: typography.body.fontFamily,
              fontSize: 15,
              lineHeight: 1.5,
              animationDelay: "0.1s",
            }}
          >
            Je vois une orange&nbsp;! Tu en manges souvent&nbsp;?
          </div>
          <div
            className="lp-bubble"
            style={{
              alignSelf: "flex-end",
              maxWidth: "82%",
              background: colors.electric,
              color: "#fff",
              borderRadius: 20,
              padding: "12px 17px",
              fontFamily: typography.body.fontFamily,
              fontWeight: 500,
              fontSize: 16,
              animationDelay: "0.35s",
            }}
          >
            Presque tous les matins&nbsp;!
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function StepPhonePreview({ stepId }: { stepId: (typeof HOW_IT_WORKS_STEPS)[number]["id"] }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 300,
          borderRadius: 32,
          background: colors.paper,
          border: `1px solid ${colors.hairline}`,
          boxShadow: "0 18px 36px rgba(24, 29, 48, 0.12)",
          padding: 16,
        }}
      >
        <div
          style={{
            width: 52,
            height: 5,
            borderRadius: 999,
            background: colors.hairline,
            margin: "0 auto 16px",
          }}
        />
        {stepId === "scan" && <ScanPreview />}
        {stepId === "converse" && <ConversePreview />}
        {stepId === "refine" && <RefinePreview />}
      </div>
    </div>
  );
}

function ScanPreview() {
  return (
    <div>
      <div
        style={{
          borderRadius: 20,
          height: 120,
          background: colors.mist,
          border: `1px solid ${colors.hairline}`,
          position: "relative",
          overflow: "hidden",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 13,
            bottom: 11,
            background: colors.navy,
            color: colors.paper,
            fontFamily: typography.body.fontFamily,
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 999,
            padding: "6px 11px",
          }}
        >
          une orange
        </span>
      </div>
      <p
        style={{
          fontFamily: typography.body.fontFamily,
          fontSize: 12,
          color: colors.textMuted,
          margin: "0 0 10px",
        }}
      >
        Objet détecté&nbsp;: une orange
      </p>
      <span
        style={{
          display: "inline-block",
          background: colors.electric,
          color: "#fff",
          fontFamily: typography.body.fontFamily,
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 999,
          padding: "7px 13px",
        }}
      >
        Oui, parlons-en →
      </span>
    </div>
  );
}

function ConversePreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span
        style={{
          alignSelf: "flex-start",
          maxWidth: "90%",
          background: "#F4F0FF",
          border: "1px solid #D8D0FF",
          color: colors.navy,
          fontFamily: typography.body.fontFamily,
          fontSize: 13,
          lineHeight: 1.45,
          borderRadius: 16,
          padding: "10px 14px",
        }}
      >
        Je vois une orange&nbsp;! Tu en manges souvent&nbsp;?
      </span>
      <span
        style={{
          alignSelf: "flex-end",
          maxWidth: "78%",
          background: colors.electric,
          color: "#fff",
          fontFamily: typography.body.fontFamily,
          fontWeight: 500,
          fontSize: 13,
          borderRadius: 16,
          padding: "10px 14px",
        }}
      >
        Presque tous les matins&nbsp;!
      </span>
    </div>
  );
}

function RefinePreview() {
  return (
    <div>
      <span
        style={{
          display: "inline-block",
          maxWidth: "90%",
          background: colors.electric,
          color: "#fff",
          fontFamily: typography.body.fontFamily,
          fontWeight: 500,
          fontSize: 13,
          borderRadius: 16,
          padding: "10px 14px",
          marginBottom: 12,
        }}
      >
        Je mange un orange.
      </span>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: colors.paper,
            border: `1px solid ${colors.hairline}`,
            color: colors.navy,
            fontFamily: typography.body.fontFamily,
            fontSize: 11.5,
            fontWeight: 600,
            borderRadius: 999,
            padding: "6px 11px",
          }}
        >
          Corriger la grammaire
        </span>
      </div>
      <div
        style={{
          background: "rgba(185, 74, 72, 0.08)",
          border: `1px solid ${colors.rouge}`,
          color: colors.rouge,
          fontFamily: typography.body.fontFamily,
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 14,
          padding: "10px 14px",
        }}
      >
        ➡ Je mange une orange.
      </div>
    </div>
  );
}

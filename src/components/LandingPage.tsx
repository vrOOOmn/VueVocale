"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IoCheckmarkCircle, IoCloseOutline, IoMenuOutline, IoMic, IoMicOutline, IoVolumeHighOutline } from "react-icons/io5";
import BrandMark from "./BrandMark";
import { colors, spacing, typography } from "../theme";

// Grounded in the real product (src/routes/Scanner.tsx, Chat.tsx,
// MessageBubble.tsx): no bounding boxes, no pronunciation score, no
// auto-playing audio. Each idea is stated once and in one place only —
// the same claim repeated across step body, highlights and feature card
// is what made this page read as filler.
const HOW_IT_WORKS_STEPS = [
  {
    id: "scan",
    number: "01",
    title: "Scan",
    subtitle: "Notice something. Take a picture.",
    dotColor: colors.citrusObject,
    state: {
      title: "Give the conversation a starting point",
      body: "Point the camera at something nearby and VueVocale gives you the French word for it. You have a subject, a word, and somewhere to begin.",
      highlights: [
        "French word and English meaning",
        "No topic to invent",
        "One tap takes it into the chat",
      ],
    },
  },
  {
    id: "converse",
    number: "02",
    title: "Converse",
    subtitle: "Start talking in French",
    dotColor: colors.skyAI,
    state: {
      title: "The photo starts it. Your answers take it further.",
      body: "VueVocale opens with what you scanned, then follows what you say. An orange can lead to breakfast, your morning routine, or somewhere else entirely.",
      highlights: [
        "Replies to what you said",
        "Type your answer or say it aloud",
        "Let the conversation move naturally",
      ],
    },
  },
  {
    id: "refine",
    number: "03",
    title: "Refine",
    subtitle: "Check a sentence when you want to",
    dotColor: colors.rouge,
    state: {
      title: "Say it first, fix it after",
      body: "VueVocale does not stop to correct every sentence. Keep talking, and ask for a correction only when you want to look more closely.",
      highlights: [
        "Correction is always optional",
        "Nothing to fix? It tells you that too",
        "See the corrected sentence",
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
// "How it works" is the one section that has to be readable in a single
// desktop viewport (its three-column module is meant to be taken in at a
// glance), so it runs tighter than the shared rhythm above.
const HOW_PAD_Y = "clamp(40px, 4.5vw, 56px)";
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
            Inside
          </a>
          <a href="#cta" className="lp-nav-link">
            Start
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
              Inside
            </a>
            <a href="#cta" className="lp-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Start
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
            START WITH WHAT YOU SEE
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
            Anything around you
            <br />
            can start a French
            <br />
            conversation.
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
            You can study French for years and still go quiet when it is
            your turn to speak. VueVocale gives you somewhere to begin:
            whatever is already around you.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 44, flexWrap: "wrap" }}>
            <Link href="/app" className="lp-btn lp-btn-primary">
              Start speaking
            </Link>
            <a href="#how-it-works" className="lp-btn lp-btn-secondary">
              See how it works
            </a>
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
          padding: `${HOW_PAD_Y} ${SIDE_PAD}`,
        }}
      >
        <div
          style={{
            background: colors.paper,
            border: `1px solid ${colors.hairline}`,
            borderRadius: borderRadiusXl,
            padding: "clamp(28px, 4vw, 40px)",
            boxShadow: "0 16px 42px rgba(24, 29, 48, 0.08)",
          }}
        >
          <div style={{ maxWidth: 640, marginBottom: 28 }}>
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
              Follow one conversation from the first photo to the moment you decide to check a sentence.
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
              aria-label="Details for the selected step"
              style={{
                background: colors.navy,
                borderRadius: 22,
                padding: 28,
                color: "#fff",
                display: "grid",
                alignContent: "center",
                gap: 16,
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
                In this step
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
        <SectionHeading eyebrow="Inside the app" title="What the conve feels like" />
        <div className="lp-feature-grid" style={{ marginTop: 48 }}>
          <article className="lp-feature-card lp-fragment" style={{ gridColumn: "span 2" }}>
            <div>
              <h3 className="lp-fragment-title">Vocabulary from your own life</h3>
              <p className="lp-fragment-body">
                The French you learn is attached to someth noticed, instead of a list someone chose for
                you. Your own day supplies the vocabulary.
              </p>
            </div>
            <div
              style={{
                borderRadius: 16,
                height: 80,
                background: "rgba(246, 180, 75, 0.16)",
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
              <h3 className="lp-fragment-title">There is no fixed script</h3>
              <p className="lp-fragment-body">
                VueVocale starts with your photo, then responds to what you say. A few turns later, you may be
                talking about something else entirely.
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
              <h3 className="lp-fragment-title">French you hear and say</h3>
              <p className="lp-fragment-body">
                Type when you need a moment to think, use the mic when you want to speak, and tap a reply to
                hear the French aloud.
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
              <h3 className="lp-fragment-title">Correction waits for you</h3>
              <p className="lp-fragment-body">
                Your French does not have to be perfect for the conversation to continue. Ask for a correction
                when you want to look more closely.
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
              <h3 className="lp-fragment-title">A re using French</h3>
              <p className="lp-fragment-body">
                Today&apos;s chat moves into your Historique when the day ends. Over time, you build a record
                of the things y talked about in French.
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
            Find something to talk about
          </h2>
          <p
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: "clamp(15px, 3.8vw, 18px)",
              color: "rgba(255,255,255,0.85)",
              margin: "0 0 36px",
            }}
          >
            Look around. Whatever you notice first is enough to begin.
          </p>
          <Link
            href="/app"
            className="lp-btn"
            style={{ background: "#fff", color: colors.electric, padding: "16px 34px", fontSize: 16 }}
          >
            Start a conversation
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
        {/* Speaker/mic accents: this is a spoken-conversation app, not a
            texting app, so the mockup should read that way at a glance.
            Their size and offsets live in globals.css rather than inline,
            because on phones they have to shrink and tuck in or they drag
            the whole page into horizontal scroll, and an inline style would
            win over that media query. */}
        <IoVolumeHighOutline
          size={84}
          color={colors.electric}
          className="lp-mockup-accent lp-mockup-accent-speaker"
        />
        <IoMicOutline
          size={69}
          color={colors.electric}
          className="lp-mockup-accent lp-mockup-accent-mic"
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
            background: "rgba(246, 180, 75, 0.16)",
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
              background: colors.citrusObject,
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
          background: "rgba(246, 180, 75, 0.16)",
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

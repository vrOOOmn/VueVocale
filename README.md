# **VueVocale**

**Live:** [www.vuevocale.app](https://www.vuevocale.app)

VueVocale is an interactive French learning app designed to help intermediate learners build real conversational fluency through **spoken interaction, visual context, and AI-powered dialogue**.

Rather than focusing on vocabulary lists or written exercises, VueVocale centers learning around **speaking naturally about the world around you**.

## **✨ Overview**

Many language learners understand grammar and vocabulary but struggle to speak fluidly in real situations. VueVocale is built to reduce that gap by encouraging learners to **think, react, and respond in French**.

The app combines **computer vision**, **speech**, and **conversation** to create a low-pressure environment where users can talk about familiar objects, ask questions, and practice expressing ideas as they would in everyday life.

VueVocale is meant to feel less like a lesson and more like chatting with a supportive French friend.

---

## **⚙️ App Architecture**

Built on **Next.js 15 (App Router)**, deployed on Vercel, with **Supabase** for auth, Postgres persistence, and file storage.

```
src/
├── app/
│   ├── page.tsx                # Public landing page (renders components/LandingPage.tsx)
│   ├── layout.tsx               # Root layout — fonts, viewport meta tag, providers
│   ├── providers.tsx             # React Query client provider
│   ├── login/                  # Google OAuth sign-in (Supabase Auth)
│   ├── auth/callback/          # OAuth code-exchange route
│   ├── app/page.tsx            # Gated entry point — server-fetches the user, renders <App>
│   └── api/                    # Route handlers (OpenAI calls live server-side only)
│       ├── chat/                     # Text conversation (gpt-4.1-nano)
│       ├── grammar/                  # Grammar check (gpt-4.1-nano)
│       ├── stt/                      # Speech → text (gpt-4o-mini-transcribe)
│       ├── tts/                      # Text → speech (gpt-4o-mini-tts)
│       ├── vision/                   # Object detection + translation (gpt-4.1-nano, multimodal)
│       └── conversations/ensure-active/  # Day-rollover + LLM-summarized archival
├── middleware.ts                # Supabase session refresh, protects /app
├── App.tsx                      # Tab container (Scanner / Chat) + user menu
├── theme.ts                     # Design tokens ("Parisian Tech" system, see below)
├── routes/
│   ├── Scanner.tsx              # Camera capture + object detection
│   └── Chat.tsx                 # Conversation UI (text + voice), daily session model
├── components/
│   ├── LandingPage.tsx          # Public marketing page
│   ├── BrandMark.tsx            # Shared logo+wordmark (landing nav, Scanner header)
│   ├── MessageBubble.tsx        # Shared message rendering (live + read-only)
│   ├── ArchivedDaysPanel.tsx    # Read-only history of past days' conversations
│   ├── ArchivedDayCard.tsx      # Single archived-day summary card
│   ├── PhotoPreviewSection.tsx  # Captured-photo confirm/retake
│   └── UserMenu.tsx             # Account menu, sign out
└── lib/
    ├── supabase/                # Browser / server / middleware Supabase clients
    ├── data/conversations.ts    # Supabase-backed data layer (messages, conversations)
    ├── conversations/archiveConversation.ts  # Day-end LLM summary generation
    ├── primaryAgent.ts          # Client-side wrappers for /api/chat and /api/grammar
    ├── audio/                   # Recording (with mic device picker), STT/TTS clients, playback hook
    ├── vision/detectObject.ts   # /api/vision client
    ├── api/openaiRateLimit.ts   # Shared 429 handling reused by every OpenAI-backed route
    └── dates.ts                 # Local-date helpers, streak calculation

supabase/migrations/             # Numbered, idempotent SQL migrations (source of truth for schema)
```

---

## **🔐 Auth & Data Model**

- **Auth:** Supabase Auth with Google OAuth. `middleware.ts` protects everything under `/app`; the public landing page and `/login` are open.
- **Sessions are daily, not per-chat.** Each user has exactly one *active* conversation at a time (enforced by a DB-level partial unique index), representing "today." On the next visit after a day boundary, that conversation is automatically archived — an LLM generates a short summary and topic tags — and a fresh one starts. There's no "New Chat" button by design; history is browsed read-only via the "Historique" panel, not managed as separate chats.
- **Persistence:** messages, scanned photos (Supabase Storage), and generated TTS audio (also Storage, cached after first generation) all survive reloads. A streak counter tracks consecutive days with real activity, backed by a durable flag set on first message insert so clearing a day's chat doesn't reset it.
- **Row Level Security** on every table, scoped to `auth.uid()`.

---

## **🎨 Design System**

Visual identity ("Parisian Tech") is maintained in a companion Figma file and mirrored in `src/theme.ts` as the single source of truth for color/spacing/typography tokens — components consume tokens, not raw hex values.

- **Typography:** DM Serif Display for brand/hero moments, Inter for everything else.
- **Palette:** Navy, Ivory, Paper, Limestone, Electric (primary action), Brass, Rouge, Mint, Mist, Hairline — plus a five-color "tech accent layer" for AI/status UI.
- **Rules:** Electric means action or listening; Rouge is reserved for corrections and destructive actions only; recognized objects get dark (Navy) chips; AI messages sit on Mist, user messages on Electric.

---

## **🧠 How It Works**

### **Scanner**

In the Scanner tab, users capture an image using the device camera. VueVocale identifies a single primary object in the image and provides its French equivalent, giving users a clear visual and linguistic reference. This object then serves as context for conversation, helping ground interaction in something familiar rather than starting from abstract prompts. The captured photo persists to Supabase Storage so it survives reload.

### **Conversation**

The Chat tab is a casual, French-only dialogue with an AI companion centered on the detected object or prior context. Users can interact using text or voice and receive responses as readable text or optional audio playback. The AI uses intermediate-level, conversational French and treats spoken input as natural speech rather than formal writing, encouraging free expression. Grammar feedback is available on demand, keeping the focus on communication while offering corrective support when needed.

---

## **💡 Key Features**

* Camera-based object detection as conversation starters
* Context-aware French conversation for intermediate learners
* Speech-to-text input for hands-free interaction
* On-demand text-to-speech playback for listening practice, cached after first generation
* Grammar validation for spoken and written text
* Daily practice sessions with automatic day-end archival and LLM-generated summaries
* Streak tracking and read-only conversation history
* Google sign-in, per-user persistence, mobile-first UI

---

## **🧰 Tech Stack**

* **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
* **Auth & Data:** Supabase (`@supabase/ssr`, Auth + Postgres + Storage), TanStack React Query for client-side data/cache state
* **AI Platform:** OpenAI (`openai` SDK) — see AI-Specifics below for the model per task
* **Audio:** Browser Media APIs (`MediaRecorder`, device enumeration for the mic picker) for recording and playback
* **UI:** react-icons, `@fontsource` for self-hosted DM Serif Display / Inter
* **Deployment:** Vercel, custom domain (`www.vuevocale.app`)

---

## **🚀 Getting Started**

```bash
npm install
```

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

Run the migrations in `supabase/migrations/` (in order) against your Supabase project via the SQL editor, then set up Google as an auth provider in the Supabase dashboard (Authentication → Providers) using a Google Cloud OAuth client.

```bash
npm run dev
```

---

## **🤖 AI-Specifics**

### **Vision (Object Identification \+ Translation)**

* **Model:** `gpt-4.1-nano` (multimodal)
* **Input:**
  * Single user-captured image
  * Low-detail image processing
* **Output:**
  * One English noun
  * One French equivalent
  * Strict JSON schema (no extra text, no articles)

The vision system is intentionally constrained to return a single, unambiguous object. This keeps visual context lightweight and ensures the output can be immediately used as a conversational reference.

---

### **Chained Conversation Architecture**

The conversation system is implemented as a modular pipeline rather than a single end-to-end, real-time model call:

Speech-to-Text (STT)

   ↓

Text-based Conversation Model

   ↓

Text-to-Speech (TTS)

* **STT:** `gpt-4o-mini-transcribe`
* **Conversation:** `gpt-4.1-nano`
* **TTS:** `gpt-4o-mini-tts`

Each stage is handled by a model specialized for that task, allowing speech recognition, reasoning, and audio generation to be optimized independently. All conversational reasoning happens in text, keeping behavior predictable and consistent across typed and spoken input, while speech is treated strictly as an input and output layer, making the system more cost-efficient than a real-time multimodal API by invoking audio models only when needed and relying on a lightweight text model for most interactions.

---

### **Speech-to-Text (STT)**

* **Model:** `gpt-4o-mini-transcribe`
* **Input:** Browser-recorded audio (`webm`)
* **Language:** French
* **Behavior:** Exact transcription only, no additions or rephrasing

Spoken input is transcribed directly into conversational text, preserving informal phrasing and natural speech patterns.

---

### **Text-to-Speech (TTS)**

* **Model:** `gpt-4o-mini-tts`
* **Voice:** `marin`
* **Trigger:** User-initiated playback
* **Behavior:**
  * Generated once per message
  * Uploaded to Supabase Storage and reused on every subsequent play — including after a reload — never regenerated

Audio output is designed to sound like casual, supportive spoken French rather than instructional narration.

---

### **Grammar Validation**

* **Model:** `gpt-4.1-nano`
* **Invocation:** Explicit user action
* **Evaluation rules:**
  * Input treated as spoken French
  * Ignores punctuation, capitalization, tone, and partial sentence structures
* **Outputs:**
  * `OK`
  * Fully corrected French text
  * No explanations or commentary

Grammar checking runs independently of the conversation flow, allowing users to request accuracy feedback without interrupting interaction. Results persist per-message, so revisiting a conversation (including in the read-only archive) shows the same correction without re-calling the model.

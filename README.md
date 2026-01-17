# **VueVocale**

VueVocale is an interactive French learning app designed to help intermediate learners build real conversational fluency through **spoken interaction, visual context, and AI-powered dialogue**.

Rather than focusing on vocabulary lists or written exercises, VueVocale centers learning around **speaking naturally about the world around you**.

## **✨ Overview**

Many language learners understand grammar and vocabulary but struggle to speak fluidly in real situations. VueVocale is built to reduce that gap by encouraging learners to **think, react, and respond in French**.

The app combines **computer vision**, **speech**, and **conversation** to create a low-pressure environment where users can talk about familiar objects, ask questions, and practice expressing ideas as they would in everyday life.

VueVocale is meant to feel less like a lesson and more like chatting with a supportive French friend.

---

## **⚙️ App Architecture**

`api/                         # Vercel serverless functions`  
`├── chat.ts                  # Text conversation (gpt-4.1-nano)`  
`├── grammar.ts               # Grammar check (gpt-4.1-nano)`  
`├── stt.ts                   # Speech → text (gpt-4o-mini-transcribe)`  
`├── tts.ts                   # Text → speech (gpt-4o-mini-tts)`  
`└── vision.ts                # Object detection + translation`

`src/                         # Vite React frontend`  
`├── main.tsx                 # App entry`  
`├── App.tsx                  # Tab container (Chat / Scanner)`  
`├── App.css                  # Global styles`  
`├── theme.ts                 # Design tokens`  
`├── routes/`  
`│   ├── Chat.tsx             # Conversation UI (text + voice)`  
`│   └── Scanner.tsx          # Camera + vision trigger`  
`├── components/`  
`│   └── PhotoPreviewSection.tsx  # Image preview / retake`  
`└── lib/`  
    `├── primaryAgent.ts      # /api/chat + /api/grammar client`  
    `├── supabaseClient.ts    # Supabase init (storage/logs)`  
    `├── audio/`  
    `│   ├── useRecorder.ts   # Mic recording hook`  
    `│   ├── transcribeSTT.ts # /api/stt client`  
    `│   └── generateTTS.ts   # /api/tts client`  
    `└── vision/`  
        `└── detectObject.ts  # /api/vision client`

---

## **🧠 How It Works**

### **Scanner**

In the Scanner tab, users capture an image using the device camera. VueVocale identifies a single primary object in the image and provides its French equivalent, giving users a clear visual and linguistic reference. This object then serves as context for conversation, helping ground interaction in something familiar rather than starting from abstract prompts.

### **Conversation**

The Conversation tab transitions users into a casual, French-only dialogue with an AI companion centered on the detected object or prior context. Users can interact using text or voice and receive responses as readable text or optional audio playback. The AI uses intermediate-level, conversational French and treats spoken input as natural speech rather than formal writing, encouraging free expression. Grammar feedback is available on demand, keeping the focus on communication while offering corrective support when needed.

---

## **💡 Key Features**

* Camera-based object detection as conversation starters  
* Context-aware French conversation for intermediate learners  
* Speech-to-text input for hands-free interaction  
* On-demand text-to-speech playback for listening practice  
* Grammar validation for spoken and written text  
* Mobile-first UI designed for frequent, lightweight use

---

## **🧰 Tech Stack**

* **Frontend:** React \+ TypeScript \+ Vite  
* **Backend:** Vercel Serverless Functions  
* **AI Platform:** OpenAI APIs  
* **Audio:** Browser Media APIs for recording and playback  
* **Deployment:** Vercel and Cloudflare

The stack is chosen to keep latency low, isolate AI responsibilities, and allow fast iteration without coupling frontend logic to model behavior.

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
  * Cached and reused on subsequent plays

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

Grammar checking runs independently of the conversation flow, allowing users to request accuracy feedback without interrupting interaction.
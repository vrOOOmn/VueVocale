# **🗂 Project Overview — *VueVocale (French Learning App)***

### **🏗 Tech Stack**

* **Framework:** React \+ TypeScript (Vite)  
* **Database & Storage:** Supabase (for chat logs \+ photo uploads)  
* **AI Integration:** Google Gemini API for conversational French practice  
* **UI Styling:** Inline styles powered by a shared `theme.ts`  
* **Routing:** Simple route toggling between `Chat` and `Scanner` inside `App.tsx`

---

# **⚙️ App Architecture**

`src/`  
`├── App.tsx                → Main container with floating nav (Chat/Scanner tabs)`  
`├── routes/`  
`│   ├── Chat.tsx           → AI French conversation page`  
`│   └── Scanner.tsx        → Camera + photo upload page`  
`├── components/`  
`│   └── PhotoPreviewSection.tsx → Displays captured photo and retake button`  
`├── lib/`  
`│   └── supabaseClient.ts  → Supabase client initialization`  
`├── theme.ts               → Centralized design tokens`  
`├── App.css                → Global CSS tokens & base resets`  
`├── main.tsx               → App entry point`

---

# **💬 Chat.tsx — *Conversational French AI***

### **🧠 Purpose**

The Chat route provides a conversational practice experience where users type in French and receive short, natural replies from an AI “partner.” It focuses on fluid, intermediate-level conversation rather than translation or tutoring.

### **🧩 Detailed Functionality**

1. **Message State Management**  
   * Uses React state (`useState`) to store messages for the current session.  
   * A module-level `sessionMessages` variable holds a persistent copy while the app is open.  
   * This allows messages to survive route switches (Chat ↔ Scanner) but reset completely on page reload.  
2. **User Interaction Flow**  
   * The user types a message in an input field and presses **Enter** (or clicks Send).  
   * If the input is empty or the AI is currently replying (`loading === true`), sending is disabled (`if (!text || loading) return;`).  
   * Each message immediately appears in the UI to maintain responsiveness.  
3. **AI Response Generation**  
   * Uses the Google **Gemini API** (`@google/generative-ai`) to generate responses.  
   * The prompt constrains replies to:  
     * Intermediate-level French (not overly complex)  
     * Friendly, informal tone  
     * 1–3 concise sentences  
   * The Gemini call is async — while it processes, the UI shows a “typing” or “loading” indicator.  
4. **Message Lifecycle**  
   * User message → added to state immediately  
   * Gemini API → returns French text → added as bot message  
   * Both messages are appended to the React state and `sessionMessages`.  
5. **Supabase Integration**  
   * After each exchange (user \+ AI), both messages are inserted into the `chat_messages` table.  
   * Fields: `{ text, sender, created_at }`  
   * This logs every chat turn persistently while the front-end remains session-based.  
   * Anonymous insert and select policies are enabled for development use.  
6. **UI & Interaction Design**  
   * Messages appear as rounded bubbles aligned left (AI) and right (User).  
   * Dynamic styling from `theme.ts`:  
     * User \= primary background, white text  
     * AI \= surface background, dark text  
   * Auto-scrolls to the bottom whenever a new message is added.  
   * Keyboard shortcuts:  
     * `Enter` → send message  
     * `Shift+Enter` → newline  
7. **Session Behavior**  
   * Messages persist as long as the browser tab is open.  
   * Reloading or closing the tab resets the session.  
   * Supabase still stores the conversation for long-term analytics or later user-based expansion.

---

# **📷 Scanner.tsx — *Camera and Photo Uploads***

### **🧠 Purpose**

The Scanner route enables the user to take a live photo (e.g., of an object or word in French context), view a preview, and upload it to Supabase.  
The captured image can later be used for object detection, translation, or vocabulary reinforcement.

### **🧩 Detailed Functionality**

1. **Camera Setup & Stream Management**  
   * Requests camera access via `navigator.mediaDevices.getUserMedia({ video: { facingMode } })`.  
   * Maintains a reference to the stream, video, and canvas elements.  
   * Supports switching between **rear (environment)** and **front (user)** cameras with a toggle button.  
2. **Permission & Error Handling**  
   * Checks camera permission status using the Permissions API.  
   * Gracefully handles edge cases:  
     * `NotAllowedError` → permission denied  
     * `NotReadableError` → camera in use by another app  
     * `NotFoundError` → no camera available  
   * Displays descriptive user-friendly error messages.  
3. **Live Video Display**  
   * Streams live camera feed directly into a `<video>` tag.  
   * Keeps the layout responsive with a 3:4 aspect ratio box.  
   * Removes browser default controls (`controls={false}`) for a clean UI.  
4. **Visibility-Aware Lifecycle**  
   * When the tab or page is hidden:  
     * Stops all camera tracks and pauses video playback (`cleanupStream()`).  
   * When the user returns:  
     * Automatically restarts the stream after 300ms to avoid “black screen” delay.  
   * This mimics professional-grade behavior seen in camera apps (e.g., Google Translate camera).  
5. **Photo Capture & Preview**  
   * When the user taps the capture button (`IoCamera` icon):  
     * Draws the current video frame onto a `<canvas>`.  
     * Converts it to a Data URL (`toDataURL`) for immediate local preview.  
   * The photo is displayed inside `PhotoPreviewSection` with options to retake or confirm.  
6. **Supabase Upload Process**  
   * Converts the captured frame to a `Blob` and uploads it to the **`photos` storage bucket**.  
   * File names are timestamped (`photo-<timestamp>.jpg`).  
   * After upload:  
     * Fetches a public URL from Supabase Storage.  
     * Inserts it into the **`photos` table** (`photo_url` field).  
7. **Session Behavior**  
   * The image preview exists only in-memory during the active session.  
   * Reloading the page resets everything (photo, stream, etc.).  
   * Uploaded files remain stored permanently in Supabase Storage unless manually deleted.  
8. **Retake Flow**  
   * User clicks “Retake Photo” → `handleRetakePhoto()` clears preview and restarts the camera stream.  
9. **Camera Controls**  
   * Primary (blue) circular button → capture photo  
   * Secondary (gray) circular button → flip camera  
10. **Error & Permission UI**  
    * If camera access is denied, displays an icon, error message, and “Grant Permission” button.

---

# **🖼 PhotoPreviewSection.tsx — *Preview & Retake Component***

### **🧠 Purpose**

Displays the captured image after shutter click and offers a “retake” button.

### **🧩 Core Features**

* Shows the photo at full preview size.  
* Includes a delete/trash icon for retaking (resets back to live camera feed).  
* Matches the visual design of the rest of the app with consistent theme tokens.

---

# **🧩 App.tsx — *Main Router and Layout***

### **🧠 Purpose**

Handles navigation and container layout between the two primary modes: **Scanner** and **Chat**.

### **🧩 Core Features**

* Maintains a single piece of state: `activeTab`.  
* Renders either `<Scanner />` or `<Chat />` dynamically without losing their internal state.  
* Floating bottom nav bar with two buttons (`Camera`, `Chat`).  
* Includes subtle scaling and color changes for active tabs.  
* Prevents scroll bleed (`overflow: hidden`).

---

# **🎨 Theme \+ Styling**

Defined in `theme.ts` and `App.css`.

### **Tokens**

* **Colors:** primary, secondary, surface, background, border, text, error  
* **Spacing:** `xs` to `xl`  
* **Radius:** `sm`, `md`, `lg`, `xl`, `round`  
* **Typography:** body and message styles (consistent across chat \+ camera UIs)

### **Global CSS**

* Smooth scroll  
* Button hover/focus states  
* Responsive layout (works on mobile browsers)

---

# **☁️ Supabase Integration Overview**

* **Tables:**  
  * `chat_messages`: stores user \+ AI messages  
  * `photos`: stores URLs of uploaded photos  
* **Storage bucket:**  
  * `photos`: for raw image uploads  
* **Policies:**  
  * Anonymous insert/select access enabled for dev/testing  
* **Behavior:**  
  * Chat and photo data are stored permanently in Supabase  
    (front-end resets on reload, backend persists)

---

# **💡 In-Memory vs. Supabase Summary**

| Data | In-Memory | Supabase |
| ----- | ----- | ----- |
| Chat messages | Persist between tabs, cleared on reload | Logged permanently |
| Photos | Shown instantly (data URL) | Uploaded permanently |
| Camera state | Reset on tab switch/unload | N/A |
| AI replies | Stored in session | Logged permanently |
# **VueVocale**

VueVocale is an interactive French learning app that helps intermediate learners build conversational fluency through AI-powered, image-based conversation.

## **✨ Overview**

Most learners can read and write in a new language, but freeze when it comes to spontaneous speaking. VueVocale bridges that gap by combining **computer vision** and **AI conversation** to simulate the experience of chatting with a native speaker about real-world objects.

Users can scan objects around them using their device’s camera, and the app automatically:

1. Detects and identifies the object using Gemini Flash 2.0 API.  
2. Translates it into French.  
3. Starts a natural, conversation with AI French companion about that object in French, helping learners speak more confidently and fluently.

VueVocale makes **immersion accessible** anywhere, bringing a piece of the café-in-France experience to your own environment.

## **⚙️ App Architecture**

`src/`  
`├── App.tsx                → Main container with floating nav (Chat/Scanner tabs)`  
`├── routes/`  
`│   ├── Chat.tsx           → AI French conversation page`  
`│   └── Scanner.tsx        → Camera + photo upload page`  
`├── components/`  
`│   └── PhotoPreviewSection.tsx → Displays captured photo and retake button`  
`├── lib/`  
`│   └── supabaseClient.ts  → Supabase client initialization`  
     `└── geminiClient.ts  → Gemini client initialization`   
`├── theme.ts               → Centralized design tokens`  
`├── App.css                → Global CSS tokens & base resets`  
`├── main.tsx               → App entry point`

## **🧠 How It Works**

* **Scanner Tab:**  
  The user captures an image using the built-in camera. VueVocale runs object detection through Gemini API, translates the main object to French, and displays both the English and French terms.  
* **Chat Tab:**  
  The app transitions seamlessly into a conversation with a friendly French-speaking AI, who chats casually about the detected object. The AI is tuned to use intermediate-level French, gently correct major mistakes, and encourage fluid speech without pressure.  
* **Under the Hood:**  
  * **Frontend:** React \+ TypeScript  
  * **AI Integration:** Gemini Flash API (for image recognition & conversation)  
  * **Database & Storage:** Supabase (for image uploads & chat logs)  
  * **Development:** Vite \+ ngrok (for local and mobile testing)

## **💡 Key Features**

* Real-time **object detection** and **translation**  
* Contextual **AI conversation** for practical speaking practice  
* Clean, mobile-friendly interface with smooth transitions  
* Beginner-friendly **camera setup and feedback handling**  
* Scalable backend for saving photos and conversation data  
* **Precise state management** for maintaining current context for AI

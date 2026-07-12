# Forever Aswani ❤️ — Cinematic Love Story & Proposal Website

A premium, highly interactive, cinematic mobile-first website that narrates a beautiful, real love story and culminates in a marriage proposal. Built specifically to be shared as a single link over WhatsApp, providing an unforgettable experience.

## ✨ Features

- 🎬 **Cinematic Narrative Flow**: Not a standard webpage. A continuous first-person story that unfolds scene-by-scene via scroll-triggered animations (GSAP + ScrollTrigger).
- 🏥 **Animated Hospital Scene**: Animates sliding doors, glowing spotlights, and heartbeat lines showing the moment they first met.
- 💬 **Timeline & Chats**: Displays chronological WhatsApp chats showing simple questions turning into hours of conversation.
- 🍫 **Interactive Scenes & Easter Eggs**:
  - Animated baking of the first birthday brownie.
  - Interactive banana jiggle easter egg with animated voice reaction ("Don't you want my big banana?").
  - Nickname Garden where user taps flowers to reveal personal nicknames.
  - Interactive Dream Tree that grows branches representing future milestones (Paris, Disneyland, building a home, etc.).
- 💍 **3D WebGL Proposal**: Features a glowing 3D metallic diamond ring and starfield background rendered in real-time with Three.js.
- 🎵 **Web Audio API Ambient Track**: Procedures warm ambient synthesizer pad music (opt-in) with mute/play control.
- 🎆 **Celebration Mode**: Selecting "YES" launches continuous canvas confetti, rose petal storms, future story cards, and an infinity countdown.
- 📱 **WhatsApp Optimized**: High Lighthouse score, full Open Graph tags with custom previews, lazy-loaded components, and PWA capability.

---

## 📁 Project Structure

```
h:\New folder (9)\
├── index.html            # Main markup & CDNs
├── manifest.json         # PWA Manifest settings
├── sw.js                 # Service worker cache module
├── css/
│   └── style.css         # Full design tokens & scene stylesheet
├── js/
│   ├── main.js           # Loading manager, audio synthesizer, scroll observer
│   ├── scenes.js         # GSAP timelines for all 18 scenes
│   ├── particles.js      # Canvas fireflies, hearts, blossoms, golden dust
│   ├── starfield.js      # Three.js WebGL 3D ring & starfield background
│   └── proposal.js       # Proposal YES/NO handlers & confetti celebration
└── assets/
    └── images/
        └── og-preview.png # WhatsApp shared preview image (1200x630)
```

---

## ⚙️ How to Customize

This project was built to be fully customizable:

### 1. Adding Personal Photos or Videos
You can replace background sections or step icons with your own photos.
- Save your images in `assets/images/`.
- Edit `index.html` or `css/style.css` to add `<img>` elements or reference them as background properties.
- Example: Swap the silhouette styles in `#scene-familiar` with transparent cutout photos of you and Aswani.

### 2. Custom Audio / Voice Narration
If you have real voice recordings of the narration or a specific background piano track:
- Save the audio file in `assets/audio/music.mp3` or similar.
- In `js/main.js`, update the audio toggle script to load your audio file using an HTML5 `<audio>` element rather than the Web Audio API synthesizer oscillators:
  ```javascript
  const audio = new Audio('assets/audio/music.mp3');
  audio.loop = true;
  ```

### 3. Open Graph Meta Tags (WhatsApp Preview)
Before deploying, customize the WhatsApp preview details in `index.html`:
```html
<meta property="og:title" content="Forever Aswani ❤️" />
<meta property="og:description" content="Some people spend years searching for love. Mine arrived carrying a smile." />
<meta property="og:image" content="https://<your-username>.github.io/<repo-name>/assets/images/og-preview.png" />
```

---

## 🚀 How to Deploy on GitHub Pages

1. **Create a GitHub Repository**:
   - Create a new public repository named `forever-aswani` on your GitHub account.

2. **Initialize Git and Push**:
   - Open terminal in the project folder and run:
     ```bash
     git init
     git add .
     git commit -m "Initialize Forever Aswani proposal"
     git branch -M main
     git remote add origin https://github.com/yourusername/forever-aswani.git
     git push -u origin main
     ```

3. **Enable GitHub Pages**:
   - Go to your repository settings on GitHub.
   - Select **Pages** on the left menu.
   - Under **Build and deployment**, set the Source to **Deploy from a branch**.
   - Under **Branch**, select `main` and `/root`, then click **Save**.
   - Your site will be published at `https://yourusername.github.io/forever-aswani/` in a minute.

4. **Verify WhatsApp Preview**:
   - Copy the published HTTPS link and paste it into a WhatsApp chat.
   - WhatsApp will fetch the preview card with the image, title, and description.

---

## 🛠️ Built With

- **GSAP + ScrollTrigger**: Smooth, high-performance scroll-linked cinematic timelines.
- **Three.js**: WebGL rendering for the 3D rotating gold ring and galaxy starfield background.
- **Canvas Confetti**: High-performance, GPU-accelerated confetti system.
- **Web Audio API**: Real-time synthesizer nodes generating ambient sounds.

# Antigravity_Portfolio

A polished, single-page portfolio website showcasing a creative web developer's work, visual identity, and interactive scroll-driven animation.

## Overview

This project is a static, responsive portfolio site built with plain HTML, CSS and JavaScript. The site pairs a glassmorphic design system with a high‑fidelity scroll-driven canvas animation (frame-sequence playback) to create an immersive hero experience. A tiny Node static server is included for local preview.

## Features

- Single-page portfolio layout with sections: Hero, Brands, About, Projects, Contact, Footer.
- High-DPI canvas driven scroll animation: a preloaded sequence of frames maps scroll position to animation frames.
- Ultra-minimal loading screen with progress indicator while frames and assets preload.
- Smooth anchor navigation and active navigation highlighting based on scroll position.
- Glassmorphic project and skill cards with hover interactions and micro-animations (CSS-only).
- Static Node-based development server (server.js) for local preview with sensible MIME types and cache behavior for development.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML (index.html) | Page structure and SVG artwork |
| CSS (style.css) | Full design system, layout, responsive styles and animations |
| JavaScript (script.js) | Canvas frame-sequence loader, scroll → frame mapping, UI behaviors |
| Node (built-in http) | Minimal static file server (server.js) for local preview |
| Images (JPG, SVG) | Visual assets (project thumbnails, pixel mascot SVG, frame sequence) |

## Project structure

```text
Antigravity_Portfolio/
├── assets/                      # Project images and SVG (pixel-cat.svg, project-*.jpg)
├── ezgif-8b5ebe47f4e9a94c-jpg/  # Frame sequence directory used by the scroll canvas
├── index.html                    # Single-page site markup (hero, about, projects, footer)
├── style.css                     # Complete design system and component styles
├── script.js                     # Canvas frame loader, scroll mapping, UI interactions
├── server.js                     # Minimal static server for local preview (node server.js)
└── README.md                     # This file
```

Important files and roles:
- index.html — contains the page sections, inline SVG mascot, references to the frame folder, and a comment noting the local preview URL.
- style.css — design tokens, layout, card components, animations, loader and responsive rules.
- script.js — controls preloading of image frames, renders frames to a full-screen fixed canvas, implements smooth anchor navigation and active nav highlighting. Key constants: TOTAL_FRAMES = 240, frame folder name `ezgif-8b5ebe47f4e9a94c-jpg`.
- server.js — small development HTTP server using Node core modules; serves files with correct MIME types and sets no-cache for `.html`, `.css`, `.js` for development.

## How the system fits together

User browser → Loads index.html, style.css, script.js → script.js preloads a sequence of JPG frames located under the repository folder `ezgif-8b5ebe47f4e9a94c-jpg/` (TOTAL_FRAMES = 240) → frames are drawn onto the fixed, high-DPI <canvas id="scroll-canvas"> → scroll position is interpolated (LERP) to the appropriate frame index, producing a smooth scroll-tied animation. Assets (project thumbnails, pixel-cat.svg) are loaded from the `assets/` folder. server.js can serve the site locally for development.

## How to run (local preview)

No build tools or package.json are required. The project is static and can be served by any static host. For local development using the included Node server:

1. Clone the repository:
   git clone https://github.com/SHOJIB-80/Antigravity_Portfolio.git
2. Change directory:
   cd Antigravity_Portfolio
3. Start the local server (Node is required):
   node server.js
4. Open the site in your browser:
   http://localhost:3000/

Notes:
- index.html contains a comment referencing the preview link `http://localhost:3000/`.
- The included Node server binds to port 3000 (see the PORT constant in server.js). The server uses only built-in Node modules — no npm install step is required.
- The project is also hosted via GitHub Pages:
  https://shojib-80.github.io/Antigravity_Portfolio/

## Configuration

- Frame sequence: script.js expects the frames under the folder `ezgif-8b5ebe47f4e9a94c-jpg/` at the repository root with filenames `ezgif-frame-001.jpg` … `ezgif-frame-240.jpg`. TOTAL_FRAMES is defined at the top of script.js (currently 240).
- server.js sets a static PORT constant to 3000. To change the port edit the `PORT` value in server.js and restart the server.
- server.js sets `Cache-Control: no-cache, no-store, must-revalidate` for `.html`, `.css` and `.js` to ensure immediate refresh during development; other assets are served with `public, max-age=86400`.

## Database / API

- This project does not include a backend database or REST API. server.js is a minimal static file server used only for local preview.

## Authentication & Authorization

- No authentication or authorization mechanism is present in the repository.

## Screenshots / Visual assets

The repository contains visual assets used on the site and a pixel mascot SVG:

- assets/pixel-cat.svg
- assets/project-bottle.jpg
- assets/project-headphones.jpg
- assets/project-jacket.jpg

Example (rendered on GitHub as image references):
![Pixel mascot](assets/pixel-cat.svg)
![Project example](assets/project-bottle.jpg)

(These files are included in the assets/ directory; they are used by the project’s project cards and About section.)

## Testing

- There are no test suites or automated tests in this repository.

## Known limitations

- The frame sequence approach can be asset-heavy — ensure the entire frame folder is present when running locally (script.js expects 240 frames by default).
- server.js is a minimal development server and is not hardened for production use (it allows CORS via '*' and performs no security hardening).
- To change the server port you must edit server.js — it does not read environment variables.
- The site is a static single-page app; there is no server-side rendering, API layer, or backend persistence.

## Security considerations

- No secrets, environment variables, or credentials are stored in the repository.
- The included server is for local development only. Do not use server.js as-is for production hosting without adding proper security, logging, and configuration.
- CORS is set to '*' in server.js for local development convenience.

## License

No license file is present in the repository. For licensing or contact details, see the project owner profile:
https://github.com/SHOJIB-80

## Author

Shojib (GitHub: SHOJIB-80)

## Live preview

- Local preview (included comment in index.html): http://localhost:3000/
- Live (GitHub Pages): https://shojib-80.github.io/Antigravity_Portfolio/

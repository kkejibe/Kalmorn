# Kalmorn Tech — Precision website

A static corporate website for Kalmorn’s operational platforms and engineering services. The design uses an ivory background, precise grid layouts, green accents, and the original green-and-white wordmark. The homepage includes interactive balloons with hover, touch, and keyboard controls.

## Local development

```sh
npm install
npm run dev
```

Open [the local preview](http://127.0.0.1:4173). Set `PORT` to choose another port. The preview server binds to the local computer only.

The site uses plain HTML, CSS, and JavaScript. There is no bundler or application framework. Google Fonts supplies DM Sans, Manrope, IBM Plex Mono, and Inter; system fonts serve as fallbacks.

## Validation

```sh
npm run build
npx playwright install chromium
npm test
```

`build` checks the JavaScript syntax; the static files themselves are ready to host. Browser checks cover every top-level page at desktop, tablet, and mobile widths; local links and assets; mobile navigation; content without JavaScript; and balloon hover, touch, keyboard, pause, respawn, and reduced-motion behavior.

To use an existing Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Set `SCREENSHOT_DIR` to save verification screenshots outside the source tree.

## Source layout

- `index.html`: approved Precision homepage, platform overview, and ownership model.
- `services.html`, `products.html`, `contact.html`: approach, platform details, and contact options.
- `blog.html`, `blog-*.html`: journal and existing articles.
- `css/style.css`: shared typography, layout, navigation, and page styles.
- `css/home.css`: homepage layout and balloon field.
- `js/main.js`: accessible mobile navigation and article reading progress.
- `js/balloons.js`: floating balloons, particle effects, and motion controls.
- `scripts/serve.cjs`, `scripts/verify-site.cjs`: local preview and browser verification.

Navigation and footer markup are present in each page so the site works without JavaScript. Keep these shared sections consistent when editing a page. The VOSS support and privacy routes retain their redirects to the VOSS website.

## Hosting

Publish the HTML pages, `css/`, `js/`, `assets/`, `voss-support/`, and `voss-privacy/` to any static host. No server runtime or build output is needed. Exclude local development files, `node_modules/`, and `.git/` from the published files.

Copyright © 2026 Kalmorn Tech Ltd.

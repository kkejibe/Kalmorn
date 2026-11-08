# Kalmorn Tech — Environmental Technology and Services

The Kalmorn corporate website presents environmental services and specialist technology. The portfolio is ordered **Quadrat Services, GRYD, Drillr, Tymr**. Quadrat has a dedicated service page; Tymr is positioned as an environmental project management system.

The site uses plain HTML, CSS, and JavaScript, with a forest green, sage, and warm neutral palette. Existing landscape imagery introduces the environmental focus. Optimized WebP copies are used on the homepage and insights page. Google Fonts supplies Manrope, DM Sans, IBM Plex Mono, and Inter, with system fallbacks.

## Local development

```sh
npm install
npm run dev
```

Open [the local preview](http://127.0.0.1:4173). Set `PORT` to select another port. The server listens only on the local computer.

## Validation

```sh
npm run build
npx playwright install chromium
npm test
```

`build` checks the active JavaScript. Browser checks cover all top-level pages at desktop, tablet, and mobile widths; local links and assets; portfolio order; Quadrat content; navigation; reduced motion; and the email inquiry flow. Navigation and essential content remain available without JavaScript.

Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an installed Chromium browser. Set `SCREENSHOT_DIR` to save desktop and mobile verification images outside the source tree.

## Source layout

- `index.html`: environmental positioning, featured Quadrat services, software portfolio, and project workflow.
- `products.html`: Quadrat Services, GRYD, Drillr, and Tymr in that order.
- `quadrat.html`: six developing service areas, Call Assistance under evaluation, initial regional coverage, and service model.
- `services.html`: field services, environmental technology, and engagement approach.
- `contact.html`: direct email and a project inquiry composer.
- `blog.html`, `blog-*.html`: environmental insights and retained historical articles.
- `css/style.css`: shared design, responsive layouts, navigation, footer, and page styles.
- `css/home.css`: homepage composition.
- `css/articles.css`: styles for retained articles.
- `js/main.js`: mobile navigation, article reading progress, and email inquiry composition.
- `scripts/serve.cjs`, `scripts/verify-site.cjs`: local preview and browser verification.

Shared navigation and footers are static HTML in each page. Keep their labels and portfolio ordering consistent when editing. The previous balloon component and script remain in the repository but are no longer loaded by the website.

## Content and inquiries

Quadrat’s public content reflects the November 7, 2026 draft meeting minutes. It describes developing services and distinguishes Call Assistance as a concept under evaluation. Private meeting details, internal rates, ownership discussions, and prospective client relationships are not included. Confirm readiness before changing availability language or adding operating claims.

The contact form prepares a `mailto:` draft in the visitor’s email app. It does not submit to a server, store data, or promise delivery. A copyable draft and direct email address provide a fallback when no mail app is configured. Product inquiry links preselect the relevant option.

VOSS is no longer listed in the portfolio or shared navigation. Historical articles are marked as archive content and state that VOSS operates independently. Existing VOSS support and privacy redirects are retained for old links.

## Hosting

The existing Azure Static Web Apps workflow remains in place. Publish the HTML pages, `css/`, `js/`, `assets/`, `voss-support/`, and `voss-privacy/` to the configured static host. No application server or bundled build output is required. Exclude development files, `node_modules/`, and `.git/`.

Copyright © 2026 Kalmorn Tech Ltd.

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
- `contact.html`: project inquiry form delivered through FormSubmit to `info@kalmorn.com`.
- `contact-thanks.html`: confirmation page after a successful form submission; excluded from search indexing.
- `careers.html`: expressions of interest for field, environmental, technology, and business opportunities, with a structured email introduction.
- `blog.html`, `blog-*.html`: environmental insights and retained historical articles.
- `css/style.css`: shared design, responsive layouts, navigation, footer, and page styles.
- `css/home.css`: homepage composition.
- `css/articles.css`: styles for retained articles.
- `js/main.js`: mobile navigation, article reading progress, contact inquiry labels, and careers email composition.
- `scripts/serve.cjs`, `scripts/verify-site.cjs`: local preview and browser verification.

Shared navigation and footers are static HTML in each page. Keep their labels and portfolio ordering consistent when editing. The previous balloon component and script remain in the repository but are no longer loaded by the website.

## Content and inquiries

Quadrat’s public content reflects the November 7, 2026 draft meeting minutes. It describes developing services and distinguishes Call Assistance as a concept under evaluation. Private meeting details, internal rates, ownership discussions, and prospective client relationships are not included. Confirm readiness before changing availability language or adding operating claims.

The contact form posts over HTTPS to FormSubmit, which emails submissions to `info@kalmorn.com`. ImprovMX forwards that inbox to the owner’s existing mailbox. Visitors provide a name, reply email, optional organization, interest, and project details. The `email` field supplies the reply address, and product inquiry links still preselect the relevant interest. Submissions return to `contact-thanks.html` after the provider accepts them. Native HTML submission works without JavaScript; the script trims required fields and adds the selected interest to the email subject.

FormSubmit’s default reCAPTCHA remains enabled, with a hidden honeypot as an additional spam check. There are no API secrets in the site. The provider requires a one-time activation email to `info@kalmorn.com` before delivery starts. If the destination changes, activate the new address and verify delivery before publishing it. FormSubmit retains submissions for 30 days; its privacy policy is linked beside the form. See [FormSubmit documentation](https://formsubmit.co/documentation). Direct email remains available if a visitor cannot complete the form.

Careers introductions use the same company inbox, `info@kalmorn.com`, with a `Careers` subject for easy identification. The form collects name, email, city/region, area of interest, optional availability, and a short introduction into an email draft. Candidates attach résumés in their own email app. There is no website upload, applicant database, or automatic submission; the email becomes the record only after the candidate sends it. The page welcomes future opportunities without advertising specific vacancies.

VOSS is no longer listed in the portfolio or shared navigation. Historical articles are marked as archive content and state that VOSS operates independently. Existing VOSS support and privacy redirects are retained for old links.

## Hosting

The existing Azure Static Web Apps workflow remains in place. Publish the HTML pages, `css/`, `js/`, `assets/`, `voss-support/`, and `voss-privacy/` to the configured static host. No application server or bundled build output is required. Exclude development files, `node_modules/`, and `.git/`.

Copyright © 2026 Kalmorn Tech Ltd.

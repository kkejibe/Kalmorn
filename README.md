# Kalmorn Tech Ltd. — Corporate Website

A clean, bold, and modern static website for **Kalmorn Tech Ltd.**, a Canadian software development and technology consulting company.

## Tech Stack

- **Plain HTML5 / CSS3 / Vanilla JavaScript** — no build tools, no frameworks
- **Google Fonts** (Inter) loaded via CDN
- Fully responsive (mobile, tablet, desktop)
- Scroll-triggered animations using Intersection Observer API

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, services overview, products teaser, stats, CTA |
| About | `about.html` | Mission, vision, values, team placeholders |
| Services | `services.html` | Software dev & consulting details, process steps |
| Products | `products.html` | VOSS (iOS app) & GRYD (Excel plugin) with roadmaps |
| Contact | `contact.html` | Email, phone, location, social links |
| Blog | `blog.html` | Placeholder blog post grid |

## Project Structure

```
Corp Site/
├── index.html
├── about.html
├── services.html
├── products.html
├── contact.html
├── blog.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   └── images/
└── README.md
```

## Running Locally

No build step required. Simply open any `.html` file in a browser, or start a local server:

```bash
# Python 3
python3 -m http.server 8080

# Then visit http://localhost:8080
```

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Green | `#00C853` | Buttons, accents, highlights |
| Accent Green | `#00E676` | Hover states |
| Dark | `#0A0A0A` | Backgrounds, text |
| White | `#FFFFFF` | Content backgrounds |
| Off-White | `#F5F5F5` | Alternate section backgrounds |

## Customization

- **Colors:** All defined as CSS custom properties in `css/style.css` under `:root`
- **Content:** Edit HTML files directly — each page is self-contained
- **Images:** Replace SVG placeholders in `assets/images/` with actual product screenshots, team photos, etc.
- **Contact info:** Update email, phone, and social links in each page's footer and `contact.html`

## Hosting

This is a fully static site. Deploy to any static hosting provider:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web server (Nginx, Apache)

## License

Copyright © 2026 Kalmorn Tech Ltd. All rights reserved.
# Kalmorn

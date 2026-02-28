# Blog Rebuild Plan — trevoragilbert.com

Static site replacing the existing Hugo blog. Plain HTML, CSS, JS output. No JavaScript frameworks. Hosted on GitHub Pages with the custom domain `trevoragilbert.com`.

## Status

- [x] Project structure created
- [x] CSS stylesheet written (faithful recreation of existing design)
- [x] Build script written (`build.js`)
- [x] All blog post content ported to Markdown (4/5 posts — skeuomorphism post pending images)
- [x] About page ported
- [x] Skeuomorphism post images downloaded
- [x] GitHub repo created: github.com/trevoragilbert/trevoragilbert.github.io
- [x] GitHub Pages configured (GitHub Actions workflow — see .github/workflows/deploy.yml)
- [x] Site live at: https://trevoragilbert.github.io

## Architecture

```
blog/                      <- repo root
├── build.js               <- Static site generator (Node.js, no framework)
├── package.json           <- Dependencies: marked, gray-matter
├── content/
│   ├── about.md           <- About page content
│   └── posts/             <- One .md file per blog post
│       ├── stop-offering-me-amazon-gift-cards.md
│       ├── the-need-for-software-handyman.md
│       ├── skeuomorphism-and-scale.md
│       ├── a-love-letter-tinkerable-software.md
│       └── focusing-on-the-wrong-thing-lendingtree.md
├── static/                <- Copied as-is into docs/
│   ├── css/
│   │   └── style.css
│   └── images/
│       ├── logic-pro-example.png   <- From existing site
│       └── notes-example.png       <- From existing site
├── docs/                  <- Build output (GitHub Pages source)
│   ├── index.html
│   ├── posts/
│   │   ├── index.html
│   │   └── [slug]/index.html
│   ├── about/index.html
│   ├── css/style.css
│   ├── images/
│   ├── feed.xml
│   ├── CNAME              <- "trevoragilbert.com"
│   └── .nojekyll
├── PLAN.md                <- This file
└── README.md
```

## Build Process

```bash
npm install        # Install gray-matter and marked
node build.js      # Regenerate docs/
```

The build script (`build.js`):
1. Copies everything from `static/` to `docs/`
2. Reads all `.md` files in `content/posts/`
3. Parses YAML front-matter (title, date, description, slug)
4. Converts Markdown body to HTML with `marked`
5. Wraps in HTML templates (defined inline in build.js)
6. Writes individual post pages, index, all-posts page, about page
7. Generates `feed.xml` (RSS)
8. Writes `CNAME` and `.nojekyll`

## Adding New Posts

1. Create `content/posts/my-new-post.md` with front-matter:
   ```yaml
   ---
   title: "My Post Title"
   date: 2025-01-15
   description: "A one-sentence summary shown in the post list."
   slug: "my-new-post"
   ---
   ```
2. Write the post body in Markdown below the `---`
3. Run `node build.js`
4. Commit and push `docs/` to GitHub

## Design System

Faithful recreation of the original trevoragilbert.com Hugo theme:

| Property | Value |
|----------|-------|
| Primary accent | `#8DC863` (sage green) |
| Border color | `#74A551` (darker green) |
| Hover background | `#CDE4BD` (pale green) |
| Text color | `#222E36` (dark blue-grey) |
| Body font | Bitter (Google Fonts, variable) |
| Base font size | 15px |
| Line height | 1.6em |
| Content max-width | 800px |
| Link style | 3px solid green bottom border, no underline |
| Link hover | pale green bg + white text |
| Headings | All 1.2rem; prefixed `# `, `## `, etc. in green |
| List bullets | Bold `* ` prefix (custom, no default bullets) |
| HR | 3px dotted green |
| Footer border | 0.4rem dotted green top |
| Code bg | `#f1f1f1` inline, `#ececec` blocks |

## GitHub Pages Setup

1. Repo name: `trevoragilbert.github.io` (user site)
2. GitHub Pages source: **GitHub Actions** (`.github/workflows/deploy.yml`)
   - On every push to `main`: installs deps, runs `node build.js`, deploys `docs/`
3. Custom domain: set in repo Settings > Pages > Custom domain > `trevoragilbert.com`
   - `docs/CNAME` already contains `trevoragilbert.com`
   - Update DNS at your registrar (see below)
4. After DNS propagates, enable "Enforce HTTPS" in Pages settings

DNS settings needed at your registrar:
```
A     @    185.199.108.153
A     @    185.199.109.153
A     @    185.199.110.153
A     @    185.199.111.153
CNAME www  trevoragilbert.github.io
```

## Pending: Skeuomorphism Post Images

The post `skeuomorphism-and-scale.md` references two images:
- `/images/logic-pro-example.png`
- `/images/notes-example.png`

These should be downloaded from the existing site and placed in `static/images/`. Until then the post will display without images.

To download:
```bash
curl -o static/images/logic-pro-example.png https://www.trevoragilbert.com/images/logic-pro-example.png
curl -o static/images/notes-example.png https://www.trevoragilbert.com/images/notes-example.png
```

## Code Guidelines for Claude Sessions

- **Never use frameworks**: No React, Vue, Angular, etc. Output is plain HTML/CSS/JS.
- **Build tool only**: `build.js` is a build-time tool, not a runtime dependency. The `docs/` folder is pure static HTML.
- **Minimal dependencies**: Only `gray-matter` (front-matter parsing) and `marked` (Markdown->HTML). Don't add more.
- **Templates in build.js**: HTML templates are JS template literals in `build.js`. Don't create separate template files.
- **CSS in one file**: All styles in `static/css/style.css`. Don't split or add frameworks.
- **Content as Markdown**: All post content lives in `content/posts/*.md`. Never edit generated HTML in `docs/` directly.
- **Always rebuild**: After any change to content, CSS, or build.js -- run `node build.js` and commit the updated `docs/`.
- **Commit docs/**: The `docs/` directory IS the deployed site. It must be committed to git.

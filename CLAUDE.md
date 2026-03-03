# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build

```bash
node build.js
```

Run after any change to content, CSS, or `build.js`. Always commit the resulting `docs/` output — it is the GitHub Pages source. Never edit files under `docs/` directly.

## Adding a Post

1. Create `content/posts/my-slug.md` with front-matter:
   ```yaml
   ---
   title: "Post Title"
   date: YYYY-MM-DD
   description: "One-sentence description."
   slug: "my-slug"
   ---
   ```
2. Run `node build.js`
3. Commit everything including `docs/` and push

## Architecture

This is a hand-rolled static site generator — no framework involved.

- **`build.js`** — the entire build pipeline in one file. Reads `content/posts/*.md`, renders HTML via `marked`, and writes `docs/`. Also generates `docs/feed.xml` (RSS), `docs/CNAME`, and `docs/posts/<slug>/index.html` for each post.
- **`static/`** — files copied verbatim into `docs/` on every build. CSS lives at `static/css/style.css` — edit this for all design changes (not `docs/css/style.css`).
- **`content/posts/`** — Markdown source for all posts. Parsed with `gray-matter` for front-matter.
- **`docs/`** — build output committed to git. GitHub Pages serves from this directory on the `main` branch.

HTML templates are string literals inside `build.js` (`baseTemplate`, `BIO`, `homePage`, `postPage`). The bio/about text is hardcoded in the `BIO` constant.

## Design System

- Font: Bitter (Google Fonts, variable weight)
- Primary accent: `#8DC863` (sage green) — `--maincolor`
- Border green: `#74A551` — `--bordercl`
- Text: `#222E36` — `--textcolor`
- Content max-width: 720px
- Links: `border-bottom: 1px solid var(--maincolor)`, no underline
- Homepage uses `<details>`/`<summary>` for collapsible About and Writings sections

## Deployment

Push to `main` → GitHub Actions runs `node build.js` → deploys `docs/` to GitHub Pages. The workflow is at `.github/workflows/deploy.yml`. Since `docs/` is also committed, the build output is always in sync with the repo.

## Branching

- **`main`** — production. Pushes here trigger the GitHub Actions deploy to GitHub Pages.
- **`staging`** — for testing changes before they go live. Pushes here do NOT trigger deployment. Test locally with `node build.js`, then merge to `main` when ready.

Workflow: make changes on `staging` → run `node build.js` → verify locally → merge to `main` → push `main` to deploy.

## Toggling Homepage Sections

Homepage sections (About, My Writings, Other's Writings) are rendered in `homePage()` in `build.js`. To hide a section, remove it from the `content` template string. To restore it, add it back.

For example, to hide/show the Other's Writings section, find the `content:` line in `homePage()` and remove or add `\n${linksSection}` at the end. The underlying code and `/links/` page remain intact either way.

# Links of Interest — Execution Plan

## 1. Cloudflare Setup
- [ ] Transfer `trevoragilbert.com` DNS to Cloudflare (if not already there)
- [ ] Enable Cloudflare Email Routing for the domain
- [ ] Create `links@trevoragilbert.com` as a routing address
- [ ] Create a Cloudflare Worker and route incoming emails to it

## 2. GitHub Setup
- [ ] Create a GitHub personal access token with `repo` scope
- [ ] Add the token as a secret in the Cloudflare Worker (`GITHUB_TOKEN`)

## 3. Write the Cloudflare Worker
- [x] Parse inbound email: extract URL and commentary from subject/body
- [x] Fetch current `content/links.json` via GitHub API
- [x] Append new entry `{ url, title, commentary, date }` (newest first)
- [x] Commit updated `content/links.json` back via GitHub API
- [x] Handle edge cases: malformed URLs, missing title, empty body

## 4. Data
- [x] Create `content/links.json` with an empty array `[]` as the initial file
- [x] Commit it to the repo so the Worker always has a file to read/append

## 5. Update `build.js`
- [x] Read and parse `content/links.json` at build time
- [x] Add `linksPage()` template function — renders `/links/index.html` (newest first, title + date + commentary)
- [x] Add entry for `/links/` under a new Projects `<details>` section on the homepage

## 6. CSS
- [x] Add Projects `<details>`/`<summary>` block styles to `static/css/style.css` (matching existing About/Writings pattern)
- [x] Style the links list on `/links/` (title linked, date muted, commentary below)

## 7. Test End-to-End
- [ ] Send a test email to `links@trevoragilbert.com`
- [ ] Confirm Worker fires and commits to GitHub
- [ ] Confirm GitHub Actions builds and deploys
- [ ] Confirm link appears correctly on `/links/` and homepage Projects section

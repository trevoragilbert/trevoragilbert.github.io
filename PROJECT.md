# Links of Interest — Project Spec

## Overview

A new section of trevoragilbert.com for collecting and sharing interesting links, with optional commentary. Links are ingested via email and published automatically to the site.

## Site Structure

A new **Projects** section appears on the homepage (alongside About and Writings), with `/links/` as its first entry. The Projects section is a collapsible `<details>` block matching the existing homepage pattern.

`/links/` is a dedicated page listing all links in reverse chronological order.

## Link Display

Each entry on `/links/` shows:
- The link (title, hyperlinked)
- Date added
- Commentary (optional, written by Trevor)

No domain attribution, no auto-generated summaries.

## Ingestion

Links are submitted by emailing `links@trevoragilbert.com`. Trevor sends or forwards an email with:
- The URL (in the subject or body)
- Optional commentary in the email body

**Pipeline:**
1. **Cloudflare Email Routing** receives the email and forwards it to a Cloudflare Worker
2. **The Worker** parses the URL and commentary, then calls the GitHub API to append a new entry to `content/links.json` and commit it
3. **GitHub Actions** detects the commit, runs `node build.js`, and deploys the updated site to Pages

End-to-end, a link should appear on the site within a minute or two of sending the email. Works from any device or email client.

**Requirements:**
- `trevoragilbert.com` DNS managed by Cloudflare
- Cloudflare Workers (free tier)
- GitHub personal access token stored as a Worker secret
- ~50 lines of JavaScript for the Worker

## Data Storage

Links are stored in `content/links.json` as an array of objects:

```json
[
  {
    "url": "https://example.com",
    "title": "Page Title",
    "commentary": "Optional note.",
    "date": "YYYY-MM-DD"
  }
]
```

`build.js` reads this file at build time and renders `/links/index.html`, newest first.

## Open Questions

- Whether `/links/` needs pagination once volume grows

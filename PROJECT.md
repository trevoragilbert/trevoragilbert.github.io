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

Links are submitted via email. Trevor forwards or composes an email containing:
- The URL
- Optional commentary in the email body

A script or service monitors the inbox, parses the URL and commentary, and commits a new entry to the repo. The GitHub Actions deploy pipeline then publishes it to the site automatically.

The ingestion mechanism should work from any device or context where email is available (phone share sheet, desktop browser, any email client).

## Data Storage

Links are stored as structured data in the repo (e.g. a JSON or Markdown file under `content/`), following the existing pattern of content living in `content/` and being rendered at build time by `build.js`.

## Open Questions

- What email address / service to use for ingestion (dedicated Gmail alias, Cloudflare Email Routing, etc.)
- How the inbox-monitoring script is hosted and triggered (Zapier, a small serverless function, a cron job)
- Whether `/links/` needs pagination once volume grows

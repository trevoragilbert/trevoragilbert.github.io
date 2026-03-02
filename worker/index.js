/**
 * Cloudflare Email Worker — links@trevoragilbert.com
 *
 * Receives inbound emails, parses URL + commentary, and commits
 * a new entry to content/links.json in the GitHub repo.
 *
 * Email format:
 *   Subject: Page title (used as link title; "Fwd:"/"Re:" stripped)
 *   Body:    First URL found is the link. All other text is commentary.
 *
 * Secrets required (set via Cloudflare dashboard):
 *   GITHUB_TOKEN  — personal access token with repo scope
 *
 * No npm dependencies — paste directly into the Cloudflare dashboard.
 */

const GITHUB_OWNER = 'trevoragilbert';
const GITHUB_REPO  = 'trevoragilbert.github.io';
const GITHUB_FILE  = 'content/links.json';
const GITHUB_API   = 'https://api.github.com';

// ── Email parsing ───────────────────────────────────────────────────────────

function parseRawEmail(raw) {
  // Split headers from body at the first double CRLF (or LF)
  const splitAt = raw.search(/\r?\n\r?\n/);
  const headerText = splitAt !== -1 ? raw.slice(0, splitAt) : raw;
  let body        = splitAt !== -1 ? raw.slice(splitAt).trimStart() : '';

  // Extract subject from headers
  const subjectMatch = headerText.match(/^Subject:\s*(.+)$/mi);
  const rawSubject   = subjectMatch ? subjectMatch[1].trim() : '';
  const subject      = rawSubject.replace(/^(fwd?|re):\s*/i, '').trim();

  // Handle multipart — find the text/plain part
  const boundaryMatch = headerText.match(/boundary="?([^";\r\n]+)"?/i);
  if (boundaryMatch) {
    const boundary = boundaryMatch[1].trim();
    const parts    = body.split(new RegExp('--' + escapeRegex(boundary)));
    for (const part of parts) {
      if (/content-type:\s*text\/plain/i.test(part)) {
        const partSplit = part.search(/\r?\n\r?\n/);
        if (partSplit !== -1) {
          body = part.slice(partSplit).trimStart();
          break;
        }
      }
    }
  }

  // Strip quoted reply lines and common email trailers
  body = body
    .split('\n')
    .filter(line => !line.startsWith('>'))
    .join('\n')
    .replace(/^[-_]{3,}.*$/m, '') // signature divider
    .trim();

  return { subject, body };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Main handler ────────────────────────────────────────────────────────────

export default {
  async email(message, env) {
    const rawText = await new Response(message.raw).text();
    const { subject, body } = parseRawEmail(rawText);

    // Extract first URL from body
    const urlMatch = body.match(/https?:\/\/[^\s"<>]+/);
    if (!urlMatch) {
      console.error('No URL found in email body — ignoring');
      return;
    }
    const url = urlMatch[0].replace(/[.,;!?)]+$/, ''); // strip trailing punctuation

    // Commentary: body with URL removed, whitespace collapsed
    const commentary = body.replace(url, '').replace(/\s+/g, ' ').trim() || null;

    const newEntry = {
      url,
      title: subject || url,
      commentary,
      date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    };

    // ── GitHub API ──────────────────────────────────────────────────────────

    const ghHeaders = {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'trevoragilbert-links-worker',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    const fileUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;

    // Fetch current links.json
    const fileRes = await fetch(fileUrl, { headers: ghHeaders });
    if (!fileRes.ok) {
      throw new Error(`GitHub GET failed: ${fileRes.status} ${await fileRes.text()}`);
    }
    const fileData = await fileRes.json();
    const existing = JSON.parse(atob(fileData.content.replace(/\n/g, '')));

    // Prepend new entry (newest first) and encode
    const updated = [newEntry, ...existing];
    const encoded = btoa(encodeURIComponent(JSON.stringify(updated, null, 2) + '\n')
      .replace(/%([0-9A-F]{2})/g, (_, p) => String.fromCharCode(parseInt(p, 16))));

    // Commit
    const commitRes = await fetch(fileUrl, {
      method: 'PUT',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Add link: ${newEntry.title}`,
        content: encoded,
        sha: fileData.sha,
      }),
    });

    if (!commitRes.ok) {
      throw new Error(`GitHub PUT failed: ${commitRes.status} ${await commitRes.text()}`);
    }

    console.log(`Committed new link: ${url}`);
  },
};

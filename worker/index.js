/**
 * Cloudflare Email Worker — links@trevoragilbert.com
 *
 * Receives inbound emails, parses URL + commentary, and commits
 * a new entry to content/links.json in the GitHub repo.
 *
 * Email format:
 *   Subject: your commentary (optional)
 *   Body:    the URL
 *
 * The page title is fetched automatically from the URL.
 *
 * Secrets required (set via Cloudflare dashboard):
 *   GITHUB_TOKEN  — personal access token with repo scope
 *
 * No npm dependencies — paste directly into the Cloudflare dashboard.
 */

const GITHUB_OWNER   = 'trevoragilbert';
const GITHUB_REPO    = 'trevoragilbert.github.io';
const GITHUB_FILE    = 'content/links.json';
const GITHUB_API     = 'https://api.github.com';
const ALLOWED_SENDER = 'trevoragilbert@gmail.com';

// ── Email parsing ───────────────────────────────────────────────────────────

function decodeQuotedPrintable(str) {
  return str
    .replace(/=\r?\n/g, '')           // soft line breaks
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function extractPlainText(raw) {
  // Split at first double newline to get headers + body
  const splitAt = raw.search(/\r?\n\r?\n/);
  if (splitAt === -1) return raw;

  const headerText = raw.slice(0, splitAt);
  let body = raw.slice(splitAt + 2).trimStart();

  // Check content-transfer-encoding on the outer message
  const outerEncoding = (headerText.match(/^Content-Transfer-Encoding:\s*(\S+)/mi) || [])[1] || '';

  // Handle multipart — recurse into the text/plain part
  const boundaryMatch = headerText.match(/boundary=(?:"([^"]+)"|(\S+))/i);
  if (boundaryMatch) {
    const boundary = (boundaryMatch[1] || boundaryMatch[2]).trim();
    const parts = body.split(new RegExp('--' + escapeRegex(boundary)));

    for (const part of parts) {
      const partSplit = part.search(/\r?\n\r?\n/);
      if (partSplit === -1) continue;

      const partHeaders = part.slice(0, partSplit);
      const partBody    = part.slice(partSplit + 2).trimStart();

      if (!/content-type:\s*text\/plain/i.test(partHeaders)) continue;

      const enc = (partHeaders.match(/^Content-Transfer-Encoding:\s*(\S+)/mi) || [])[1] || '';
      if (/base64/i.test(enc)) {
        return atob(partBody.replace(/\s+/g, ''));
      }
      if (/quoted-printable/i.test(enc)) {
        return decodeQuotedPrintable(partBody);
      }
      return partBody;
    }

    // No text/plain found — try text/html as fallback
    for (const part of parts) {
      const partSplit = part.search(/\r?\n\r?\n/);
      if (partSplit === -1) continue;
      const partHeaders = part.slice(0, partSplit);
      const partBody    = part.slice(partSplit + 2).trimStart();
      if (/content-type:\s*text\/html/i.test(partHeaders)) {
        return partBody.replace(/<[^>]+>/g, ' ');
      }
    }
  }

  // Single-part body
  if (/base64/i.test(outerEncoding)) {
    return atob(body.replace(/\s+/g, ''));
  }
  if (/quoted-printable/i.test(outerEncoding)) {
    return decodeQuotedPrintable(body);
  }
  return body;
}

function cleanBody(text) {
  return text
    .split('\n')
    .filter(line => !line.startsWith('>'))   // quoted reply lines
    .join('\n')
    // common mobile/webmail footers
    .replace(/^(sent from my |get outlook for|sent via |this email was sent).*/im, '')
    .replace(/^[-_*]{3,}\s*$/m, '')          // signature dividers
    .replace(/\r/g, '')
    .trim();
}

function extractUrl(text) {
  const match = text.match(/https?:\/\/[^\s"<>[\]]+/);
  if (!match) return null;
  return match[0].replace(/[.,;!?)'"\]]+$/, '');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseEmail(raw) {
  const splitAt = raw.search(/\r?\n\r?\n/);
  const headerText = splitAt !== -1 ? raw.slice(0, splitAt) : raw;

  // Subject → commentary
  const subjectRaw = (headerText.match(/^Subject:\s*(.+)$/mi) || [])[1] || '';
  const commentary = subjectRaw
    .replace(/=\?[^?]+\?[BQ]\?[^?]+\?=/gi, '') // encoded-word (best-effort strip)
    .replace(/^(fwd?|re):\s*/i, '')
    .trim() || null;

  // Body → URL
  const body = cleanBody(extractPlainText(raw));
  const url = extractUrl(body) || extractUrl(subjectRaw);

  return { url, commentary };
}

async function fetchPageTitle(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

// ── Main handler ────────────────────────────────────────────────────────────

export default {
  async email(message, env) {
    if (message.from.toLowerCase() !== ALLOWED_SENDER.toLowerCase()) {
      console.error(`Rejected email from unauthorized sender: ${message.from}`);
      return;
    }

    const rawText = await new Response(message.raw).text();
    const { url, commentary } = parseEmail(rawText);

    console.log('Parsed — url:', url, '| commentary:', commentary);

    if (!url) {
      console.error('No URL found in email — ignoring');
      return;
    }

    const pageTitle = await fetchPageTitle(url);
    console.log('Fetched title:', pageTitle);

    const newEntry = {
      url,
      title: pageTitle || url,
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

    const fileRes = await fetch(fileUrl, { headers: ghHeaders });
    if (!fileRes.ok) {
      throw new Error(`GitHub GET failed: ${fileRes.status} ${await fileRes.text()}`);
    }
    const fileData = await fileRes.json();
    const existing = JSON.parse(atob(fileData.content.replace(/\n/g, '')));

    const updated = [newEntry, ...existing];
    const encoded = btoa(encodeURIComponent(JSON.stringify(updated, null, 2) + '\n')
      .replace(/%([0-9A-F]{2})/g, (_, p) => String.fromCharCode(parseInt(p, 16))));

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

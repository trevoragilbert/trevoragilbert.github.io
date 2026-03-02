/**
 * Cloudflare Email Worker — links@trevoragilbert.com
 *
 * Receives inbound emails, parses URL + commentary, and commits
 * a new entry to content/links.json in the GitHub repo.
 *
 * Email format:
 *   Subject: Page title (or anything — used as link title)
 *   Body:    First URL found is the link. All other text is commentary.
 *
 * Secrets required (set via Cloudflare dashboard or wrangler):
 *   GITHUB_TOKEN  — personal access token with repo scope
 *
 * Constants (edit below):
 *   GITHUB_OWNER, GITHUB_REPO, GITHUB_FILE
 */

import { EmailMessage } from 'cloudflare:email';
import { PostalMime } from 'postal-mime';

const GITHUB_OWNER = 'trevoragilbert';
const GITHUB_REPO  = 'trevoragilbert.github.io';
const GITHUB_FILE  = 'content/links.json';
const GITHUB_API   = 'https://api.github.com';

export default {
  async email(message, env) {
    // Parse the raw email
    const raw = new Response(message.raw);
    const parsed = await PostalMime.parse(await raw.arrayBuffer());

    const subject = (parsed.subject || '').replace(/^(fwd?|re):\s*/i, '').trim();
    const body    = parsed.text || parsed.html?.replace(/<[^>]+>/g, ' ') || '';

    // Extract first URL from body
    const urlMatch = body.match(/https?:\/\/[^\s"<>]+/);
    if (!urlMatch) {
      console.error('No URL found in email body — ignoring');
      return;
    }
    const url = urlMatch[0].replace(/[.,;!?)]+$/, ''); // strip trailing punctuation

    // Commentary: body text with the URL removed, collapsed whitespace
    const commentary = body
      .replace(url, '')
      .replace(/\s+/g, ' ')
      .trim();

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const newEntry = {
      url,
      title: subject || url,
      commentary: commentary || null,
      date: today,
    };

    // Fetch current links.json from GitHub
    const headers = {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'trevoragilbert-links-worker',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    const fileUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
    const fileRes = await fetch(fileUrl, { headers });

    if (!fileRes.ok) {
      throw new Error(`GitHub GET failed: ${fileRes.status} ${await fileRes.text()}`);
    }

    const fileData = await fileRes.json();
    const existing = JSON.parse(atob(fileData.content.replace(/\n/g, '')));

    // Prepend new entry (newest first)
    const updated = [newEntry, ...existing];
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(updated, null, 2) + '\n')));

    // Commit updated file
    const commitRes = await fetch(fileUrl, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
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

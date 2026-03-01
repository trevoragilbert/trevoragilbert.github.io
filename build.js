#!/usr/bin/env node
/**
 * build.js — Static site generator for trevoragilbert.com
 *
 * Usage:
 *   node build.js
 *
 * Reads:  content/posts/*.md
 * Writes: docs/ (GitHub Pages source)
 *
 * Dependencies: gray-matter, marked (npm install)
 */

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// ── Configuration ──────────────────────────────────────────────────────────

const CONTENT_DIR = path.join(__dirname, 'content');
const STATIC_DIR  = path.join(__dirname, 'static');
const OUT_DIR     = path.join(__dirname, 'docs');
const SITE_TITLE  = '@trevoragilbert';
const SITE_URL    = 'https://trevoragilbert.com';

// ── Configure marked ───────────────────────────────────────────────────────

marked.setOptions({
  gfm: true,
  breaks: false,
});

// ── Helpers ────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('  wrote', path.relative(OUT_DIR, filePath));
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log('  copied', path.relative(OUT_DIR, destPath));
    }
  }
}

function formatDate(dateStr) {
  // dateStr: YYYY-MM-DD — parse as UTC to avoid timezone-shift off-by-one
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// ── HTML templates ─────────────────────────────────────────────────────────

function baseTemplate({ title, content, canonical = '' }) {
  const pageTitle = title ? `${title} | ${SITE_TITLE}` : SITE_TITLE;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  ${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
  <link rel="stylesheet" href="/css/style.css">
  <link rel="alternate" type="application/rss+xml" title="${SITE_TITLE}" href="/feed.xml">
</head>
<body>
<div class="content">
  <header>
    <div class="main">
      <a href="/">${SITE_TITLE}</a>
    </div>
  </header>
  <main>
${content}
  </main>
  <footer>
    <div class="footer-info">
      Copyright &copy; ${new Date().getFullYear()} Trevor Gilbert
    </div>
  </footer>
</div>
</body>
</html>`;
}

function homeListItem(post) {
  const dateStr = formatDate(post.data.date);
  return `    <section class="home-list-item">
      <a href="/posts/${post.data.slug}/">${post.data.title}</a>
      <time datetime="${post.data.date}">${dateStr}</time>
    </section>`;
}

function postListItem(post) {
  const dateStr = formatDate(post.data.date);
  const desc    = post.data.description ? `<div class="description">${post.data.description}</div>` : '';
  return `    <section class="list-item">
      <h1 class="title"><a href="/posts/${post.data.slug}/">${post.data.title}</a></h1>
      <time datetime="${post.data.date}">${dateStr}</time>
      ${desc}
      <a class="readmore" href="/posts/${post.data.slug}/">Read more &#10230;</a>
    </section>
    <hr>`;
}

const BIO = `    <details class="about-section" open>
      <summary><span class="about-arrow">&#9654;</span> About</summary>
      <div class="bio">
        <p>I work in product growth helping people discover and use great software, currently at SurveyMonkey. In the past I've done it at Prismatic (acq. by LinkedIn), Clara Lending (acq. by Sofi), Right Side Up, Hubstaff. I've also enjoyed consulting with interesting companies like DoorDash, Empower, StitchFix, Calm, Dell, Microsoft, and many others.</p>
        <p>Outside tech, I've spent years creating <a href="https://www.historyofpolandpodcast.com">The History of Poland Podcast</a>, which is currently on an indefinite hiatus.</p>
        <p>When I'm not working, I like spending time with my family, reading, fixing up the house, gardening, woodworking. I do all of this from beautiful, sunny Portland, Oregon.</p>
        <p>If you'd like to get in touch with me you can reach me at trevoragilbert [at] gmail [dot] com.</p>
      </div>
    </details>`;

function homePage(posts) {
  const items = posts.map(homeListItem).join('\n');
  return baseTemplate({
    title: '',
    content: `${BIO}\n    <details class="writings-section" open>\n      <summary><span class="about-arrow">&#9654;</span> Writings</summary>\n      <div class="post-list">\n${items}\n      </div>\n    </details>`,
  });
}

function postPage(post) {
  const dateStr  = formatDate(post.data.date);
  const bodyHtml = marked(post.content);
  const canonical = `${SITE_URL}/posts/${post.data.slug}/`;
  return baseTemplate({
    title: post.data.title,
    canonical,
    content: `    <article>
      <div class="post-title">
        <h1 class="title">${post.data.title}</h1>
      </div>
      <section class="body">
        ${bodyHtml}
      </section>
      <div class="meta">Posted on ${dateStr}</div>
    </article>`,
  });
}

// ── RSS feed ───────────────────────────────────────────────────────────────

function rssFeed(posts) {
  const items = posts.map(post => {
    const dateStr = new Date(post.data.date + 'T00:00:00').toUTCString();
    const bodyHtml = marked(post.content);
    return `    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>${SITE_URL}/posts/${post.data.slug}/</link>
      <guid>${SITE_URL}/posts/${post.data.slug}/</guid>
      <pubDate>${dateStr}</pubDate>
      <description><![CDATA[${post.data.description || ''}]]></description>
      <content:encoded><![CDATA[${bodyHtml}]]></content:encoded>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>Personal blog — Trevor Gilbert</description>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`;
}

// ── Build ──────────────────────────────────────────────────────────────────

function build() {
  console.log('Building site...');
  ensureDir(OUT_DIR);

  // 1. Copy static assets
  console.log('\nCopying static assets...');
  copyDir(STATIC_DIR, OUT_DIR);

  // 2. Read and parse posts
  console.log('\nProcessing posts...');
  const postsDir  = path.join(CONTENT_DIR, 'posts');
  const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  const posts = postFiles.map(filename => {
    const raw  = fs.readFileSync(path.join(postsDir, filename), 'utf8');
    const parsed = matter(raw);
    // derive slug from filename if not set in front-matter
    if (!parsed.data.slug) {
      parsed.data.slug = filename.replace(/\.md$/, '');
    }
    // normalize date to string YYYY-MM-DD (use UTC to avoid timezone off-by-one)
    if (parsed.data.date instanceof Date) {
      const d = parsed.data.date;
      parsed.data.date = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
    }
    return parsed;
  });

  // Sort posts newest first
  posts.sort((a, b) => b.data.date.localeCompare(a.data.date));

  // 3. Generate individual post pages
  console.log('\nGenerating post pages...');
  for (const post of posts) {
    const html = postPage(post);
    write(path.join(OUT_DIR, 'posts', post.data.slug, 'index.html'), html);
  }

  // 4. Generate homepage
  console.log('\nGenerating homepage...');
  write(path.join(OUT_DIR, 'index.html'), homePage(posts));

  // 5. Generate RSS feed
  console.log('\nGenerating RSS feed...');
  write(path.join(OUT_DIR, 'feed.xml'), rssFeed(posts));

  // 6. Write CNAME for custom domain
  write(path.join(OUT_DIR, 'CNAME'), 'trevoragilbert.com');

  // 7. Write .nojekyll so GitHub Pages doesn't process with Jekyll
  write(path.join(OUT_DIR, '.nojekyll'), '');

  console.log('\nDone! Output in docs/');
}

build();

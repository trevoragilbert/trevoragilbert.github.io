#!/usr/bin/env node
/**
 * build.js — Static site generator for trevoragilbert.com
 *
 * Usage:
 *   node build.js
 *
 * Reads:  content/posts/*.md, content/about.md
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
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/posts">All posts</a>
    </nav>
  </header>
  <main>
${content}
  </main>
  <footer>
    <div style="display:flex;align-items:center">
      <a class="soc" href="https://github.com/trevoragilbert" rel="me" title="GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61
                   c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77
                   5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7
                   0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0
                   0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
        </svg>
      </a>
    </div>
    <div class="footer-info">
      Copyright &copy; ${new Date().getFullYear()} Trevor Gilbert
    </div>
  </footer>
</div>
</body>
</html>`;
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

function homePage(posts) {
  const items = posts.map(postListItem).join('\n');
  return baseTemplate({
    title: '',
    content: `    <div class="post-list">\n${items}\n    </div>`,
  });
}

function allPostsPage(posts) {
  const items = posts.map(postListItem).join('\n');
  return baseTemplate({
    title: 'All posts',
    content: `    <h1 class="page-heading">All articles</h1>\n${items}`,
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
        <div class="meta">Posted on ${dateStr}</div>
      </div>
      <section class="body">
        ${bodyHtml}
      </section>
    </article>`,
  });
}

function aboutPage(pageData) {
  const bodyHtml = marked(pageData.content);
  return baseTemplate({
    title: 'About',
    canonical: `${SITE_URL}/about/`,
    content: `    <article>
      <section class="body">
        ${bodyHtml}
      </section>
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

  // 5. Generate all-posts page
  console.log('\nGenerating /posts page...');
  write(path.join(OUT_DIR, 'posts', 'index.html'), allPostsPage(posts));

  // 6. Generate about page
  console.log('\nGenerating /about page...');
  const aboutRaw  = fs.readFileSync(path.join(CONTENT_DIR, 'about.md'), 'utf8');
  const aboutData = matter(aboutRaw);
  write(path.join(OUT_DIR, 'about', 'index.html'), aboutPage(aboutData));

  // 7. Generate RSS feed
  console.log('\nGenerating RSS feed...');
  write(path.join(OUT_DIR, 'feed.xml'), rssFeed(posts));

  // 8. Write CNAME for custom domain
  write(path.join(OUT_DIR, 'CNAME'), 'trevoragilbert.com');

  // 9. Write .nojekyll so GitHub Pages doesn't process with Jekyll
  write(path.join(OUT_DIR, '.nojekyll'), '');

  console.log('\nDone! Output in docs/');
}

build();

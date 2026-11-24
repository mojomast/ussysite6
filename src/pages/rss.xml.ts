import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function escapeXml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = (site || new URL('https://ussy.host')).toString().replace(/\/$/, '');
  const issues = (await getCollection('issues')).sort((a, b) =>
    b.data.issueNumber.localeCompare(a.data.issueNumber)
  );
  const articles = (await getCollection('articles')).sort(
    (a, b) => b.data.issueNumber.localeCompare(a.data.issueNumber) || a.data.index - b.data.index
  );

  const issueDates = new Map(issues.map((i) => [i.data.issueNumber, i.data.publishedAt]));
  const latestPubDate = issues[0]?.data.publishedAt
    ? new Date(`${issues[0].data.publishedAt}T12:00:00Z`).toUTCString()
    : new Date().toUTCString();

  const itemsXml = articles
    .map((art) => {
      const d = art.data;
      const link = `${baseUrl}/issues/${d.issueNumber}/${d.articleSlug}`;
      const pubDate = new Date(`${d.researchedAt || issueDates.get(d.issueNumber) || '2026-11-23'}T12:00:00Z`).toUTCString();
      const description = `${d.deck} — ${d.glanceNote} Source pinned at ${d.repoUrl}/tree/${d.sourceRevision}`;
      return [
        '    <item>',
        `      <title>${escapeXml(`Issue ${d.issueNumber} · #${d.readerServiceNo} ${d.title}: ${d.headline}`)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <category>${escapeXml(d.category)}</category>`,
        `      <description>${escapeXml(description)}</description>`,
        '    </item>'
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>SLOP ILLUSTRATED (Si.) — Living Edition</title>',
    `    <link>${escapeXml(baseUrl)}</link>`,
    `    <atom:link href="${escapeXml(`${baseUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    '    <description>A source-linked digital software magazine by SLOPTIMUS PRIME. Every monograph is commit-SHA pinned.</description>',
    '    <language>en-us</language>',
    `    <lastBuildDate>${latestPubDate}</lastBuildDate>`,
    itemsXml,
    '  </channel>',
    '</rss>',
    ''
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
};

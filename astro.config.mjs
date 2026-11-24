import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/**
 * Post-build Astro integration that guarantees strict CSP compatibility
 * (`script-src 'self'; style-src 'self' https://fonts.googleapis.com` with NO `unsafe-inline`).
 *
 * Any inline executable <script> or inline <style> emitted by framework hydration helpers
 * is deterministically extracted into content-addressed files under `/_astro/` and replaced
 * with external `<script type="module" src="...">` / `<link rel="stylesheet" href="...">` tags.
 */
function strictCspExternalizer() {
  return {
    name: 'carbon-strict-csp-externalizer',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const astroAssetDir = join(distDir, '_astro');
        await mkdir(astroAssetDir, { recursive: true });

        async function collectHtmlFiles(currentDir) {
          const entries = await readdir(currentDir, { withFileTypes: true });
          const files = [];
          for (const entry of entries) {
            const full = join(currentDir, entry.name);
            if (entry.isDirectory()) {
              files.push(...(await collectHtmlFiles(full)));
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
              files.push(full);
            }
          }
          return files;
        }

        const htmlFiles = await collectHtmlFiles(distDir);
        const writtenAssets = new Map();
        let extractedScripts = 0;
        let extractedStyles = 0;

        for (const htmlFile of htmlFiles) {
          let html = await readFile(htmlFile, 'utf8');
          let changed = false;

          // 1. Externalize inline <style>...</style> blocks
          html = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_match, _attrs, cssBody) => {
            const trimmed = cssBody.trim();
            if (!trimmed) return '';
            const hash = createHash('sha256').update(trimmed).digest('hex').slice(0, 12);
            const filename = `csp-style-${hash}.css`;
            if (!writtenAssets.has(filename)) {
              writtenAssets.set(filename, writeFile(join(astroAssetDir, filename), trimmed + '\n', 'utf8'));
              extractedStyles++;
            }
            changed = true;
            return `<link rel="stylesheet" href="${posix.join('/_astro', filename)}">`;
          });

          // 2. Externalize inline executable <script>...</script> blocks
          // Leave <script src="..."> and non-executable <script type="application/ld+json"> untouched.
          html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (fullMatch, attrs, jsBody) => {
            if (/\bsrc\s*=/i.test(attrs)) return fullMatch;
            const typeMatch = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i);
            const scriptType = typeMatch ? typeMatch[1].toLowerCase() : '';
            if (scriptType && scriptType !== 'module' && scriptType !== 'text/javascript' && scriptType !== 'application/javascript') {
              return fullMatch;
            }
            const trimmed = jsBody.trim();
            if (!trimmed) return '';
            const hash = createHash('sha256').update(trimmed).digest('hex').slice(0, 12);
            const filename = `csp-script-${hash}.js`;
            if (!writtenAssets.has(filename)) {
              writtenAssets.set(filename, writeFile(join(astroAssetDir, filename), trimmed + '\n', 'utf8'));
              extractedScripts++;
            }
            changed = true;
            return `<script type="module" src="${posix.join('/_astro', filename)}"></script>`;
          });

          if (changed) {
            await writeFile(htmlFile, html, 'utf8');
          }
        }

        await Promise.all(writtenAssets.values());
        logger.info(
          `Externalized ${extractedScripts} inline script(s) and ${extractedStyles} inline style(s) across ${htmlFiles.length} HTML page(s) for strict CSP.`
        );
      }
    }
  };
}

export default defineConfig({
  site: 'https://ussy.host',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    svelte(),
    mdx(),
    sitemap(),
    strictCspExternalizer()
  ],
  build: {
    inlineStylesheets: 'never'
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 900
    }
  }
});

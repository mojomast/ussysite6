import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const issues = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/issues' }),
  schema: z.object({
    issueNumber: z.string().regex(/^\d{2,}$/),
    title: z.string(),
    subtitle: z.string(),
    coverDate: z.string(),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(['current', 'archived', 'draft']),
    themeTag: z.string(),
    editorInChief: z.string().default('SLOPTIMUS PRIME'),
    editorLetterHeadline: z.string(),
    coverArt: z.object({
      kind: z.enum(['webgl-carbon-hive', 'blender-webp', 'carbon-svg']),
      src: z.string().optional(),
      svgId: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      title: z.string(),
      medium: z.string(),
      caption: z.string(),
      alt: z.string()
    }),
    frontispiece: z
      .object({
        src: z.string().optional(),
        svgId: z.string().optional(),
        width: z.number().default(1600),
        height: z.number().default(1200),
        title: z.string(),
        medium: z.string(),
        alt: z.string()
      })
      .optional(),
    highlights: z.array(
      z.object({
        label: z.string(),
        value: z.string()
      })
    ),
    dispatches: z
      .array(
        z.object({
          title: z.string(),
          repoUrl: z.url(),
          commitSha: z.string().regex(/^[0-9a-f]{40}$/),
          note: z.string()
        })
      )
      .default([])
  })
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    issueNumber: z.string().regex(/^\d{2,}$/),
    articleSlug: z.string().regex(/^[a-z0-9-]+$/),
    index: z.number().int().positive(),
    readerServiceNo: z.number().int().positive(),
    section: z.string(),
    layoutVariant: z.enum(['opener', 'dossier', 'essay']),
    title: z.string(),
    kicker: z.string(),
    headline: z.string(),
    deck: z.string(),
    byline: z.string(),
    category: z.string(),
    glanceNote: z.string(),
    pullQuote: z.string(),
    repoUrl: z.url(),
    liveUrl: z.url().nullable().default(null),
    sourceRevision: z.string().regex(/^[0-9a-f]{40}$/),
    researchedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    spotInkHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    secondaryInkHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    techStack: z.array(z.string()).min(1),
    metrics: z
      .array(
        z.object({
          label: z.string(),
          value: z.string()
        })
      )
      .min(1),
    verifiedCapabilities: z.array(z.string()).min(1),
    architecture: z.array(z.string()).min(1),
    fieldNotes: z.array(z.string()).min(1),
    readingGuide: z.array(z.string()).default([]),
    flexiFreqs: z.array(z.number()).length(4),
    plate: z.object({
      kind: z.enum(['blender-webp', 'carbon-svg']),
      svgId: z.string().optional(),
      src: z.string().optional(),
      width: z.number().default(1600),
      height: z.number().default(1200),
      title: z.string(),
      medium: z.string(),
      alt: z.string()
    }),
    secondaryMedia: z
      .object({
        kind: z.enum(['screenshot', 'svg-study']),
        src: z.string().optional(),
        studyId: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        caption: z.string(),
        alt: z.string().optional()
      })
      .nullable()
      .default(null),
    codeExcerpt: z.object({
      title: z.string(),
      lang: z.string().default('ts'),
      code: z.string(),
      sourceLabel: z.string(),
      sourceUrl: z.url()
    }),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.url()
        })
      )
      .min(3)
  })
});

export const collections = { issues, articles };

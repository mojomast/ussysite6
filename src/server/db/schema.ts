import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const readerStates = sqliteTable('reader_states', {
  readerId: text('reader_id').primaryKey(),
  printMode: text('print_mode').notNull().default('graphite'),
  gridOverlay: integer('grid_overlay', { mode: 'boolean' }).notNull().default(false),
  articlesRead: integer('articles_read').notNull().default(0),
  flexiPlays: integer('flexi_plays').notNull().default(0),
  bingoSubmissions: integer('bingo_submissions').notNull().default(0),
  updatedAt: integer('updated_at').notNull()
});

export const savedProjects = sqliteTable(
  'saved_projects',
  {
    readerId: text('reader_id').notNull(),
    readerServiceNo: integer('reader_service_no').notNull(),
    issueNumber: text('issue_number').notNull().default('02'),
    createdAt: integer('created_at').notNull()
  },
  (table) => [primaryKey({ columns: [table.readerId, table.readerServiceNo] })]
);

export const marginDispatches = sqliteTable('margin_dispatches', {
  id: text('id').primaryKey(),
  readerId: text('reader_id').notNull(),
  issueNumber: text('issue_number').notNull().default('02'),
  articleSlug: text('article_slug'),
  text: text('text').notNull(),
  createdAt: integer('created_at').notNull()
});

export const editorialEvents = sqliteTable('editorial_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  kind: text('kind').notNull(),
  payloadJson: text('payload_json').notNull(),
  createdAt: integer('created_at').notNull()
});

export const audioEditions = sqliteTable('audio_editions', {
  cacheKey: text('cache_key').primaryKey(),
  issueNumber: text('issue_number').notNull(),
  articleSlug: text('article_slug').notNull(),
  voice: text('voice').notNull(),
  model: text('model').notNull(),
  mimeType: text('mime_type').notNull(),
  scriptHash: text('script_hash').notNull(),
  createdAt: integer('created_at').notNull()
});

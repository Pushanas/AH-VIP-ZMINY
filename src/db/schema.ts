import { pgTable, text, integer, timestamp, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const vipCodes = pgTable('vip_codes', {
  code: text('code').primaryKey(),
  type: text('type').notNull(), // 'single_use' | 'duration'
  durationDays: integer('duration_days').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  usedCount: integer('used_count').notNull().default(0),
  maxUses: integer('max_uses').notNull().default(1),
  status: text('status').notNull().default('active'), // 'active' | 'used' | 'expired' | 'disabled'
});

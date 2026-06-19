CREATE TABLE `cr_maintenance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month_index` integer NOT NULL,
	`item_key` text NOT NULL,
	`checked` integer DEFAULT false NOT NULL,
	`remarks` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `month_item` ON `cr_maintenance` (`month_index`,`item_key`);--> statement-breakpoint
CREATE TABLE `monthly_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member` text NOT NULL,
	`month_index` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `member_month` ON `monthly_checks` (`member`,`month_index`);--> statement-breakpoint
CREATE TABLE `project_contributions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_contributions_member_unique` ON `project_contributions` (`member`);
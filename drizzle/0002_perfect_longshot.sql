CREATE TABLE `cr_maintenance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month_index` integer NOT NULL,
	`item_key` text NOT NULL,
	`checked` integer DEFAULT false NOT NULL,
	`remarks` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `month_item` ON `cr_maintenance` (`month_index`,`item_key`);
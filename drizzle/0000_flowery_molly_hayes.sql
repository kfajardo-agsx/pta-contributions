CREATE TABLE `monthly_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member` text NOT NULL,
	`month_index` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `member_month` ON `monthly_checks` (`member`,`month_index`);
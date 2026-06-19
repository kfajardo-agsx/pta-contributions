CREATE TABLE `project_contributions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_contributions_member_unique` ON `project_contributions` (`member`);
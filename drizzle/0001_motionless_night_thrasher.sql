CREATE TABLE `cleaning_contributions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month_index` integer NOT NULL,
	`type` text NOT NULL,
	`item_name` text,
	`value` real,
	`contributor` text NOT NULL,
	`remarks` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);

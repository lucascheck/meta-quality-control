ALTER TABLE `meta_connections` ADD `wabaIdEncrypted` text NOT NULL;--> statement-breakpoint
ALTER TABLE `meta_connections` ADD `phoneNumberIdsEncrypted` text NOT NULL;--> statement-breakpoint
ALTER TABLE `meta_connections` DROP COLUMN `wabaId`;--> statement-breakpoint
ALTER TABLE `meta_connections` DROP COLUMN `phoneNumberIds`;
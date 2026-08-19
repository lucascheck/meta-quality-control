CREATE TABLE `message_dispatches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumberId` int NOT NULL,
	`templateId` int,
	`metaMessageId` varchar(120),
	`destination` varchar(40) NOT NULL,
	`templateName` varchar(180) NOT NULL,
	`status` varchar(40) NOT NULL DEFAULT 'SENT',
	`variablesJson` text,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_dispatches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meta_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(120) NOT NULL,
	`wabaId` varchar(80) NOT NULL,
	`accessTokenEncrypted` text NOT NULL,
	`phoneNumberIds` text NOT NULL,
	`apiVersion` varchar(20) NOT NULL DEFAULT 'v26.0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meta_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phone_numbers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`connectionId` int NOT NULL,
	`metaId` varchar(80) NOT NULL,
	`displayPhoneNumber` varchar(40),
	`verifiedName` varchar(180),
	`status` varchar(40),
	`qualityRating` enum('HIGH','MEDIUM','LOW','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
	`messagingLimit` int,
	`currentUsage` int NOT NULL DEFAULT 0,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `phone_numbers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumberId` int NOT NULL,
	`qualityRating` varchar(20) NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quality_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`connectionId` int NOT NULL,
	`metaId` varchar(80),
	`name` varchar(180) NOT NULL,
	`status` varchar(20) NOT NULL,
	`category` varchar(40),
	`language` varchar(20),
	`componentsJson` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);

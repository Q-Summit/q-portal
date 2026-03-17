CREATE TABLE `shift_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`shiftId` text NOT NULL,
	`talentId` text NOT NULL,
	FOREIGN KEY (`shiftId`) REFERENCES `shifts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`talentId`) REFERENCES `talent`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shift_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`shiftId` text NOT NULL,
	`slotTime` integer NOT NULL,
	`headcount` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`shiftId`) REFERENCES `shifts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shift_slots_slot_time_idx` ON `shift_slots` (`slotTime`);
CREATE UNIQUE INDEX `shift_slots_shiftId_slotTime_idx` ON `shift_slots` (`shiftId`, `slotTime`);--> statement-breakpoint
CREATE TABLE `shift_tools` (
	`id` text PRIMARY KEY NOT NULL,
	`shiftId` text NOT NULL,
	`tool` text NOT NULL,
	FOREIGN KEY (`shiftId`) REFERENCES `shifts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` text PRIMARY KEY NOT NULL,
	`location` text NOT NULL,
	`task` text NOT NULL,
	`description` text,
	`notionLink` text,
	`startTime` integer NOT NULL,
	`endTime` integer NOT NULL,
	`createdBy` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `shifts_start_time_idx` ON `shifts` (`startTime`);--> statement-breakpoint
CREATE INDEX `shifts_location_idx` ON `shifts` (`location`);--> statement-breakpoint
ALTER TABLE `user` ADD `isHeadOf` integer DEFAULT false NOT NULL;
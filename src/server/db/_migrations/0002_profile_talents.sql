PRAGMA foreign_keys=OFF;--> statement-breakpoint
ALTER TABLE `member_profile` ADD COLUMN `phoneNumber` text;--> statement-breakpoint
ALTER TABLE `member_profile` ADD COLUMN `privateEmail` text;--> statement-breakpoint
ALTER TABLE `member_profile` ADD COLUMN `linkedInUrl` text;--> statement-breakpoint
CREATE TABLE `talent` (
  `id` text PRIMARY KEY NOT NULL,
  `category` text NOT NULL,
  `key` text NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX `talent_key_unique` ON `talent` (`key`);--> statement-breakpoint
CREATE TABLE `user_talent` (
  `userId` text NOT NULL,
  `talentId` text NOT NULL,
  PRIMARY KEY (`userId`, `talentId`),
  FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`talentId`) REFERENCES `talent`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `talent` (`id`, `category`, `key`) VALUES
  ('driver_18plus', 'driver_license', 'driver_18plus'),
  ('driver_21plus', 'driver_license', 'driver_21plus'),
  ('driver_c1', 'driver_license', 'driver_c1'),
  ('gastro', 'gastronomy', 'gastro');--> statement-breakpoint
PRAGMA foreign_keys=ON;

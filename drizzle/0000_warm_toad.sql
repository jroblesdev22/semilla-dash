CREATE TABLE `cell_members` (
	`id` text PRIMARY KEY NOT NULL,
	`cell_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`joined_at` integer,
	FOREIGN KEY (`cell_id`) REFERENCES `cells`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cell_members_idx_cell_members_cell_id` ON `cell_members` (`cell_id`);--> statement-breakpoint
CREATE INDEX `cell_members_idx_cell_members_user_id` ON `cell_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `cell_members_idx_cell_members_role` ON `cell_members` (`role`);--> statement-breakpoint
CREATE UNIQUE INDEX `cell_members_idx_cell_members_cell_id_user_id` ON `cell_members` (`cell_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `cells` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`course_id` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cells_idx_cells_course_id` ON `cells` (`course_id`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color_hex` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`whatsapp_phone` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_idx_users_email` ON `users` (`email`);
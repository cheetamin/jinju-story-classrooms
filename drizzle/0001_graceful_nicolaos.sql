CREATE TABLE `class_files` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`size` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `class_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`role` text NOT NULL,
	`student_id` text,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `class_students` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`number` integer NOT NULL,
	`name` text NOT NULL,
	`animal` integer NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `class_works` (
	`student_id` text PRIMARY KEY NOT NULL,
	`draft` text,
	`submitted` text,
	`published` text,
	`status` text DEFAULT 'empty' NOT NULL,
	`feedback` text DEFAULT '' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated` text
);
--> statement-breakpoint
CREATE TABLE `classrooms` (
	`id` text PRIMARY KEY NOT NULL,
	`school` text NOT NULL,
	`label` text NOT NULL,
	`teacher_password` text NOT NULL,
	`class_code` text NOT NULL,
	`created` integer NOT NULL
);

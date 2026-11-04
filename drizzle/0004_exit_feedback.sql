CREATE TABLE IF NOT EXISTS `exhibition_feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`receipt` text NOT NULL,
	`school` text NOT NULL,
	`label` text NOT NULL,
	`hearts` integer NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`created` integer NOT NULL,
	CONSTRAINT "feedback_hearts_range" CHECK("exhibition_feedback"."hearts" BETWEEN 1 AND 5),
	CONSTRAINT "feedback_comment_length" CHECK(length("exhibition_feedback"."comment")<=300)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `exhibition_feedback_receipt_unique` ON `exhibition_feedback` (`receipt`);
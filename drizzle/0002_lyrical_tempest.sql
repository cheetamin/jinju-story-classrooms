CREATE INDEX `class_files_owner_idx` ON `class_files` (`class_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `class_students_class_idx` ON `class_students` (`class_id`);
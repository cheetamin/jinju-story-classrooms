DROP TRIGGER IF EXISTS classrooms_capacity_guard;
--> statement-breakpoint
CREATE TRIGGER classrooms_capacity_guard BEFORE INSERT ON classrooms
WHEN (SELECT COUNT(*) FROM classrooms)>=MIN(COALESCE((SELECT json_extract(value,'$.maxClasses') FROM settings WHERE key='operating_policy'),100),CASE WHEN (SELECT value FROM settings WHERE key='file_storage_mode')='d1' THEN 100 ELSE 10000 END)
BEGIN SELECT RAISE(ABORT,'CLASS_CAPACITY'); END;

--> statement-breakpoint
UPDATE settings SET value=json_set(value,'$.maxClasses',100) WHERE key='operating_policy' AND COALESCE(json_extract(value,'$.maxClasses'),100)<100;

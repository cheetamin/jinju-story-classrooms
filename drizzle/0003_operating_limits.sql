CREATE TABLE upload_reservations (id TEXT PRIMARY KEY NOT NULL,class_id TEXT NOT NULL,student_id TEXT NOT NULL,size INTEGER NOT NULL,expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX upload_reservations_class_idx ON upload_reservations(class_id);
--> statement-breakpoint
CREATE INDEX class_sessions_class_idx ON class_sessions(class_id);
--> statement-breakpoint
CREATE TABLE file_objects (id TEXT PRIMARY KEY NOT NULL,body BLOB NOT NULL);
--> statement-breakpoint
CREATE TABLE student_archives (id TEXT PRIMARY KEY NOT NULL,class_id TEXT NOT NULL,number INTEGER NOT NULL,name TEXT NOT NULL,animal INTEGER NOT NULL,password TEXT NOT NULL,archived INTEGER NOT NULL);
--> statement-breakpoint
CREATE TRIGGER classrooms_capacity_guard BEFORE INSERT ON classrooms
WHEN (SELECT COUNT(*) FROM classrooms)>=MIN(COALESCE((SELECT json_extract(value,'$.maxClasses') FROM settings WHERE key='operating_policy'),100),CASE WHEN (SELECT value FROM settings WHERE key='file_storage_mode')='d1' THEN 10 ELSE 10000 END)
BEGIN SELECT RAISE(ABORT,'CLASS_CAPACITY'); END;
--> statement-breakpoint
CREATE TRIGGER classrooms_pause_guard BEFORE INSERT ON classrooms
WHEN COALESCE((SELECT json_extract(value,'$.newClassesPaused') FROM settings WHERE key='operating_policy'),0)=1
BEGIN SELECT RAISE(ABORT,'CLASS_CREATION_PAUSED'); END;
--> statement-breakpoint
CREATE TABLE storage_usage (scope TEXT PRIMARY KEY NOT NULL,bytes INTEGER NOT NULL,files INTEGER NOT NULL);
--> statement-breakpoint
INSERT INTO storage_usage SELECT 'global',COALESCE(SUM(size),0),COUNT(*) FROM (SELECT id,size FROM class_files UNION SELECT id,size FROM files);
--> statement-breakpoint
INSERT INTO storage_usage SELECT 'class:'||class_id,SUM(size),COUNT(*) FROM class_files GROUP BY class_id;
--> statement-breakpoint
INSERT INTO storage_usage SELECT 'student:'||student_id,SUM(size),COUNT(*) FROM class_files GROUP BY student_id;
--> statement-breakpoint
CREATE TRIGGER class_files_usage_insert AFTER INSERT ON class_files BEGIN
 INSERT INTO storage_usage(scope,bytes,files) SELECT 'global',NEW.size,1 WHERE NOT EXISTS(SELECT id FROM files WHERE id=NEW.id) ON CONFLICT(scope) DO UPDATE SET bytes=bytes+NEW.size,files=files+1;
 INSERT INTO storage_usage(scope,bytes,files) VALUES('class:'||NEW.class_id,NEW.size,1) ON CONFLICT(scope) DO UPDATE SET bytes=bytes+NEW.size,files=files+1;
 INSERT INTO storage_usage(scope,bytes,files) VALUES('student:'||NEW.student_id,NEW.size,1) ON CONFLICT(scope) DO UPDATE SET bytes=bytes+NEW.size,files=files+1;
END;
--> statement-breakpoint
CREATE TRIGGER class_files_usage_delete AFTER DELETE ON class_files BEGIN
 UPDATE storage_usage SET bytes=bytes-OLD.size,files=files-1 WHERE scope='global' AND NOT EXISTS(SELECT id FROM files WHERE id=OLD.id);
 UPDATE storage_usage SET bytes=bytes-OLD.size,files=files-1 WHERE scope IN ('class:'||OLD.class_id,'student:'||OLD.student_id);
END;
--> statement-breakpoint
CREATE TRIGGER legacy_files_usage_insert AFTER INSERT ON files BEGIN
 INSERT INTO storage_usage(scope,bytes,files) SELECT 'global',NEW.size,1 WHERE NOT EXISTS(SELECT id FROM class_files WHERE id=NEW.id) ON CONFLICT(scope) DO UPDATE SET bytes=bytes+NEW.size,files=files+1;
END;
--> statement-breakpoint
CREATE TRIGGER legacy_files_usage_delete AFTER DELETE ON files BEGIN
 UPDATE storage_usage SET bytes=bytes-OLD.size,files=files-1 WHERE scope='global' AND NOT EXISTS(SELECT id FROM class_files WHERE id=OLD.id);
END;
--> statement-breakpoint
CREATE TRIGGER class_files_usage_move AFTER UPDATE OF student_id,class_id,size ON class_files BEGIN
 UPDATE storage_usage SET bytes=bytes-OLD.size,files=files-1 WHERE scope IN ('class:'||OLD.class_id,'student:'||OLD.student_id);
 INSERT INTO storage_usage(scope,bytes,files) VALUES('class:'||NEW.class_id,NEW.size,1) ON CONFLICT(scope) DO UPDATE SET bytes=bytes+NEW.size,files=files+1;
 INSERT INTO storage_usage(scope,bytes,files) VALUES('student:'||NEW.student_id,NEW.size,1) ON CONFLICT(scope) DO UPDATE SET bytes=bytes+NEW.size,files=files+1;
 UPDATE storage_usage SET bytes=bytes+NEW.size-OLD.size WHERE scope='global' AND NOT EXISTS(SELECT id FROM files WHERE id=NEW.id);
END;

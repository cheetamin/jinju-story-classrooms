import {sql} from 'drizzle-orm';
import {sqliteTable,text,integer,index,blob,check} from 'drizzle-orm/sqlite-core';
export const settings=sqliteTable('settings',{key:text('key').primaryKey(),value:text('value').notNull()});
export const students=sqliteTable('students',{id:text('id').primaryKey(),name:text('name').notNull(),animal:integer('animal').notNull(),password:text('password').notNull()});
export const works=sqliteTable('works',{studentId:text('student_id').primaryKey(),draft:text('draft'),submitted:text('submitted'),published:text('published'),status:text('status').notNull().default('empty'),feedback:text('feedback').notNull().default(''),revision:integer('revision').notNull().default(0),updated:text('updated')});
export const sessions=sqliteTable('sessions',{token:text('token').primaryKey(),role:text('role').notNull(),studentId:text('student_id'),expires:integer('expires').notNull()});
export const files=sqliteTable('files',{id:text('id').primaryKey(),studentId:text('student_id').notNull(),name:text('name').notNull(),type:text('type').notNull(),size:integer('size').notNull(),created:integer('created').notNull()});
export const limits=sqliteTable('limits',{key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull()});

// Additive classroom storage. The original class tables are preserved unchanged.
export const classrooms=sqliteTable('classrooms',{id:text('id').primaryKey(),school:text('school').notNull(),label:text('label').notNull(),region:text('region').notNull().default('진주'),regionRevision:integer('region_revision').notNull().default(0),teacherPassword:text('teacher_password').notNull(),classCode:text('class_code').notNull(),created:integer('created').notNull()});
export const classStudents=sqliteTable('class_students',{id:text('id').primaryKey(),classId:text('class_id').notNull(),number:integer('number').notNull(),name:text('name').notNull(),animal:integer('animal').notNull(),password:text('password').notNull()},t=>[index('class_students_class_idx').on(t.classId)]);
export const classWorks=sqliteTable('class_works',{studentId:text('student_id').primaryKey(),draft:text('draft'),submitted:text('submitted'),published:text('published'),status:text('status').notNull().default('empty'),feedback:text('feedback').notNull().default(''),revision:integer('revision').notNull().default(0),updated:text('updated')});
export const classSessions=sqliteTable('class_sessions',{token:text('token').primaryKey(),classId:text('class_id').notNull(),role:text('role').notNull(),studentId:text('student_id'),expires:integer('expires').notNull()},t=>[index('class_sessions_class_idx').on(t.classId)]);
export const classFiles=sqliteTable('class_files',{id:text('id').primaryKey(),classId:text('class_id').notNull(),studentId:text('student_id').notNull(),name:text('name').notNull(),type:text('type').notNull(),size:integer('size').notNull(),created:integer('created').notNull()},t=>[index('class_files_owner_idx').on(t.classId,t.studentId)]);

export const uploadReservations=sqliteTable('upload_reservations',{id:text('id').primaryKey(),classId:text('class_id').notNull(),studentId:text('student_id').notNull(),size:integer('size').notNull(),expires:integer('expires').notNull()},t=>[index('upload_reservations_class_idx').on(t.classId)]);
export const fileObjects=sqliteTable('file_objects',{id:text('id').primaryKey(),body:blob('body',{mode:'buffer'}).notNull()});
export const studentArchives=sqliteTable('student_archives',{id:text('id').primaryKey(),classId:text('class_id').notNull(),number:integer('number').notNull(),name:text('name').notNull(),animal:integer('animal').notNull(),password:text('password').notNull(),archived:integer('archived').notNull()});

export const storageUsage=sqliteTable('storage_usage',{scope:text('scope').primaryKey(),bytes:integer('bytes').notNull(),files:integer('files').notNull()});

export const exhibitionFeedback=sqliteTable('exhibition_feedback',{id:integer('id').primaryKey({autoIncrement:true}),receipt:text('receipt').notNull().unique(),school:text('school').notNull(),label:text('label').notNull(),hearts:integer('hearts').notNull(),comment:text('comment').notNull().default(''),created:integer('created').notNull()},t=>[check('feedback_hearts_range',sql`${t.hearts} BETWEEN 1 AND 5`),check('feedback_comment_length',sql`length(${t.comment})<=300`)]);

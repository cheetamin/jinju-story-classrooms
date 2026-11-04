# Student entry, identity and teacher trial

The user reported a false default school/class during entry, student submissions rejected after login, and numeric student headings. They want a documented teacher trial student named 교사용 with code rytkdyd, available in every class, alongside existing read-only common examples.

Keep student records/works/passwords and free deployment bindings. Use current school/class metadata only after loading. Authenticate student mutations against the editor's expected student id. Separate teacher/student/viewer HttpOnly cookies per class and select context server-side; old single cookies remain compatible. Preserved original backend receives equivalent request context and isolated cookies. Expired/mismatched sessions trigger reauthentication without discarding dirty drafts.

A teacher trial is a virtual demo student scoped to an authenticated classroom. Its work uses class_works student_id CLASS:demo and its files use the same owner, without adding a real class_students row or consuming a real student's number. Initialize from a generic text-only starter. Exclude trial from real roster/count/password operations. A teacher can review/approve its submission separately from the protected common example. Shared demo credential is intentionally documented; actual student credentials stay private.

Studio uses an authenticated profile from /mine, commits loaded state atomically, and shows the actual student name. Numeric-only stored names cannot be invented; avoid presenting a number as a person's name and guide teachers to correct the roster. Do not modify real names without evidence.

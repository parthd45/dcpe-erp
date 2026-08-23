-- ==============================================================================
-- DCPE ERP (Degree College of Physical Education HVPM)
-- Complete Production Database Schema & Safe Idempotent SQL Script
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STAFF TABLE (Faculty, HOD, Admin)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('faculty', 'hod', 'admin')),
    department_id TEXT NOT NULL,
    department_name TEXT NOT NULL,
    designation TEXT DEFAULT 'Assistant Professor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    personal_email TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    prn TEXT UNIQUE NOT NULL,
    enrollment_no TEXT NOT NULL,
    branch_code TEXT NOT NULL,
    department_id TEXT NOT NULL,
    department_name TEXT NOT NULL,
    course TEXT NOT NULL,
    year TEXT DEFAULT '1st Year (Semester I & II)',
    phone TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by TEXT DEFAULT '',
    rejection_reason TEXT DEFAULT '',
    attendance TEXT DEFAULT '0.0%',
    cgpa TEXT DEFAULT 'N/A',
    fees_status TEXT DEFAULT 'Pending',
    roll_no TEXT DEFAULT '',
    gender TEXT DEFAULT 'Male',
    dob TEXT DEFAULT '',
    blood_group TEXT DEFAULT '',
    category TEXT DEFAULT 'OPEN / General',
    aadhaar_no TEXT DEFAULT '',
    guardian_name TEXT DEFAULT '',
    guardian_phone TEXT DEFAULT '',
    permanent_address TEXT DEFAULT '',
    photo_url TEXT,
    doc_marksheet_10th TEXT,
    doc_marksheet_12th TEXT,
    doc_grad_marksheet TEXT,
    doc_id_proof TEXT,
    doc_status TEXT DEFAULT 'Pending Verification',
    hall_ticket_approved BOOLEAN DEFAULT false,
    hall_ticket_approved_at TIMESTAMP WITH TIME ZONE,
    hall_ticket_approved_by TEXT,
    score_10th TEXT,
    score_12th TEXT,
    score_grad TEXT,
    score_aadhaar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department_id TEXT NOT NULL,
    course TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ATTENDANCE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    topic TEXT NOT NULL,
    present_students JSONB DEFAULT '[]'::jsonb,
    absent_students JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. MARKS / EXAMINATION TABLE
CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    semester TEXT DEFAULT 'Semester I',
    internal_marks NUMERIC(5,2) DEFAULT 0,
    external_marks NUMERIC(5,2) DEFAULT 0,
    total_marks NUMERIC(5,2) DEFAULT 0,
    grade TEXT DEFAULT 'F',
    credits INTEGER DEFAULT 4,
    staff_id UUID REFERENCES public.staff(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    tag TEXT DEFAULT 'general',
    scope TEXT DEFAULT 'all',
    publisher_id UUID REFERENCES public.staff(id),
    publisher_name TEXT NOT NULL,
    publisher_role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PLACEMENT DRIVES TABLE
CREATE TABLE IF NOT EXISTS public.placement_drives (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    job_title TEXT NOT NULL,
    job_type TEXT DEFAULT 'Full-Time Campus Drive',
    package_ctc TEXT,
    location TEXT,
    eligible_departments JSONB DEFAULT '[]'::jsonb,
    eligible_courses JSONB DEFAULT '[]'::jsonb,
    min_cgpa NUMERIC(4,2) DEFAULT 6.0,
    min_attendance NUMERIC(4,2) DEFAULT 75.0,
    drive_date DATE,
    deadline DATE,
    job_description TEXT,
    selection_rounds TEXT,
    status TEXT DEFAULT 'Active',
    openings INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. PLACEMENT APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.placement_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drive_id TEXT REFERENCES public.placement_drives(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    prn TEXT NOT NULL,
    course TEXT NOT NULL,
    cgpa NUMERIC(4,2),
    attendance NUMERIC(4,2),
    status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Shortlisted', 'Interview Scheduled', 'Placed', 'Rejected')),
    resume_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. STUDENT LEAVES & GRIEVANCES TABLE
CREATE TABLE IF NOT EXISTS public.student_leaves (
    id TEXT PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    prn TEXT NOT NULL,
    department TEXT NOT NULL,
    course TEXT NOT NULL,
    type TEXT DEFAULT 'leave' CHECK (type IN ('leave', 'grievance')),
    category TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    emergency_contact TEXT,
    requires_principal BOOLEAN DEFAULT false,
    stage TEXT DEFAULT 'teacher' CHECK (stage IN ('teacher', 'hod', 'principal', 'completed', 'rejected')),
    status TEXT DEFAULT 'pending_teacher' CHECK (status IN ('pending_teacher', 'pending_hod', 'pending_principal', 'approved', 'rejected')),
    data_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. CENTRAL LIBRARY BOOKS CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.library_books (
    id TEXT PRIMARY KEY,
    isbn TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    copies_available INTEGER DEFAULT 1,
    total_copies INTEGER DEFAULT 1,
    shelf TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. LIBRARY ISSUED BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.library_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accession_no TEXT NOT NULL,
    book_id TEXT REFERENCES public.library_books(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    issued_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
    fine NUMERIC(6,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_issues ENABLE ROW LEVEL SECURITY;

-- 14. DROP EXISTING POLICIES BEFORE RE-CREATING (PREVENTS "ALREADY EXISTS" ERROR)
DROP POLICY IF EXISTS "Public Read All Staff" ON public.staff;
DROP POLICY IF EXISTS "Public Write Staff" ON public.staff;
DROP POLICY IF EXISTS "Public Update Staff" ON public.staff;

DROP POLICY IF EXISTS "Public Read All Students" ON public.students;
DROP POLICY IF EXISTS "Public Write Students" ON public.students;
DROP POLICY IF EXISTS "Public Update Students" ON public.students;

DROP POLICY IF EXISTS "Public Read All Subjects" ON public.subjects;
DROP POLICY IF EXISTS "Public Read All Attendance" ON public.attendance_logs;
DROP POLICY IF EXISTS "Public Insert Attendance" ON public.attendance_logs;

DROP POLICY IF EXISTS "Public Read All Marks" ON public.marks;
DROP POLICY IF EXISTS "Public Insert/Update Marks" ON public.marks;

DROP POLICY IF EXISTS "Public Read All Notices" ON public.notices;
DROP POLICY IF EXISTS "Public Insert Notices" ON public.notices;

DROP POLICY IF EXISTS "Public All Placement Drives" ON public.placement_drives;
DROP POLICY IF EXISTS "Public All Placement Apps" ON public.placement_applications;

DROP POLICY IF EXISTS "Public All Student Leaves" ON public.student_leaves;
DROP POLICY IF EXISTS "Public All Library Books" ON public.library_books;
DROP POLICY IF EXISTS "Public All Library Issues" ON public.library_issues;

-- 15. RE-CREATE RLS ACCESS POLICIES
CREATE POLICY "Public Read All Staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Public Write Staff" ON public.staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Staff" ON public.staff FOR UPDATE USING (true);

CREATE POLICY "Public All Students" ON public.students FOR ALL USING (true);

CREATE POLICY "Public Read All Subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public Read All Attendance" ON public.attendance_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert Attendance" ON public.attendance_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read All Marks" ON public.marks FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Marks" ON public.marks FOR ALL USING (true);

CREATE POLICY "Public Read All Notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Public Insert Notices" ON public.notices FOR INSERT WITH CHECK (true);

-- 16. SAFE COLUMN MIGRATIONS (For existing databases)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Male';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS dob TEXT DEFAULT '';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS blood_group TEXT DEFAULT '';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'OPEN / General';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS aadhaar_no TEXT DEFAULT '';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS guardian_name TEXT DEFAULT '';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS guardian_phone TEXT DEFAULT '';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS permanent_address TEXT DEFAULT '';

CREATE POLICY "Public All Placement Drives" ON public.placement_drives FOR ALL USING (true);
CREATE POLICY "Public All Placement Apps" ON public.placement_applications FOR ALL USING (true);

CREATE POLICY "Public All Student Leaves" ON public.student_leaves FOR ALL USING (true);
CREATE POLICY "Public All Library Books" ON public.library_books FOR ALL USING (true);
CREATE POLICY "Public All Library Issues" ON public.library_issues FOR ALL USING (true);

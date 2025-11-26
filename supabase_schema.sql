-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Public profile data for users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role text check (role in ('CLIENT', 'INSTRUCTOR', 'ADMIN')) default 'CLIENT',
  package_credits integer default 0,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLASS TYPES (Definitions of classes)
create table public.class_types (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  duration_minutes integer not null,
  capacity integer default 1,
  price integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SESSIONS (Scheduled instances of classes)
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  class_type_id uuid references public.class_types not null,
  instructor_id uuid references public.profiles not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  capacity integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENROLLMENTS (Who is in which session)
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.sessions not null,
  user_id uuid references public.profiles not null,
  status text check (status in ('REGISTERED', 'CANCELLED')) default 'REGISTERED',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(session_id, user_id)
);

-- PACKAGES (Credit bundles available for purchase)
create table public.packages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  credits integer not null,
  price integer not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PURCHASES (Transaction history)
create table public.purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles not null,
  package_id uuid references public.packages,
  package_name text, -- Snapshot in case package is deleted
  amount_paid integer not null,
  credits_added integer not null,
  purchase_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.class_types enable row level security;
alter table public.sessions enable row level security;
alter table public.enrollments enable row level security;
alter table public.packages enable row level security;
alter table public.purchases enable row level security;

-- POLICIES

-- Profiles: Everyone can read basic info (for instructors), Users can update own
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Class Types: Public read, Admin write
create policy "Class types are viewable by everyone" on public.class_types
  for select using (true);

-- Sessions: Public read, Instructor/Admin write
create policy "Sessions are viewable by everyone" on public.sessions
  for select using (true);

-- Enrollments: Users see own, Instructors see their sessions
create policy "Users can see own enrollments" on public.enrollments
  for select using (auth.uid() = user_id);

create policy "Users can insert own enrollment" on public.enrollments
  for insert with check (auth.uid() = user_id);

-- Packages: Public read
create policy "Packages are viewable by everyone" on public.packages
  for select using (true);

-- Purchases: Users see own
create policy "Users can see own purchases" on public.purchases
  for select using (auth.uid() = user_id);

-- FUNCTIONS & TRIGGERS

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, package_credits, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'CLIENT'),
    0,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- AVAILABILITY (Instructor schedule)
create table public.availability (
  id uuid default uuid_generate_v4() primary key,
  instructor_id uuid references public.profiles not null,
  day_of_week text not null, -- 'Monday', 'Tuesday', etc.
  start_time text not null, -- '09:00'
  end_time text not null, -- '17:00'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BLOCKOUTS (Instructor time off)
create table public.blockouts (
  id uuid default uuid_generate_v4() primary key,
  instructor_id uuid references public.profiles not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STUDENT PROGRESS (Skills tracking)
create table public.student_progress (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles not null,
  skill_id text not null,
  status text check (status in ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')) default 'NOT_STARTED',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, skill_id)
);

-- RLS for New Tables
alter table public.availability enable row level security;
alter table public.blockouts enable row level security;
alter table public.student_progress enable row level security;

-- Availability Policies
create policy "Availability viewable by everyone" on public.availability
  for select using (true);

create policy "Instructors can manage own availability" on public.availability
  for all using (auth.uid() = instructor_id);

-- Blockouts Policies
create policy "Blockouts viewable by everyone" on public.blockouts
  for select using (true);

create policy "Instructors can manage own blockouts" on public.blockouts
  for all using (auth.uid() = instructor_id);

-- Student Progress Policies
create policy "Progress viewable by student and instructors" on public.student_progress
  for select using (
    auth.uid() = student_id or 
    exists (select 1 from public.profiles where id = auth.uid() and role in ('INSTRUCTOR', 'ADMIN'))
  );

create policy "Instructors and Admins can update progress" on public.student_progress
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('INSTRUCTOR', 'ADMIN'))
  );

-- SETTINGS (Global App Configuration)
create table public.settings (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Settings Policies
create policy "Settings viewable by everyone" on public.settings
  for select using (true);

create policy "Admins can update settings" on public.settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

-- Seed default settings
insert into public.settings (key, value) values 
('pool_capacity', '25'),
('cancellation_hours', '24'),
('maintenance_mode', 'false'),
('contact_email', '"admin@lovableswim.com"');


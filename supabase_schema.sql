-- =========================================================
-- VEHICLEVISION AI - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =========================================================

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);


-- 2. Create Detection Logs Table
CREATE TABLE IF NOT EXISTS public.detection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    source TEXT NOT NULL,
    cars INTEGER DEFAULT 0,
    motorcycles INTEGER DEFAULT 0,
    trucks INTEGER DEFAULT 0,
    buses INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_detection_logs_user_id ON public.detection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_detection_logs_timestamp ON public.detection_logs(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.detection_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can view own detection logs" ON public.detection_logs;
DROP POLICY IF EXISTS "Users can insert own detection logs" ON public.detection_logs;
DROP POLICY IF EXISTS "Users can delete own detection logs" ON public.detection_logs;
DROP POLICY IF EXISTS "Users can update own detection logs" ON public.detection_logs;

-- RLS Policy: Users can view ONLY their own detection logs
CREATE POLICY "Users can view own detection logs" 
ON public.detection_logs FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert ONLY their own detection logs
CREATE POLICY "Users can insert own detection logs" 
ON public.detection_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete ONLY their own detection logs
CREATE POLICY "Users can delete own detection logs" 
ON public.detection_logs FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policy: Users can update ONLY their own detection logs
CREATE POLICY "Users can update own detection logs" 
ON public.detection_logs FOR UPDATE 
USING (auth.uid() = user_id);


-- 3. Automatic Profile Creation Trigger on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

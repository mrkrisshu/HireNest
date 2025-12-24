-- HireNest Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- First, drop existing objects if they exist (for clean reinstall)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.recruiter_profiles CASCADE;
DROP TABLE IF EXISTS public.candidate_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TYPE IF EXISTS application_status;
DROP TYPE IF EXISTS job_status;
DROP TYPE IF EXISTS user_role;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'RECRUITER', 'CANDIDATE');
CREATE TYPE job_status AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE application_status AS ENUM ('PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'CANDIDATE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Candidate profiles
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  phone TEXT,
  photo_url TEXT,
  resume_url TEXT
);

-- Recruiter profiles
CREATE TABLE public.recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  company_email TEXT NOT NULL DEFAULT '',
  description TEXT
);

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT,
  job_type TEXT,
  experience TEXT,
  skills TEXT[] DEFAULT '{}',
  recruiter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status job_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resume_url TEXT NOT NULL,
  cover_letter TEXT,
  status application_status NOT NULL DEFAULT 'PENDING',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can do anything on users" ON public.users
  FOR ALL USING (true);

-- RLS Policies for candidate_profiles  
CREATE POLICY "Candidates can view their own profile" ON public.candidate_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Candidates can update their own profile" ON public.candidate_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can do anything on candidate_profiles" ON public.candidate_profiles
  FOR ALL USING (true);

-- RLS Policies for recruiter_profiles
CREATE POLICY "Recruiters can view their own profile" ON public.recruiter_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Recruiters can update their own profile" ON public.recruiter_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view recruiter profiles" ON public.recruiter_profiles
  FOR SELECT USING (true);
CREATE POLICY "Service role can do anything on recruiter_profiles" ON public.recruiter_profiles
  FOR ALL USING (true);

-- RLS Policies for jobs
CREATE POLICY "Anyone can view open jobs" ON public.jobs
  FOR SELECT USING (status = 'OPEN' OR auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can insert jobs" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can update their jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can delete their jobs" ON public.jobs
  FOR DELETE USING (auth.uid() = recruiter_id);
CREATE POLICY "Service role can do anything on jobs" ON public.jobs
  FOR ALL USING (true);

-- RLS Policies for applications
CREATE POLICY "Candidates can view their own applications" ON public.applications
  FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates can insert applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND recruiter_id = auth.uid())
  );
CREATE POLICY "Recruiters can update applications for their jobs" ON public.applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND recruiter_id = auth.uid())
  );
CREATE POLICY "Service role can do anything on applications" ON public.applications
  FOR ALL USING (true);

-- Function to handle new user signup (SIMPLIFIED - more robust)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Get role from metadata, default to CANDIDATE
  user_role_value := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'CANDIDATE'::user_role
  );
  
  -- Insert into users table
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, user_role_value);
  
  -- Create profile based on role
  IF user_role_value = 'CANDIDATE' THEN
    INSERT INTO public.candidate_profiles (user_id, phone)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'phone');
  ELSIF user_role_value = 'RECRUITER' THEN
    INSERT INTO public.recruiter_profiles (user_id, company_name, company_email, description)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'company_email', ''),
      NEW.raw_user_meta_data->>'description'
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the auth creation
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_jobs_recruiter_id ON public.jobs(recruiter_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX idx_applications_status ON public.applications(status);

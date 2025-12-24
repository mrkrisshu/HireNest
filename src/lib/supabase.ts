import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Types for our database
export type UserRole = 'ADMIN' | 'RECRUITER' | 'CANDIDATE'
export type JobStatus = 'OPEN' | 'CLOSED'
export type ApplicationStatus = 'PENDING' | 'VIEWED' | 'SHORTLISTED' | 'REJECTED'

export interface User {
    id: string
    email: string
    role: UserRole
    created_at: string
}

export interface CandidateProfile {
    id: string
    user_id: string
    phone: string | null
    photo_url: string | null
    resume_url: string | null
}

export interface RecruiterProfile {
    id: string
    user_id: string
    company_name: string
    company_email: string
    description: string | null
}

export interface Job {
    id: string
    title: string
    description: string
    location: string
    salary: string | null
    job_type: string | null
    experience: string | null
    skills: string[]
    recruiter_id: string
    status: JobStatus
    created_at: string
    updated_at: string
}

export interface Application {
    id: string
    job_id: string
    candidate_id: string
    resume_url: string
    cover_letter: string | null
    status: ApplicationStatus
    applied_at: string
}

// Client for browser/client components
export function createBrowserClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Client for server components and API routes
export async function createSupabaseServer() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignore errors in Server Components
                    }
                },
            },
        }
    )
}

// Admin client for server-side operations (bypasses RLS)
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

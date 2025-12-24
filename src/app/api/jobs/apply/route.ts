import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServer, createAdminClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer()
        const adminSupabase = createAdminClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        console.log("Apply API - Auth check:", user?.id, user?.email, "Auth error:", authError?.message)

        if (authError || !user) {
            console.log("Apply API - Unauthorized:", authError?.message)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Check if user is a candidate (use admin client to bypass RLS)
        const { data: userData, error: userError } = await adminSupabase
            .from('users')
            .select('role, candidate_profiles(resume_url)')
            .eq('id', user.id)
            .single()

        console.log("Apply API - User data:", JSON.stringify(userData), "Error:", userError)

        if (!userData || userData.role !== 'CANDIDATE') {
            console.log("Apply API - Rejected: role check failed", userData?.role)
            return NextResponse.json(
                { error: "Only candidates can apply for jobs" },
                { status: 403 }
            )
        }

        // Check if candidate has a resume - handle both array and single object
        const candidateProfiles = userData.candidate_profiles
        let resume_url: string | null = null

        if (Array.isArray(candidateProfiles) && candidateProfiles.length > 0) {
            resume_url = candidateProfiles[0]?.resume_url
        } else if (candidateProfiles && typeof candidateProfiles === 'object') {
            resume_url = (candidateProfiles as { resume_url: string | null }).resume_url
        }

        console.log("Apply API - Resume URL:", resume_url)

        if (!resume_url) {
            return NextResponse.json(
                { error: "You must upload a resume before applying. Go to your dashboard to upload your resume." },
                { status: 400 }
            )
        }

        const { job_id, cover_letter } = await request.json()

        if (!job_id) {
            return NextResponse.json(
                { error: "Job ID is required" },
                { status: 400 }
            )
        }

        // Check if job exists and is open
        const { data: job } = await supabase
            .from('jobs')
            .select('id, status')
            .eq('id', job_id)
            .single()

        if (!job) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            )
        }

        if (job.status !== 'OPEN') {
            return NextResponse.json(
                { error: "This job is no longer accepting applications" },
                { status: 400 }
            )
        }

        // Check if already applied
        const { data: existing } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', job_id)
            .eq('candidate_id', user.id)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: "You have already applied for this job" },
                { status: 400 }
            )
        }

        // Create application
        const { data: application, error } = await supabase
            .from('applications')
            .insert({
                job_id,
                candidate_id: user.id,
                resume_url,
                cover_letter: cover_letter || null,
                status: 'PENDING'
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "Application submitted successfully",
            application
        })
    } catch (error) {
        console.error("Apply error:", error)
        return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 }
        )
    }
}

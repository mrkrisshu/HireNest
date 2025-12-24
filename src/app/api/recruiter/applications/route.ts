import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase"

export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Check if user is a recruiter
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!userData || userData.role !== 'RECRUITER') {
            return NextResponse.json(
                { error: "Only recruiters can access this" },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const job_id = searchParams.get("job_id")
        const status = searchParams.get("status")

        // Get recruiter's jobs first
        const { data: recruiterJobs } = await supabase
            .from('jobs')
            .select('id')
            .eq('recruiter_id', user.id)

        const jobIds = recruiterJobs?.map(j => j.id) || []

        if (jobIds.length === 0) {
            return NextResponse.json({ applications: [] })
        }

        // Build query for applications
        let query = supabase
            .from('applications')
            .select(`
        *,
        job:jobs(id, title, location),
        candidate:users!applications_candidate_id_fkey(
          id, email,
          candidate_profiles(phone, photo_url)
        )
      `)
            .in('job_id', jobIds)
            .order('applied_at', { ascending: false })

        if (job_id) {
            query = query.eq('job_id', job_id)
        }
        if (status) {
            query = query.eq('status', status)
        }

        const { data: applications, error } = await query

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        const formattedApplications = applications?.map(app => ({
            id: app.id,
            status: app.status,
            applied_at: app.applied_at,
            resume_url: app.resume_url,
            cover_letter: app.cover_letter,
            job: app.job,
            candidate: {
                id: app.candidate?.id,
                email: app.candidate?.email,
                phone: app.candidate?.candidate_profiles?.phone,
                photo_url: app.candidate?.candidate_profiles?.photo_url
            }
        }))

        return NextResponse.json({ applications: formattedApplications })
    } catch (error) {
        console.error("Get applications error:", error)
        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        )
    }
}

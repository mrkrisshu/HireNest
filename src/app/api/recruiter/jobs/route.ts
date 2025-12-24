import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase"

export async function GET() {
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

        // Get recruiter's jobs with application stats
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select(`
        *,
        applications(status)
      `)
            .eq('recruiter_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        const formattedJobs = jobs?.map(job => {
            const apps = job.applications || []
            return {
                id: job.id,
                title: job.title,
                location: job.location,
                status: job.status,
                created_at: job.created_at,
                total_applications: apps.length,
                pending: apps.filter((a: { status: string }) => a.status === 'PENDING').length,
                viewed: apps.filter((a: { status: string }) => a.status === 'VIEWED').length,
                shortlisted: apps.filter((a: { status: string }) => a.status === 'SHORTLISTED').length,
                rejected: apps.filter((a: { status: string }) => a.status === 'REJECTED').length
            }
        })

        const openJobs = formattedJobs?.filter(j => j.status === 'OPEN').length || 0
        const closedJobs = formattedJobs?.filter(j => j.status === 'CLOSED').length || 0
        const totalApps = formattedJobs?.reduce((sum, j) => sum + j.total_applications, 0) || 0

        return NextResponse.json({
            jobs: formattedJobs,
            stats: {
                total_jobs: formattedJobs?.length || 0,
                open_jobs: openJobs,
                closed_jobs: closedJobs,
                total_applications: totalApps
            }
        })
    } catch (error) {
        console.error("Get recruiter jobs error:", error)
        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        )
    }
}

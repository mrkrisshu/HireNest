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

        // Check if user is a candidate
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!userData || userData.role !== 'CANDIDATE') {
            return NextResponse.json(
                { error: "Only candidates can access this" },
                { status: 403 }
            )
        }

        // Get candidate's applications
        const { data: applications, error } = await supabase
            .from('applications')
            .select(`
        *,
        job:jobs(
          id, title, location, salary, job_type, status,
          recruiter:users!jobs_recruiter_id_fkey(
            recruiter_profiles(company_name)
          )
        )
      `)
            .eq('candidate_id', user.id)
            .order('applied_at', { ascending: false })

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
            cover_letter: app.cover_letter,
            job: {
                id: app.job?.id,
                title: app.job?.title,
                location: app.job?.location,
                salary: app.job?.salary,
                job_type: app.job?.job_type,
                status: app.job?.status,
                company: app.job?.recruiter?.recruiter_profiles?.company_name || 'Unknown'
            }
        }))

        const stats = {
            total: applications?.length || 0,
            pending: applications?.filter(a => a.status === 'PENDING').length || 0,
            viewed: applications?.filter(a => a.status === 'VIEWED').length || 0,
            shortlisted: applications?.filter(a => a.status === 'SHORTLISTED').length || 0,
            rejected: applications?.filter(a => a.status === 'REJECTED').length || 0
        }

        return NextResponse.json({
            applications: formattedApplications,
            stats
        })
    } catch (error) {
        console.error("Get candidate applications error:", error)
        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        )
    }
}

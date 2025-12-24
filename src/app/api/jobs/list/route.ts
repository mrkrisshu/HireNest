import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase"

export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer()
        const { searchParams } = new URL(request.url)

        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "12")
        const search = searchParams.get("search") || ""
        const location = searchParams.get("location") || ""
        const job_type = searchParams.get("job_type") || ""
        const status = searchParams.get("status") || "OPEN"

        const offset = (page - 1) * limit

        // Build query
        let query = supabase
            .from('jobs')
            .select(`
        *,
        recruiter:users!jobs_recruiter_id_fkey(
          email,
          recruiter_profiles(company_name, company_email, description)
        ),
        applications(count)
      `, { count: 'exact' })
            .eq('status', status)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
        }
        if (location) {
            query = query.ilike('location', `%${location}%`)
        }
        if (job_type) {
            query = query.eq('job_type', job_type)
        }

        const { data: jobs, error, count } = await query

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        // Format jobs
        const formattedJobs = jobs?.map(job => ({
            id: job.id,
            title: job.title,
            description: job.description,
            location: job.location,
            salary: job.salary,
            job_type: job.job_type,
            experience: job.experience,
            skills: job.skills,
            status: job.status,
            created_at: job.created_at,
            company: job.recruiter?.recruiter_profiles?.company_name || 'Unknown Company',
            applications_count: job.applications?.[0]?.count || 0
        }))

        return NextResponse.json({
            jobs: formattedJobs,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
            }
        })
    } catch (error) {
        console.error("List jobs error:", error)
        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createSupabaseServer()

        const { data: job, error } = await supabase
            .from('jobs')
            .select(`
        *,
        recruiter:users!jobs_recruiter_id_fkey(
          email,
          recruiter_profiles(company_name, company_email, description)
        ),
        applications(count)
      `)
            .eq('id', id)
            .single()

        if (error || !job) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            )
        }

        // Check if current user has applied
        let has_applied = false
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data: application } = await supabase
                .from('applications')
                .select('id')
                .eq('job_id', id)
                .eq('candidate_id', user.id)
                .single()

            has_applied = !!application
        }

        return NextResponse.json({
            job: {
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
                updated_at: job.updated_at,
                company: job.recruiter?.recruiter_profiles?.company_name || 'Unknown Company',
                company_email: job.recruiter?.recruiter_profiles?.company_email,
                company_description: job.recruiter?.recruiter_profiles?.description,
                applications_count: job.applications?.[0]?.count || 0,
                has_applied
            }
        })
    } catch (error) {
        console.error("Get job error:", error)
        return NextResponse.json(
            { error: "Failed to fetch job" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createSupabaseServer()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()

        const { error } = await supabase
            .from('jobs')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: "Job updated successfully" })
    } catch (error) {
        console.error("Update job error:", error)
        return NextResponse.json(
            { error: "Failed to update job" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createSupabaseServer()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: "Job deleted successfully" })
    } catch (error) {
        console.error("Delete job error:", error)
        return NextResponse.json(
            { error: "Failed to delete job" },
            { status: 500 }
        )
    }
}

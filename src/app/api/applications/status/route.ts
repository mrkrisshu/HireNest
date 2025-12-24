import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase"

export async function PATCH(request: NextRequest) {
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
                { error: "Only recruiters can update application status" },
                { status: 403 }
            )
        }

        const { application_id, status } = await request.json()

        if (!application_id || !status) {
            return NextResponse.json(
                { error: "Application ID and status are required" },
                { status: 400 }
            )
        }

        const validStatuses = ['PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED']
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            )
        }

        // Check if the application belongs to one of the recruiter's jobs
        const { data: application } = await supabase
            .from('applications')
            .select(`
        id,
        jobs:job_id (recruiter_id)
      `)
            .eq('id', application_id)
            .single()

        // Get recruiter_id from the joined job
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jobData = application?.jobs as any
        const recruiterId = Array.isArray(jobData) ? jobData[0]?.recruiter_id : jobData?.recruiter_id

        if (!application || recruiterId !== user.id) {
            return NextResponse.json(
                { error: "Application not found or not authorized" },
                { status: 404 }
            )
        }

        // Update status
        const { error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', application_id)

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: "Status updated successfully" })
    } catch (error) {
        console.error("Update status error:", error)
        return NextResponse.json(
            { error: "Failed to update status" },
            { status: 500 }
        )
    }
}

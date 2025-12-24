import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServer, createAdminClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized - please login" },
                { status: 401 }
            )
        }

        // Use admin client to check role (bypasses RLS)
        const adminClient = createAdminClient()
        const { data: userData, error: userError } = await adminClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        // If user not found in DB, check auth metadata
        let userRole = userData?.role
        if (!userData) {
            userRole = user.user_metadata?.role
        }

        if (!userRole || userRole !== 'RECRUITER') {
            return NextResponse.json(
                { error: `Only recruiters can post jobs. Your role: ${userRole || 'unknown'}` },
                { status: 403 }
            )
        }

        const { title, description, location, salary, job_type, experience, skills } = await request.json()

        if (!title || !description || !location) {
            return NextResponse.json(
                { error: "Title, description, and location are required" },
                { status: 400 }
            )
        }

        // Use admin client to insert job (bypasses RLS)
        const { data: job, error } = await adminClient
            .from('jobs')
            .insert({
                title,
                description,
                location,
                salary: salary || null,
                job_type: job_type || null,
                experience: experience || null,
                skills: Array.isArray(skills) ? skills : skills?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
                recruiter_id: user.id,
                status: 'OPEN'
            })
            .select()
            .single()

        if (error) {
            console.error("Job creation error:", error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "Job created successfully",
            job
        })
    } catch (error) {
        console.error("Create job error:", error)
        return NextResponse.json(
            { error: "Failed to create job" },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from "next/server"
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

        // Get user with profile
        const { data: userData, error } = await supabase
            .from('users')
            .select('*, candidate_profiles(*), recruiter_profiles(*)')
            .eq('id', user.id)
            .single()

        if (error || !userData) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Handle profile data - may come as array from Supabase
        let profile = null
        if (userData.role === 'CANDIDATE') {
            profile = Array.isArray(userData.candidate_profiles)
                ? userData.candidate_profiles[0]
                : userData.candidate_profiles
        } else if (userData.role === 'RECRUITER') {
            profile = Array.isArray(userData.recruiter_profiles)
                ? userData.recruiter_profiles[0]
                : userData.recruiter_profiles
        }

        return NextResponse.json({
            user: {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                created_at: userData.created_at,
                profile: profile
            }
        })
    } catch (error) {
        console.error("Get user error:", error)
        return NextResponse.json(
            { error: "Failed to get user" },
            { status: 500 }
        )
    }
}

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

        const body = await request.json()

        // Get user's role
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!userData) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Update profile based on role
        if (userData.role === 'CANDIDATE') {
            const { phone } = body
            await supabase
                .from('candidate_profiles')
                .update({ phone })
                .eq('user_id', user.id)
        } else if (userData.role === 'RECRUITER') {
            const { company_name, company_email, description } = body
            await supabase
                .from('recruiter_profiles')
                .update({ company_name, company_email, description })
                .eq('user_id', user.id)
        }

        return NextResponse.json({ message: "Profile updated successfully" })
    } catch (error) {
        console.error("Update profile error:", error)
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase"

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        const supabase = await createSupabaseServer()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        // Get user profile data
        const { data: userData } = await supabase
            .from('users')
            .select('*, candidate_profiles(*), recruiter_profiles(*)')
            .eq('id', data.user.id)
            .single()

        const role = userData?.role || data.user.user_metadata?.role || 'CANDIDATE'

        return NextResponse.json({
            message: "Login successful",
            user: {
                id: data.user.id,
                email: data.user.email,
                role: role,
                profile: role === 'CANDIDATE'
                    ? userData?.candidate_profiles
                    : userData?.recruiter_profiles
            }
        })
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json(
            { error: "Failed to login" },
            { status: 500 }
        )
    }
}

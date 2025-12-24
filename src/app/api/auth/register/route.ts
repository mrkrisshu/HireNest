import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
    try {
        const { email, password, role, phone, company_name, company_email, description } = await request.json()

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        if (!role || !["CANDIDATE", "RECRUITER"].includes(role)) {
            return NextResponse.json(
                { error: "Valid role (CANDIDATE or RECRUITER) is required" },
                { status: 400 }
            )
        }

        // Recruiter-specific validation
        if (role === "RECRUITER" && (!company_name || !company_email)) {
            return NextResponse.json(
                { error: "Company name and email required for recruiters" },
                { status: 400 }
            )
        }

        // Use admin client to create user (bypasses email confirmation)
        const supabase = createAdminClient()

        // First check if user already exists
        const { data: existingUsers } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .limit(1)

        if (existingUsers && existingUsers.length > 0) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Create user with Supabase Auth Admin API
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role,
                phone: phone || null,
                company_name: company_name || null,
                company_email: company_email || null,
                description: description || null,
            }
        })

        if (error) {
            console.error("Supabase auth error:", error)
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        if (!data.user) {
            return NextResponse.json(
                { error: "Failed to create user" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "Registration successful! Please login to continue.",
            user: {
                id: data.user.id,
                email: data.user.email,
                role
            }
        })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Failed to register. Please try again." },
            { status: 500 }
        )
    }
}

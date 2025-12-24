import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { verifyAdminAccess } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
    try {
        const { isValid } = await verifyAdminAccess()

        if (!isValid) {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 401 }
            )
        }


        const { searchParams } = new URL(request.url)
        const role = searchParams.get("role")
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const offset = (page - 1) * limit

        const adminClient = createAdminClient()

        let query = adminClient
            .from('users')
            .select(`
        *,
        candidate_profiles(*),
        recruiter_profiles(*),
        jobs(count),
        applications(count)
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (role) {
            query = query.eq('role', role)
        }

        const { data: users, error, count } = await query

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        const formattedUsers = users?.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            created_at: u.created_at,
            profile: u.role === 'CANDIDATE' ? u.candidate_profiles : u.recruiter_profiles,
            jobs_count: u.jobs?.[0]?.count || 0,
            applications_count: u.applications?.[0]?.count || 0
        }))

        return NextResponse.json({
            users: formattedUsers,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
            }
        })
    } catch (error) {
        console.error("Get users error:", error)
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { isValid, userId } = await verifyAdminAccess()

        if (!isValid) {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 401 }
            )
        }


        const { user_id } = await request.json()

        if (!user_id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            )
        }

        if (userId && user_id === userId) {
            return NextResponse.json(
                { error: "Cannot delete yourself" },
                { status: 400 }
            )
        }

        const adminClient = createAdminClient()

        // Delete from Supabase Auth (this cascades to public.users due to FK)
        const { error } = await adminClient.auth.admin.deleteUser(user_id)

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("Delete user error:", error)
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        )
    }
}

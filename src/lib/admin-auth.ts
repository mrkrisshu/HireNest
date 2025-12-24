import { createSupabaseServer } from "@/lib/supabase"
import { headers } from "next/headers"

// Fixed admin credentials - must match login page
const ADMIN_EMAIL = "admin@hirenest.com"

export async function verifyAdminAccess(): Promise<{ isValid: boolean; userId?: string }> {
    // Method 1: Check X-Admin-Token header (for fixed admin login)
    const headersList = await headers()
    const adminToken = headersList.get("x-admin-token")

    if (adminToken) {
        try {
            const session = JSON.parse(adminToken)
            if (session.email === ADMIN_EMAIL && session.role === "SUPER_ADMIN") {
                return { isValid: true, userId: "super-admin" }
            }
        } catch {
            // Invalid token format
        }
    }

    // Method 2: Check Supabase session (for DB admins)
    try {
        const supabase = await createSupabaseServer()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (!authError && user) {
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (userData?.role === 'ADMIN') {
                return { isValid: true, userId: user.id }
            }
        }
    } catch {
        // Supabase auth failed
    }

    return { isValid: false }
}

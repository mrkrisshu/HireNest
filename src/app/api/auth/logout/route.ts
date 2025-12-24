import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase"

export async function POST() {
    try {
        const supabase = await createSupabaseServer()
        await supabase.auth.signOut()

        return NextResponse.json({ message: "Logged out successfully" })
    } catch (error) {
        console.error("Logout error:", error)
        return NextResponse.json(
            { error: "Failed to logout" },
            { status: 500 }
        )
    }
}

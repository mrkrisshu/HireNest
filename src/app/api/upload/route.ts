import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServer, createAdminClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const type = formData.get("type") as string | null

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            )
        }

        if (!type || !["photo", "resume"].includes(type)) {
            return NextResponse.json(
                { error: "Invalid file type. Must be 'photo' or 'resume'" },
                { status: 400 }
            )
        }

        // Validate file
        if (type === "photo") {
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: "Invalid image type. Only JPEG, PNG, and WebP are allowed." },
                    { status: 400 }
                )
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json(
                    { error: "Image must be less than 5MB" },
                    { status: 400 }
                )
            }
        } else if (type === "resume") {
            if (file.type !== "application/pdf") {
                return NextResponse.json(
                    { error: "Only PDF files are allowed for resumes" },
                    { status: 400 }
                )
            }
            if (file.size > 10 * 1024 * 1024) {
                return NextResponse.json(
                    { error: "Resume must be less than 10MB" },
                    { status: 400 }
                )
            }
        }

        const adminClient = createAdminClient()

        // Generate unique filename
        const ext = file.name.split(".").pop()
        const filename = `${user.id}-${Date.now()}.${ext}`
        const folder = type === "photo" ? "photos" : "resumes"
        const filePath = `${folder}/${filename}`

        // Upload to Supabase Storage
        const arrayBuffer = await file.arrayBuffer()
        const { error: uploadError } = await adminClient.storage
            .from("hirenest")
            .upload(filePath, arrayBuffer, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            return NextResponse.json(
                { error: "Failed to upload file" },
                { status: 500 }
            )
        }

        // Get public URL
        const { data: { publicUrl } } = adminClient.storage
            .from("hirenest")
            .getPublicUrl(filePath)

        // Update profile
        if (type === "photo") {
            await supabase
                .from("candidate_profiles")
                .update({ photo_url: publicUrl })
                .eq("user_id", user.id)
        } else if (type === "resume") {
            await supabase
                .from("candidate_profiles")
                .update({ resume_url: publicUrl })
                .eq("user_id", user.id)
        }

        return NextResponse.json({
            message: "File uploaded successfully",
            url: publicUrl,
            type
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        )
    }
}

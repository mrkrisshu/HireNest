import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { verifyAdminAccess } from "@/lib/admin-auth"

export async function GET() {
    try {
        const { isValid } = await verifyAdminAccess()

        if (!isValid) {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 401 }
            )
        }



        // Use admin client for full access
        const adminClient = createAdminClient()

        // Get stats
        const { count: totalUsers } = await adminClient.from('users').select('*', { count: 'exact', head: true })
        const { count: totalCandidates } = await adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'CANDIDATE')
        const { count: totalRecruiters } = await adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'RECRUITER')
        const { count: totalJobs } = await adminClient.from('jobs').select('*', { count: 'exact', head: true })
        const { count: openJobs } = await adminClient.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'OPEN')
        const { count: closedJobs } = await adminClient.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'CLOSED')
        const { count: totalApplications } = await adminClient.from('applications').select('*', { count: 'exact', head: true })

        // Application status breakdown
        const { count: pendingApps } = await adminClient.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'PENDING')
        const { count: viewedApps } = await adminClient.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'VIEWED')
        const { count: shortlistedApps } = await adminClient.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'SHORTLISTED')
        const { count: rejectedApps } = await adminClient.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED')

        // Recent users
        const { data: recentUsers } = await adminClient
            .from('users')
            .select('id, email, role, created_at')
            .order('created_at', { ascending: false })
            .limit(5)

        // Recent jobs - simplified query
        const { data: recentJobs } = await adminClient
            .from('jobs')
            .select('id, title, status, created_at, recruiter_id')
            .order('created_at', { ascending: false })
            .limit(5)

        // Get recruiter profiles separately for proper typing
        const recruiterIds = recentJobs?.map(j => j.recruiter_id) || []
        const { data: recruiterProfiles } = await adminClient
            .from('recruiter_profiles')
            .select('user_id, company_name')
            .in('user_id', recruiterIds)

        // Get application counts
        const jobIds = recentJobs?.map(j => j.id) || []
        const { data: appCounts } = await adminClient
            .from('applications')
            .select('job_id')
            .in('job_id', jobIds)

        // Build formatted jobs
        const formattedJobs = recentJobs?.map(job => {
            const profile = recruiterProfiles?.find(p => p.user_id === job.recruiter_id)
            const appCount = appCounts?.filter(a => a.job_id === job.id).length || 0
            return {
                id: job.id,
                title: job.title,
                status: job.status,
                created_at: job.created_at,
                company: profile?.company_name || 'Unknown',
                applications_count: appCount
            }
        })

        return NextResponse.json({
            stats: {
                total_users: totalUsers || 0,
                total_candidates: totalCandidates || 0,
                total_recruiters: totalRecruiters || 0,
                total_jobs: totalJobs || 0,
                open_jobs: openJobs || 0,
                closed_jobs: closedJobs || 0,
                total_applications: totalApplications || 0,
                application_status: {
                    PENDING: pendingApps || 0,
                    VIEWED: viewedApps || 0,
                    SHORTLISTED: shortlistedApps || 0,
                    REJECTED: rejectedApps || 0
                }
            },
            recent_users: recentUsers || [],
            recent_jobs: formattedJobs || []
        })
    } catch (error) {
        console.error("Admin overview error:", error)
        return NextResponse.json(
            { error: "Failed to fetch overview" },
            { status: 500 }
        )
    }
}

"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
    Sidebar,
    SidebarBody,
} from "@/components/ui/sidebar"
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Loader2,
    MapPin,
    Building2,
    LogOut,
    Bell,
    Search,
    DollarSign,
    Settings,
    Sun,
    Moon,
    Briefcase
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"
import { JobsTable } from "@/components/jobs-table"
import { ApplicationsTable } from "@/components/applications-table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface UserProfile {
    id: string
    email: string
    role: string
    created_at: string
    profile: {
        first_name: string | null
        last_name: string | null
        phone: string | null
        photo_url: string | null
        resume_url: string | null
    }
}

interface Application {
    id: string
    status: string
    applied_at: string
    cover_letter: string | null
    job: {
        id: string
        title: string
        location: string
        salary: string | null
        job_type: string | null
        status: string
        company: string
    }
}

interface Job {
    id: string
    title: string
    description: string
    location: string
    salary: string | null
    job_type: string | null
    experience: string | null
    skills: string[]
    status: string
    created_at: string
    company: string
    company_email: string
}

interface Notification {
    id: string
    type: string
    message: string
    read: boolean
    created_at: string
    application?: {
        job: {
            title: string
            company: string
        }
    }
}

export default function CandidateDashboard() {
    const router = useRouter()
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [user, setUser] = useState<UserProfile | null>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [jobs, setJobs] = useState<Job[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<"applications" | "jobs" | "notifications">("jobs")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Apply dialog state
    const [applyDialogOpen, setApplyDialogOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [coverLetter, setCoverLetter] = useState("")
    const [isApplying, setIsApplying] = useState(false)

    const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark')

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, appsRes, jobsRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch("/api/candidate/applications"),
                    fetch("/api/jobs/list"),
                ])

                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData.user)
                }

                if (appsRes.ok) {
                    const appsData = await appsRes.json()
                    setApplications(appsData.applications)

                    // Generate notifications from application status changes
                    const notifs: Notification[] = appsData.applications
                        .filter((app: Application) => app.status !== "PENDING")
                        .map((app: Application) => ({
                            id: app.id,
                            type: app.status,
                            message: getNotificationMessage(app.status, app.job.title, app.job.company),
                            read: false,
                            created_at: app.applied_at,
                            application: { job: { title: app.job.title, company: app.job.company } }
                        }))
                    setNotifications(notifs)
                }

                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json()
                    setJobs(jobsData.jobs || [])
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Failed to load data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const getNotificationMessage = (status: string, jobTitle: string, company: string) => {
        switch (status) {
            case "VIEWED":
                return `Your application for ${jobTitle} at ${company} has been viewed`
            case "SHORTLISTED":
                return `🎉 Great news! You've been shortlisted for ${jobTitle} at ${company}`
            case "REJECTED":
                return `Your application for ${jobTitle} at ${company} was not selected`
            default:
                return `Application status updated for ${jobTitle}`
        }
    }

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            router.push("/login")
            router.refresh()
        } catch (error) {
            toast.error("Failed to logout")
        }
    }

    const handlePhotoUpload = async (file: File) => {
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("type", "photo")

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Upload failed")
            }

            toast.success("Photo uploaded successfully!")

            const userRes = await fetch("/api/auth/me")
            if (userRes.ok) {
                const userData = await userRes.json()
                setUser(userData.user)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    const handleResumeUpload = async (file: File) => {
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("type", "resume")

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Upload failed")
            }

            toast.success("Resume uploaded successfully!")

            const userRes = await fetch("/api/auth/me")
            if (userRes.ok) {
                const userData = await userRes.json()
                setUser(userData.user)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSaveProfile = async (data: { phone: string; bio: string; portfolio_url: string }) => {
        setIsSaving(true)
        try {
            const response = await fetch("/api/auth/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phone: data.phone,
                    bio: data.bio,
                    portfolio_url: data.portfolio_url,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to update profile")
            }

            toast.success("Profile updated successfully!")

            // Refresh user data
            const userRes = await fetch("/api/auth/me")
            if (userRes.ok) {
                const userData = await userRes.json()
                setUser(userData.user)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update")
        } finally {
            setIsSaving(false)
        }
    }

    const openApplyDialog = (job: Job) => {
        setSelectedJob(job)
        setCoverLetter("")
        setApplyDialogOpen(true)
    }

    const handleApply = async () => {
        if (!selectedJob) return

        setIsApplying(true)
        try {
            const response = await fetch("/api/jobs/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    job_id: selectedJob.id,
                    cover_letter: coverLetter || null,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to apply")
            }

            toast.success("Application submitted successfully!")
            setApplyDialogOpen(false)

            // Remove the job from list or mark as applied
            setJobs(prev => prev.filter(j => j.id !== selectedJob.id))

            // Refresh applications
            const appsRes = await fetch("/api/candidate/applications")
            if (appsRes.ok) {
                const appsData = await appsRes.json()
                setApplications(appsData.applications)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to apply")
        } finally {
            setIsApplying(false)
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "PENDING":
                return { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" }
            case "VIEWED":
                return { icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10", label: "Viewed" }
            case "SHORTLISTED":
                return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Shortlisted" }
            case "REJECTED":
                return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Rejected" }
            default:
                return { icon: Clock, color: "text-gray-500", bg: "bg-gray-500/10", label: status }
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        return formatDate(dateString)
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const unreadNotifications = notifications.filter(n => !n.read).length

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-50 dark:bg-neutral-900">
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-neutral-900 overflow-hidden">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
                <SidebarBody className="justify-between gap-10 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 py-1 relative z-20">
                            <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Briefcase className="h-4 w-4 text-white" />
                            </div>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: sidebarOpen ? 1 : 0 }}
                                className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent whitespace-pre"
                            >
                                HireNest
                            </motion.span>
                        </Link>

                        {/* Navigation */}
                        <div className="mt-8 flex flex-col gap-1">
                            <button
                                onClick={() => setActiveTab("applications")}
                                className={cn(
                                    "flex items-center gap-2 py-2.5 px-2 rounded-lg transition-colors",
                                    activeTab === "applications"
                                        ? "bg-emerald-500/10"
                                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                )}
                            >
                                <Briefcase className={cn(
                                    "h-5 w-5 flex-shrink-0",
                                    activeTab === "applications" ? "text-emerald-500" : "text-neutral-700 dark:text-neutral-200"
                                )} />
                                <motion.span
                                    animate={{
                                        display: sidebarOpen ? "inline-block" : "none",
                                        opacity: sidebarOpen ? 1 : 0,
                                    }}
                                    className={cn(
                                        "text-sm whitespace-pre",
                                        activeTab === "applications" ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-neutral-700 dark:text-neutral-200"
                                    )}
                                >
                                    My Applications
                                </motion.span>
                                {applications.length > 0 && sidebarOpen && (
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                        {applications.length}
                                    </Badge>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab("jobs")}
                                className={cn(
                                    "flex items-center gap-2 py-2.5 px-2 rounded-lg transition-colors",
                                    activeTab === "jobs"
                                        ? "bg-emerald-500/10"
                                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                )}
                            >
                                <Search className={cn(
                                    "h-5 w-5 flex-shrink-0",
                                    activeTab === "jobs" ? "text-emerald-500" : "text-neutral-700 dark:text-neutral-200"
                                )} />
                                <motion.span
                                    animate={{
                                        display: sidebarOpen ? "inline-block" : "none",
                                        opacity: sidebarOpen ? 1 : 0,
                                    }}
                                    className={cn(
                                        "text-sm whitespace-pre",
                                        activeTab === "jobs" ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-neutral-700 dark:text-neutral-200"
                                    )}
                                >
                                    Browse Jobs
                                </motion.span>
                            </button>

                            <button
                                onClick={() => setActiveTab("notifications")}
                                className={cn(
                                    "flex items-center gap-2 py-2.5 px-2 rounded-lg transition-colors relative",
                                    activeTab === "notifications"
                                        ? "bg-emerald-500/10"
                                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                )}
                            >
                                <Bell className={cn(
                                    "h-5 w-5 flex-shrink-0",
                                    activeTab === "notifications" ? "text-emerald-500" : "text-neutral-700 dark:text-neutral-200"
                                )} />
                                <motion.span
                                    animate={{
                                        display: sidebarOpen ? "inline-block" : "none",
                                        opacity: sidebarOpen ? 1 : 0,
                                    }}
                                    className={cn(
                                        "text-sm whitespace-pre",
                                        activeTab === "notifications" ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-neutral-700 dark:text-neutral-200"
                                    )}
                                >
                                    Notifications
                                </motion.span>
                                {unreadNotifications > 0 && (
                                    <span className={cn(
                                        "flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium",
                                        sidebarOpen ? "ml-auto h-5 w-5" : "absolute -top-1 -right-1 h-4 w-4 text-[10px]"
                                    )}>
                                        {unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {/* Profile Settings Dialog */}
                            <ProfileEditDialog
                                user={user}
                                onSave={handleSaveProfile}
                                onPhotoUpload={handlePhotoUpload}
                                onResumeUpload={handleResumeUpload}
                                isUploading={isUploading}
                                isSaving={isSaving}
                                sidebarOpen={sidebarOpen}
                            />
                        </div>
                    </div>

                    {/* Theme Toggle & User Profile & Logout */}
                    <div className="flex flex-col gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(isDark ? 'light' : 'dark')}
                            className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-500 group"
                        >
                            <div className="relative h-5 w-5 flex-shrink-0">
                                <AnimatePresence mode="wait">
                                    {isDark ? (
                                        <motion.div
                                            key="moon"
                                            initial={{ scale: 0, opacity: 0, rotate: -90 }}
                                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                            exit={{ scale: 0, opacity: 0, rotate: 90 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                            className="absolute inset-0"
                                        >
                                            <Moon className="h-5 w-5 text-amber-400" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="sun"
                                            initial={{ scale: 0, opacity: 0, rotate: 90 }}
                                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                            exit={{ scale: 0, opacity: 0, rotate: -90 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                            className="absolute inset-0"
                                        >
                                            <Sun className="h-5 w-5 text-amber-500" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <motion.span
                                animate={{
                                    display: sidebarOpen ? "inline-block" : "none",
                                    opacity: sidebarOpen ? 1 : 0,
                                }}
                                className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre transition-colors duration-500"
                            >
                                {isDark ? 'Light Mode' : 'Dark Mode'}
                            </motion.span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-red-500/10 transition-colors group"
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200 group-hover:text-red-500" />
                            <motion.span
                                animate={{
                                    display: sidebarOpen ? "inline-block" : "none",
                                    opacity: sidebarOpen ? 1 : 0,
                                }}
                                className="text-sm text-neutral-700 dark:text-neutral-200 group-hover:text-red-500 whitespace-pre"
                            >
                                Logout
                            </motion.span>
                        </button>
                        <div className="flex items-center gap-2 py-2 px-1">
                            <Avatar className="h-7 w-7 flex-shrink-0">
                                <AvatarImage src={user?.profile?.photo_url || ""} />
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
                                    {user?.profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <motion.div
                                animate={{
                                    display: sidebarOpen ? "block" : "none",
                                    opacity: sidebarOpen ? 1 : 0,
                                }}
                                className="overflow-hidden"
                            >
                                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[150px]">
                                    {user?.profile?.first_name && user?.profile?.last_name
                                        ? `${user.profile.first_name} ${user.profile.last_name}`
                                        : user?.email}
                                </p>
                                <p className="text-xs text-neutral-500">Candidate</p>
                            </motion.div>
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-6 md:p-10">
                    <AnimatePresence mode="wait">
                        {/* Applications Tab */}
                        {activeTab === "applications" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                key="applications"
                            >
                                <ApplicationsTable
                                    title="My Applications"
                                    applications={applications}
                                />
                            </motion.div>
                        )}

                        {/* Jobs Tab */}
                        {activeTab === "jobs" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                key="jobs"
                            >
                                {/* Search Bar */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by title, company, or location..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-white dark:bg-neutral-800"
                                    />
                                </div>

                                {/* Jobs Table */}
                                <JobsTable
                                    title="Available Jobs"
                                    jobs={filteredJobs.map(job => ({
                                        ...job,
                                        company: job.company || 'Unknown Company'
                                    }))}
                                    onApply={async (jobId, coverLetter) => {
                                        const response = await fetch("/api/jobs/apply", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ job_id: jobId, cover_letter: coverLetter || null }),
                                        });
                                        const data = await response.json();
                                        if (!response.ok) {
                                            toast.error(data.error || "Failed to apply");
                                            throw new Error(data.error);
                                        }
                                        toast.success("Application submitted successfully!");
                                        setJobs(prev => prev.filter(j => j.id !== jobId));
                                        const appsRes = await fetch("/api/candidate/applications");
                                        if (appsRes.ok) {
                                            const appsData = await appsRes.json();
                                            setApplications(appsData.applications);
                                        }
                                    }}
                                />
                            </motion.div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === "notifications" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                key="notifications"
                            >
                                <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

                                {notifications.length === 0 ? (
                                    <Card className="border-dashed">
                                        <CardContent className="py-16 text-center">
                                            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                                <Bell className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">No notifications</h3>
                                            <p className="text-muted-foreground max-w-sm mx-auto">
                                                You'll receive notifications when recruiters view or respond to your applications
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-3">
                                        {notifications.map((notif, index) => {
                                            const statusConfig = getStatusConfig(notif.type)
                                            const StatusIcon = statusConfig.icon
                                            return (
                                                <motion.div
                                                    key={notif.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <Card className={cn(
                                                        "bg-white dark:bg-neutral-800 transition-all",
                                                        !notif.read && "border-l-4 border-l-emerald-500"
                                                    )}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className={cn("p-2 rounded-lg", statusConfig.bg)}>
                                                                    <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm">{notif.message}</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {formatRelativeTime(notif.created_at)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div >
            </main >

            {/* Apply Job Dialog */}
            < Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen} >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
                        <DialogDescription>
                            Your resume will be automatically attached. Add an optional cover letter below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium">Cover Letter (Optional)</label>
                            <Textarea
                                placeholder="Tell the recruiter why you're the perfect fit..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                rows={5}
                                className="mt-2"
                            />
                        </div>
                        <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            ⚠️ Make sure you have uploaded your resume in your profile before applying.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApply}
                            disabled={isApplying}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        >
                            {isApplying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Application"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    )
}

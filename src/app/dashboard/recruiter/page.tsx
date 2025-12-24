"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Briefcase,
    Users,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Loader2,
    MoreVertical,
    FileText,
    Mail,
    Phone,
    Download,
    Building2
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navbar } from "@/components/navbar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface UserProfile {
    id: string
    email: string
    role: string
    profile: {
        company_name: string
        company_email: string
        description: string | null
    }
}

interface Job {
    id: string
    title: string
    location: string
    status: string
    created_at: string
    total_applications: number
    pending: number
    viewed: number
    shortlisted: number
    rejected: number
}

interface Application {
    id: string
    status: string
    applied_at: string
    resume_url: string
    cover_letter: string | null
    job: {
        id: string
        title: string
        location: string
    }
    candidate: {
        id: string
        email: string
        phone: string | null
        photo_url: string | null
    }
}

interface Stats {
    total_jobs: number
    open_jobs: number
    closed_jobs: number
    total_applications: number
}

export default function RecruiterDashboard() {
    const [user, setUser] = React.useState<UserProfile | null>(null)
    const [jobs, setJobs] = React.useState<Job[]>([])
    const [applications, setApplications] = React.useState<Application[]>([])
    const [stats, setStats] = React.useState<Stats | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isCreating, setIsCreating] = React.useState(false)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedJob, setSelectedJob] = React.useState<string>("")
    const [newJob, setNewJob] = React.useState({
        title: "",
        description: "",
        location: "",
        salary: "",
        job_type: "",
        experience: "",
        skills: "",
    })

    const fetchData = React.useCallback(async () => {
        try {
            const [userRes, jobsRes, appsRes] = await Promise.all([
                fetch("/api/auth/me"),
                fetch("/api/recruiter/jobs"),
                fetch("/api/recruiter/applications"),
            ])

            if (userRes.ok) {
                const userData = await userRes.json()
                setUser(userData.user)
            }

            if (jobsRes.ok) {
                const jobsData = await jobsRes.json()
                setJobs(jobsData.jobs)
                setStats(jobsData.stats)
            }

            if (appsRes.ok) {
                const appsData = await appsRes.json()
                setApplications(appsData.applications)
            }
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleCreateJob = async () => {
        setIsCreating(true)

        try {
            const response = await fetch("/api/jobs/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...newJob,
                    skills: newJob.skills.split(",").map((s) => s.trim()).filter(Boolean),
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create job")
            }

            toast.success("Job posted successfully!")
            setDialogOpen(false)
            setNewJob({
                title: "",
                description: "",
                location: "",
                salary: "",
                job_type: "",
                experience: "",
                skills: "",
            })
            fetchData()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create job")
        } finally {
            setIsCreating(false)
        }
    }

    const handleUpdateStatus = async (applicationId: string, status: string) => {
        try {
            const response = await fetch("/api/applications/status", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    application_id: applicationId,
                    status,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to update status")
            }

            toast.success(`Application marked as ${status.toLowerCase()}`)
            fetchData()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handleCloseJob = async (jobId: string) => {
        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "CLOSED" }),
            })

            if (!response.ok) {
                throw new Error("Failed to close job")
            }

            toast.success("Job closed successfully")
            fetchData()
        } catch (error) {
            toast.error("Failed to close job")
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Clock className="h-4 w-4 text-yellow-500" />
            case "VIEWED":
                return <Eye className="h-4 w-4 text-blue-500" />
            case "SHORTLISTED":
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case "REJECTED":
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "VIEWED":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "SHORTLISTED":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "REJECTED":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            default:
                return ""
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const filteredApplications = selectedJob
        ? applications.filter((app) => app.job.id === selectedJob)
        : applications

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container px-4 py-8">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid gap-6 md:grid-cols-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-24" />
                        ))}
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
                            <p className="text-muted-foreground mt-1">
                                {user?.profile?.company_name} • Manage jobs and review applications
                            </p>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Post New Job
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Post a New Job</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below to create a new job listing.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Job Title *</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g. Senior React Developer"
                                                value={newJob.title}
                                                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location *</Label>
                                            <Input
                                                id="location"
                                                placeholder="e.g. New York, NY"
                                                value={newJob.location}
                                                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Job Description *</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Describe the role, responsibilities, and requirements..."
                                            value={newJob.description}
                                            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                            rows={5}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="salary">Salary Range</Label>
                                            <Input
                                                id="salary"
                                                placeholder="e.g. $80k - $120k"
                                                value={newJob.salary}
                                                onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="job_type">Job Type</Label>
                                            <Select value={newJob.job_type} onValueChange={(v) => setNewJob({ ...newJob, job_type: v })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[200]">
                                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                                    <SelectItem value="Contract">Contract</SelectItem>
                                                    <SelectItem value="Internship">Internship</SelectItem>
                                                    <SelectItem value="Remote">Remote</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="experience">Experience</Label>
                                            <Input
                                                id="experience"
                                                placeholder="e.g. 3-5 years"
                                                value={newJob.experience}
                                                onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="skills">Required Skills</Label>
                                        <Input
                                            id="skills"
                                            placeholder="e.g. React, TypeScript, Node.js (comma separated)"
                                            value={newJob.skills}
                                            onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateJob}
                                        disabled={isCreating || !newJob.title || !newJob.description || !newJob.location}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600"
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Post Job"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-4 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Jobs</p>
                                        <p className="text-2xl font-bold">{stats?.total_jobs || 0}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                        <Briefcase className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Open Positions</p>
                                        <p className="text-2xl font-bold">{stats?.open_jobs || 0}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Closed Positions</p>
                                        <p className="text-2xl font-bold">{stats?.closed_jobs || 0}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <XCircle className="h-5 w-5 text-gray-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Applications</p>
                                        <p className="text-2xl font-bold">{stats?.total_applications || 0}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="jobs" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="jobs">Posted Jobs</TabsTrigger>
                            <TabsTrigger value="applications">Applications</TabsTrigger>
                        </TabsList>

                        <TabsContent value="jobs" className="space-y-4">
                            {jobs.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-semibold">No jobs posted yet</h3>
                                        <p className="text-muted-foreground">Create your first job listing to start receiving applications</p>
                                        <Button onClick={() => setDialogOpen(true)} className="mt-4">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Post Your First Job
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {jobs.map((job) => (
                                        <Card key={job.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Link href={`/jobs/${job.id}`} className="font-semibold text-lg hover:text-emerald-600 transition-colors">
                                                                {job.title}
                                                            </Link>
                                                            <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
                                                                {job.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-muted-foreground">{job.location}</p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Posted {formatDate(job.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="font-semibold">{job.total_applications}</p>
                                                            <p className="text-sm text-muted-foreground">Applications</p>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/jobs/${job.id}`}>View Job</Link>
                                                                </DropdownMenuItem>
                                                                {job.status === "OPEN" && (
                                                                    <DropdownMenuItem onClick={() => handleCloseJob(job.id)} className="text-red-600">
                                                                        Close Position
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 mt-4 text-sm">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4 text-yellow-500" />
                                                        {job.pending} Pending
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-4 w-4 text-blue-500" />
                                                        {job.viewed} Viewed
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                        {job.shortlisted} Shortlisted
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                        {job.rejected} Rejected
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="applications" className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <Select value={selectedJob} onValueChange={setSelectedJob}>
                                    <SelectTrigger className="w-64">
                                        <SelectValue placeholder="Filter by job" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Jobs</SelectItem>
                                        {jobs.map((job) => (
                                            <SelectItem key={job.id} value={job.id}>
                                                {job.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Showing {filteredApplications.length} applications
                                </p>
                            </div>

                            {filteredApplications.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-semibold">No applications yet</h3>
                                        <p className="text-muted-foreground">Applications will appear here when candidates apply</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {filteredApplications.map((app) => (
                                        <Card key={app.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage src={app.candidate.photo_url || ""} />
                                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                                            {app.candidate.email[0].toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="font-semibold">{app.candidate.email}</p>
                                                                <p className="text-sm text-muted-foreground">Applied for: {app.job.title}</p>
                                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                                    {app.candidate.phone && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Phone className="h-3 w-3" />
                                                                            {app.candidate.phone}
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center gap-1">
                                                                        <Mail className="h-3 w-3" />
                                                                        {app.candidate.email}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    Applied {formatDate(app.applied_at)}
                                                                </p>
                                                            </div>
                                                            <Badge className={getStatusColor(app.status)}>
                                                                <span className="flex items-center gap-1">
                                                                    {getStatusIcon(app.status)}
                                                                    {app.status}
                                                                </span>
                                                            </Badge>
                                                        </div>
                                                        {app.cover_letter && (
                                                            <div className="mt-3 p-3 bg-muted rounded-lg">
                                                                <p className="text-sm font-medium mb-1">Cover Letter:</p>
                                                                <p className="text-sm text-muted-foreground">{app.cover_letter}</p>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-4">
                                                            <a
                                                                href={app.resume_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Button variant="outline" size="sm">
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    View Resume
                                                                </Button>
                                                            </a>
                                                            {app.status === "PENDING" && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleUpdateStatus(app.id, "VIEWED")}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Mark Viewed
                                                                </Button>
                                                            )}
                                                            {app.status !== "SHORTLISTED" && app.status !== "REJECTED" && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleUpdateStatus(app.id, "SHORTLISTED")}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        Shortlist
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleUpdateStatus(app.id, "REJECTED")}
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    )
}

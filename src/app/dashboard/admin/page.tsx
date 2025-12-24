"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Users,
    Briefcase,
    FileText,
    Shield,
    Trash2,
    MoreVertical,
    Building2,
    User,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    TrendingUp
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Stats {
    total_users: number
    total_candidates: number
    total_recruiters: number
    total_jobs: number
    open_jobs: number
    closed_jobs: number
    total_applications: number
    application_status: {
        PENDING?: number
        VIEWED?: number
        SHORTLISTED?: number
        REJECTED?: number
    }
}

interface RecentUser {
    id: string
    email: string
    role: string
    created_at: string
}

interface RecentJob {
    id: string
    title: string
    company: string
    status: string
    created_at: string
    applications_count: number
}

interface User {
    id: string
    email: string
    role: string
    created_at: string
    profile: {
        phone?: string
        photo_url?: string
        resume_url?: string
        company_name?: string
        company_email?: string
    } | null
    jobs_count: number
    applications_count: number
}

export default function AdminDashboard() {
    const [stats, setStats] = React.useState<Stats | null>(null)
    const [recentUsers, setRecentUsers] = React.useState<RecentUser[]>([])
    const [recentJobs, setRecentJobs] = React.useState<RecentJob[]>([])
    const [users, setUsers] = React.useState<User[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [roleFilter, setRoleFilter] = React.useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [userToDelete, setUserToDelete] = React.useState<string | null>(null)

    const fetchData = React.useCallback(async () => {
        try {
            const [overviewRes, usersRes] = await Promise.all([
                fetch("/api/admin/overview"),
                fetch(`/api/admin/users${roleFilter ? `?role=${roleFilter}` : ""}`),
            ])

            if (overviewRes.ok) {
                const overviewData = await overviewRes.json()
                setStats(overviewData.stats)
                setRecentUsers(overviewData.recent_users)
                setRecentJobs(overviewData.recent_jobs)
            }

            if (usersRes.ok) {
                const usersData = await usersRes.json()
                setUsers(usersData.users)
            }
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }, [roleFilter])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        try {
            const response = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: userToDelete }),
            })

            if (!response.ok) {
                throw new Error("Failed to delete user")
            }

            toast.success("User deleted successfully")
            setDeleteDialogOpen(false)
            setUserToDelete(null)
            fetchData()
        } catch (error) {
            toast.error("Failed to delete user")
        }
    }

    const handleDeleteJob = async (jobId: string) => {
        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete job")
            }

            toast.success("Job deleted successfully")
            fetchData()
        } catch (error) {
            toast.error("Failed to delete job")
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            case "RECRUITER":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case "CANDIDATE":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            default:
                return ""
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "ADMIN":
                return <Shield className="h-4 w-4" />
            case "RECRUITER":
                return <Building2 className="h-4 w-4" />
            case "CANDIDATE":
                return <User className="h-4 w-4" />
            default:
                return null
        }
    }

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
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-muted-foreground mt-1">
                                Platform overview and management
                            </p>
                        </div>
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                            <Shield className="mr-1 h-3 w-3" />
                            Administrator
                        </Badge>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Users</p>
                                        <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {stats?.total_candidates} candidates • {stats?.total_recruiters} recruiters
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Jobs</p>
                                        <p className="text-2xl font-bold">{stats?.total_jobs || 0}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {stats?.open_jobs} open • {stats?.closed_jobs} closed
                                        </p>
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
                                        <p className="text-sm text-muted-foreground">Applications</p>
                                        <p className="text-2xl font-bold">{stats?.total_applications || 0}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {stats?.application_status?.SHORTLISTED || 0} shortlisted
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Application Status</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="flex items-center text-xs">
                                                <Clock className="h-3 w-3 text-yellow-500 mr-1" />
                                                {stats?.application_status?.PENDING || 0}
                                            </span>
                                            <span className="flex items-center text-xs">
                                                <Eye className="h-3 w-3 text-blue-500 mr-1" />
                                                {stats?.application_status?.VIEWED || 0}
                                            </span>
                                            <span className="flex items-center text-xs">
                                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                                {stats?.application_status?.SHORTLISTED || 0}
                                            </span>
                                            <span className="flex items-center text-xs">
                                                <XCircle className="h-3 w-3 text-red-500 mr-1" />
                                                {stats?.application_status?.REJECTED || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="users">Manage Users</TabsTrigger>
                            <TabsTrigger value="jobs">Manage Jobs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Users</CardTitle>
                                        <CardDescription>Latest registered users on the platform</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {recentUsers.map((user) => (
                                                <div key={user.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                                                                {user.email[0].toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">{user.email}</p>
                                                            <p className="text-xs text-muted-foreground">{formatDate(user.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={getRoleColor(user.role)}>
                                                        <span className="flex items-center gap-1">
                                                            {getRoleIcon(user.role)}
                                                            {user.role}
                                                        </span>
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Jobs</CardTitle>
                                        <CardDescription>Latest job postings on the platform</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {recentJobs.map((job) => (
                                                <div key={job.id} className="flex items-center justify-between">
                                                    <div>
                                                        <Link href={`/jobs/${job.id}`} className="text-sm font-medium hover:text-emerald-600">
                                                            {job.title}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground">{job.company}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
                                                            {job.status}
                                                        </Badge>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {job.applications_count} applications
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="users" className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Roles</SelectItem>
                                        <SelectItem value="CANDIDATE">Candidates</SelectItem>
                                        <SelectItem value="RECRUITER">Recruiters</SelectItem>
                                        <SelectItem value="ADMIN">Admins</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Showing {users.length} users
                                </p>
                            </div>

                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Details</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={user.profile?.photo_url || ""} />
                                                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
                                                                {user.email[0].toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getRoleColor(user.role)}>
                                                        <span className="flex items-center gap-1">
                                                            {getRoleIcon(user.role)}
                                                            {user.role}
                                                        </span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.role === "RECRUITER" && user.profile?.company_name && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {user.profile.company_name}
                                                        </span>
                                                    )}
                                                    {user.role === "CANDIDATE" && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {user.applications_count} applications
                                                        </span>
                                                    )}
                                                    {user.role === "RECRUITER" && (
                                                        <span className="text-sm text-muted-foreground block">
                                                            {user.jobs_count} jobs posted
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(user.created_at)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {user.role !== "ADMIN" && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setUserToDelete(user.id)
                                                                        setDeleteDialogOpen(true)
                                                                    }}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete User
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>

                        <TabsContent value="jobs" className="space-y-4">
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Job Title</TableHead>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Applications</TableHead>
                                            <TableHead>Posted</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentJobs.map((job) => (
                                            <TableRow key={job.id}>
                                                <TableCell>
                                                    <Link href={`/jobs/${job.id}`} className="font-medium hover:text-emerald-600">
                                                        {job.title}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {job.company}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
                                                        {job.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{job.applications_count}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(job.created_at)}
                                                </TableCell>
                                                <TableCell className="text-right">
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
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteJob(job.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Job
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            and all associated data including their jobs and applications.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

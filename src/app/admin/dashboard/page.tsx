"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Home,
    Briefcase,
    Users,
    FileText,
    Building2,
    ChevronDown,
    ChevronsRight,
    Moon,
    Sun,
    TrendingUp,
    Bell,
    LogOut,
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Trash2,
    MoreVertical,
    UserCheck,
    UserX,
    Loader2,
} from "lucide-react"
import { toast } from "sonner"

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
        first_name?: string
        last_name?: string
        phone?: string
        photo_url?: string
        company_name?: string
    } | null
    jobs_count: number
    applications_count: number
}

export default function AdminDashboard() {
    const router = useRouter()
    const [isDark, setIsDark] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [selectedPage, setSelectedPage] = useState("Dashboard")
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<Stats | null>(null)
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
    const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [roleFilter, setRoleFilter] = useState("")

    // Check admin session
    useEffect(() => {
        const session = localStorage.getItem("hirenest_admin_session")
        if (!session) {
            router.push("/admin/login")
            return
        }

        // Apply dark mode
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDark, router])

    const fetchData = useCallback(async () => {
        const session = localStorage.getItem("hirenest_admin_session")
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        }
        if (session) {
            headers["x-admin-token"] = session
        }

        try {
            const [overviewRes, usersRes] = await Promise.all([
                fetch("/api/admin/overview", { headers }),
                fetch(`/api/admin/users${roleFilter ? `?role=${roleFilter}` : ""}`, { headers }),
            ])

            if (overviewRes.ok) {
                const overviewData = await overviewRes.json()
                setStats(overviewData.stats)
                setRecentUsers(overviewData.recent_users || [])
                setRecentJobs(overviewData.recent_jobs || [])
            }

            if (usersRes.ok) {
                const usersData = await usersRes.json()
                setUsers(usersData.users || [])
            }
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }, [roleFilter])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleLogout = () => {
        localStorage.removeItem("hirenest_admin_session")
        toast.success("Logged out successfully")
        router.push("/admin/login")
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return

        const session = localStorage.getItem("hirenest_admin_session")
        try {
            const response = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(session ? { "x-admin-token": session } : {})
                },
                body: JSON.stringify({ user_id: userId }),
            })

            if (!response.ok) throw new Error("Failed to delete user")

            toast.success("User deleted successfully")
            fetchData()
        } catch {
            toast.error("Failed to delete user")
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const getTimeAgo = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
        if (seconds < 60) return "just now"
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-gray-950">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    return (
        <div className={`flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
            <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
                {/* Sidebar */}
                <nav
                    className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'
                        } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm`}
                >
                    {/* Title Section */}
                    <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
                        <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                {sidebarOpen && (
                                    <div className="transition-opacity duration-200">
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            HireNest
                                        </span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                            Admin Panel
                                        </span>
                                    </div>
                                )}
                            </div>
                            {sidebarOpen && (
                                <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                        </div>
                    </div>

                    {/* Navigation Options */}
                    <div className="space-y-1 mb-8">
                        <SidebarOption
                            Icon={Home}
                            title="Dashboard"
                            selected={selectedPage}
                            setSelected={setSelectedPage}
                            open={sidebarOpen}
                        />
                        <SidebarOption
                            Icon={Users}
                            title="Candidates"
                            selected={selectedPage}
                            setSelected={setSelectedPage}
                            open={sidebarOpen}
                            notifs={stats?.total_candidates}
                        />
                        <SidebarOption
                            Icon={Building2}
                            title="Recruiters"
                            selected={selectedPage}
                            setSelected={setSelectedPage}
                            open={sidebarOpen}
                            notifs={stats?.total_recruiters}
                        />
                        <SidebarOption
                            Icon={Briefcase}
                            title="Jobs"
                            selected={selectedPage}
                            setSelected={setSelectedPage}
                            open={sidebarOpen}
                            notifs={stats?.total_jobs}
                        />
                        <SidebarOption
                            Icon={FileText}
                            title="Applications"
                            selected={selectedPage}
                            setSelected={setSelectedPage}
                            open={sidebarOpen}
                            notifs={stats?.total_applications}
                        />
                    </div>

                    {/* Account Section */}
                    {sidebarOpen && (
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Account
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex h-11 w-full items-center rounded-md transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <div className="grid h-full w-12 place-content-center">
                                    <LogOut className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    )}

                    {/* Toggle Button */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <div className="flex items-center p-3">
                            <div className="grid size-10 place-content-center">
                                <ChevronsRight
                                    className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${sidebarOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </div>
                            {sidebarOpen && (
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Hide
                                </span>
                            )}
                        </div>
                    </button>
                </nav>

                {/* Main Content */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 overflow-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {selectedPage === "Dashboard" ? "Admin Dashboard" : selectedPage}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {selectedPage === "Dashboard"
                                    ? "Welcome to HireNest administration panel"
                                    : `Manage ${selectedPage.toLowerCase()}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Content */}
                    {selectedPage === "Dashboard" && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    icon={Users}
                                    title="Total Candidates"
                                    value={stats?.total_candidates || 0}
                                    subtext="Active job seekers"
                                    color="blue"
                                />
                                <StatCard
                                    icon={Building2}
                                    title="Total Recruiters"
                                    value={stats?.total_recruiters || 0}
                                    subtext="Hiring companies"
                                    color="green"
                                />
                                <StatCard
                                    icon={Briefcase}
                                    title="Total Jobs"
                                    value={stats?.total_jobs || 0}
                                    subtext={`${stats?.open_jobs || 0} open positions`}
                                    color="purple"
                                />
                                <StatCard
                                    icon={FileText}
                                    title="Applications"
                                    value={stats?.total_applications || 0}
                                    subtext={`${stats?.application_status?.SHORTLISTED || 0} shortlisted`}
                                    color="orange"
                                />
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Recent Activity */}
                                <div className="lg:col-span-2">
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Users</h3>
                                            <button
                                                onClick={() => setSelectedPage("Candidates")}
                                                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium"
                                            >
                                                View all
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {recentUsers.map((user) => (
                                                <div key={user.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <div className={`p-2 rounded-lg ${user.role === 'CANDIDATE' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'
                                                        }`}>
                                                        {user.role === 'CANDIDATE' ? (
                                                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        ) : (
                                                            <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {user.email}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {user.role}
                                                        </p>
                                                    </div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                                        {getTimeAgo(user.created_at)}
                                                    </div>
                                                </div>
                                            ))}
                                            {recentUsers.length === 0 && (
                                                <p className="text-center text-gray-500 py-8">No recent users</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="space-y-6">
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Application Stats</h3>
                                        <div className="space-y-4">
                                            <QuickStat
                                                label="Pending"
                                                value={stats?.application_status?.PENDING || 0}
                                                total={stats?.total_applications || 1}
                                                color="yellow"
                                            />
                                            <QuickStat
                                                label="Viewed"
                                                value={stats?.application_status?.VIEWED || 0}
                                                total={stats?.total_applications || 1}
                                                color="blue"
                                            />
                                            <QuickStat
                                                label="Shortlisted"
                                                value={stats?.application_status?.SHORTLISTED || 0}
                                                total={stats?.total_applications || 1}
                                                color="green"
                                            />
                                            <QuickStat
                                                label="Rejected"
                                                value={stats?.application_status?.REJECTED || 0}
                                                total={stats?.total_applications || 1}
                                                color="red"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Jobs</h3>
                                        <div className="space-y-3">
                                            {recentJobs.slice(0, 4).map((job) => (
                                                <div key={job.id} className="flex items-center justify-between py-2">
                                                    <div>
                                                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{job.title}</span>
                                                        <p className="text-xs text-gray-500">{job.company}</p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'OPEN'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                        {job.applications_count} apps
                                                    </span>
                                                </div>
                                            ))}
                                            {recentJobs.length === 0 && (
                                                <p className="text-center text-gray-500 py-4">No jobs yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Candidates Page */}
                    {selectedPage === "Candidates" && (
                        <UsersTable
                            users={users.filter(u => u.role === "CANDIDATE")}
                            onDelete={handleDeleteUser}
                            formatDate={formatDate}
                        />
                    )}

                    {/* Recruiters Page */}
                    {selectedPage === "Recruiters" && (
                        <UsersTable
                            users={users.filter(u => u.role === "RECRUITER")}
                            onDelete={handleDeleteUser}
                            formatDate={formatDate}
                        />
                    )}

                    {/* Jobs Page */}
                    {selectedPage === "Jobs" && (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applications</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Posted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {recentJobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.title}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {job.company}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${job.status === 'OPEN'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {job.applications_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(job.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {recentJobs.length === 0 && (
                                <div className="text-center py-12 text-gray-500">No jobs found</div>
                            )}
                        </div>
                    )}

                    {/* Applications Page */}
                    {selectedPage === "Applications" && (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                    <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                                    <p className="text-3xl font-bold text-yellow-600">{stats?.application_status?.PENDING || 0}</p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Pending</p>
                                </div>
                                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                    <p className="text-3xl font-bold text-blue-600">{stats?.application_status?.VIEWED || 0}</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">Viewed</p>
                                </div>
                                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                    <p className="text-3xl font-bold text-green-600">{stats?.application_status?.SHORTLISTED || 0}</p>
                                    <p className="text-sm text-green-700 dark:text-green-400">Shortlisted</p>
                                </div>
                                <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                    <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                                    <p className="text-3xl font-bold text-red-600">{stats?.application_status?.REJECTED || 0}</p>
                                    <p className="text-sm text-red-700 dark:text-red-400">Rejected</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Sidebar Option Component
const SidebarOption = ({
    Icon,
    title,
    selected,
    setSelected,
    open,
    notifs
}: {
    Icon: React.ComponentType<{ className?: string }>;
    title: string;
    selected: string;
    setSelected: (title: string) => void;
    open: boolean;
    notifs?: number;
}) => {
    const isSelected = selected === title

    return (
        <button
            onClick={() => setSelected(title)}
            className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${isSelected
                ? "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shadow-sm border-l-2 border-emerald-500"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
        >
            <div className="grid h-full w-12 place-content-center">
                <Icon className="h-4 w-4" />
            </div>

            {open && (
                <span className="text-sm font-medium transition-opacity duration-200">
                    {title}
                </span>
            )}

            {notifs !== undefined && open && (
                <span className="absolute right-3 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-emerald-500 dark:bg-emerald-600 text-xs text-white font-medium">
                    {notifs}
                </span>
            )}
        </button>
    )
}

// Stat Card Component
const StatCard = ({
    icon: Icon,
    title,
    value,
    subtext,
    color
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: number;
    subtext: string;
    color: string;
}) => {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
        green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
        purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
        orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    }

    return (
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
        </div>
    )
}

// Quick Stat Component
const QuickStat = ({
    label,
    value,
    total,
    color
}: {
    label: string;
    value: number;
    total: number;
    color: string;
}) => {
    const percentage = Math.round((value / total) * 100) || 0
    const colorClasses: Record<string, string> = {
        yellow: "bg-yellow-500",
        blue: "bg-blue-500",
        green: "bg-green-500",
        red: "bg-red-500",
    }

    return (
        <>
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    className={`${colorClasses[color]} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </>
    )
}

// Users Table Component
const UsersTable = ({
    users,
    onDelete,
    formatDate
}: {
    users: User[];
    onDelete: (id: string) => void;
    formatDate: (date: string) => string;
}) => {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                                        {user.profile?.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {user.profile?.first_name && user.profile?.last_name
                                                ? `${user.profile.first_name} ${user.profile.last_name}`
                                                : user.email}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.role === 'CANDIDATE'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {user.role === 'CANDIDATE'
                                    ? `${user.applications_count} applications`
                                    : user.profile?.company_name || `${user.jobs_count} jobs`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(user.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                    onClick={() => onDelete(user.id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">No users found</div>
            )}
        </div>
    )
}

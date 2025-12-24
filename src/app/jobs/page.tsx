"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Search,
    MapPin,
    Briefcase,
    Clock,
    Building2,
    DollarSign,
    Filter,
    X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Navbar } from "@/components/navbar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
    applications_count: number
}

interface Pagination {
    page: number
    limit: number
    total: number
    pages: number
}

export default function JobsPage() {
    const [jobs, setJobs] = React.useState<Job[]>([])
    const [pagination, setPagination] = React.useState<Pagination | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [location, setLocation] = React.useState("")
    const [jobType, setJobType] = React.useState("")
    const [currentPage, setCurrentPage] = React.useState(1)
    const [user, setUser] = React.useState<{
        id: string
        email: string
        role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE'
        profile?: { photo_url?: string | null } | null
    } | null>(null)
    const [userLoading, setUserLoading] = React.useState(true)

    // Fetch current user session
    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me')
                if (response.ok) {
                    const data = await response.json()
                    if (data.user) {
                        setUser(data.user)
                    }
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            } finally {
                setUserLoading(false)
            }
        }
        fetchUser()
    }, [])

    const fetchJobs = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "12",
                ...(search && { search }),
                ...(location && { location }),
                ...(jobType && { job_type: jobType }),
            })

            const response = await fetch(`/api/jobs/list?${params}`)
            const data = await response.json()

            if (response.ok) {
                setJobs(data.jobs)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error("Error fetching jobs:", error)
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, search, location, jobType])

    React.useEffect(() => {
        fetchJobs()
    }, [fetchJobs])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1)
        fetchJobs()
    }

    const clearFilters = () => {
        setSearch("")
        setLocation("")
        setJobType("")
        setCurrentPage(1)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        return `${Math.floor(diffDays / 30)} months ago`
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 py-12 md:py-16">
                <div className="container px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Find Your
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Perfect Job</span>
                        </h1>
                        <p className="mt-4 text-muted-foreground">
                            Browse through {pagination?.total || "thousands of"} job opportunities from top companies
                        </p>
                    </motion.div>

                    {/* Search Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleSearch}
                        className="mx-auto mt-8 max-w-4xl"
                    >
                        <div className="flex flex-col gap-4 rounded-xl bg-background p-4 shadow-lg md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Job title or keyword..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Location..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={jobType} onValueChange={setJobType}>
                                <SelectTrigger className="w-full md:w-40">
                                    <SelectValue placeholder="Job Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                    <SelectItem value="Contract">Contract</SelectItem>
                                    <SelectItem value="Internship">Internship</SelectItem>
                                    <SelectItem value="Remote">Remote</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </motion.form>

                    {/* Active Filters */}
                    {(search || location || jobType) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center gap-2"
                        >
                            <span className="text-sm text-muted-foreground">Active filters:</span>
                            {search && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    {search}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
                                </Badge>
                            )}
                            {location && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    {location}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => setLocation("")} />
                                </Badge>
                            )}
                            {jobType && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    {jobType}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => setJobType("")} />
                                </Badge>
                            )}
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                Clear all
                            </Button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Jobs Grid */}
            <section className="container px-4 py-12">
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardHeader className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </CardContent>
                                <CardFooter>
                                    <Skeleton className="h-9 w-full" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-12 text-center"
                    >
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Briefcase className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No jobs found</h3>
                        <p className="mt-1 text-muted-foreground">
                            Try adjusting your search or filters to find more jobs
                        </p>
                        <Button variant="outline" className="mt-4" onClick={clearFilters}>
                            Clear filters
                        </Button>
                    </motion.div>
                ) : (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {jobs.length} of {pagination?.total} jobs
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {jobs.map((job, index) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="group h-full transition-all hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/50">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold leading-tight group-hover:text-emerald-600 transition-colors">
                                                        {job.title}
                                                    </h3>
                                                    <div className="mt-1 flex items-center text-sm text-muted-foreground">
                                                        <Building2 className="mr-1 h-3 w-3" />
                                                        {job.company}
                                                    </div>
                                                </div>
                                                <Badge variant={job.status === "OPEN" ? "default" : "secondary"} className="ml-2">
                                                    {job.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                {job.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <span className="flex items-center">
                                                    <MapPin className="mr-1 h-3 w-3" />
                                                    {job.location}
                                                </span>
                                                {job.job_type && (
                                                    <span className="flex items-center">
                                                        <Briefcase className="mr-1 h-3 w-3" />
                                                        {job.job_type}
                                                    </span>
                                                )}
                                                {job.salary && (
                                                    <span className="flex items-center">
                                                        <DollarSign className="mr-1 h-3 w-3" />
                                                        {job.salary}
                                                    </span>
                                                )}
                                            </div>
                                            {job.skills && job.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {job.skills.slice(0, 3).map((skill, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {job.skills.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{job.skills.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="flex items-center justify-between">
                                            <span className="flex items-center text-xs text-muted-foreground">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {formatDate(job.created_at)}
                                            </span>
                                            <Button asChild size="sm" variant="outline" className="group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500">
                                                <Link href={`/jobs/${job.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-2">
                                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                                        const page = i + 1
                                        return (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="icon"
                                                onClick={() => setCurrentPage(page)}
                                                className={currentPage === page ? "bg-emerald-500" : ""}
                                            >
                                                {page}
                                            </Button>
                                        )
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === pagination.pages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    )
}

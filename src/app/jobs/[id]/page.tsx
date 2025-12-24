"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    MapPin,
    Briefcase,
    Clock,
    Building2,
    DollarSign,
    Users,
    CheckCircle,
    Loader2,
    ExternalLink,
    Calendar,
    GraduationCap
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

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
    updated_at: string
    company: string
    company_email: string | null
    company_description: string | null
    applications_count: number
    has_applied: boolean
}

export default function JobDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [job, setJob] = React.useState<Job | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isApplying, setIsApplying] = React.useState(false)
    const [coverLetter, setCoverLetter] = React.useState("")
    const [dialogOpen, setDialogOpen] = React.useState(false)

    React.useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await fetch(`/api/jobs/${params.id}`)
                const data = await response.json()

                if (response.ok) {
                    setJob(data.job)
                } else {
                    toast.error("Job not found")
                    router.push("/jobs")
                }
            } catch (error) {
                console.error("Error fetching job:", error)
                toast.error("Failed to load job details")
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            fetchJob()
        }
    }, [params.id, router])

    const handleApply = async () => {
        setIsApplying(true)

        try {
            const response = await fetch("/api/jobs/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    job_id: job?.id,
                    cover_letter: coverLetter || null,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to apply")
            }

            toast.success("Application submitted successfully!")
            setDialogOpen(false)
            setJob((prev) => prev ? { ...prev, has_applied: true } : null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to apply")
        } finally {
            setIsApplying(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container px-4 py-8">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-4 w-1/2 mt-2" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!job) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Button
                        variant="ghost"
                        asChild
                        className="mb-6"
                    >
                        <Link href="/jobs">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Jobs
                        </Link>
                    </Button>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-2xl">{job.title}</CardTitle>
                                            <div className="mt-2 flex items-center text-muted-foreground">
                                                <Building2 className="mr-2 h-4 w-4" />
                                                {job.company}
                                            </div>
                                        </div>
                                        <Badge variant={job.status === "OPEN" ? "default" : "secondary"} className="text-sm">
                                            {job.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center">
                                            <MapPin className="mr-2 h-4 w-4 text-emerald-500" />
                                            {job.location}
                                        </span>
                                        {job.job_type && (
                                            <span className="flex items-center">
                                                <Briefcase className="mr-2 h-4 w-4 text-emerald-500" />
                                                {job.job_type}
                                            </span>
                                        )}
                                        {job.salary && (
                                            <span className="flex items-center">
                                                <DollarSign className="mr-2 h-4 w-4 text-emerald-500" />
                                                {job.salary}
                                            </span>
                                        )}
                                        {job.experience && (
                                            <span className="flex items-center">
                                                <GraduationCap className="mr-2 h-4 w-4 text-emerald-500" />
                                                {job.experience}
                                            </span>
                                        )}
                                        <span className="flex items-center">
                                            <Users className="mr-2 h-4 w-4 text-emerald-500" />
                                            {job.applications_count} applicants
                                        </span>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="font-semibold mb-3">Job Description</h3>
                                        <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                            {job.description}
                                        </div>
                                    </div>

                                    {job.skills && job.skills.length > 0 && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h3 className="font-semibold mb-3">Required Skills</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.skills.map((skill, index) => (
                                                        <Badge key={index} variant="outline">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {job.company_description && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About {job.company}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{job.company_description}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="sticky top-24">
                                <CardContent className="pt-6 space-y-4">
                                    {job.has_applied ? (
                                        <div className="text-center py-4">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <h4 className="font-semibold">Already Applied</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                You have already applied for this position
                                            </p>
                                            <Button asChild variant="outline" className="mt-4">
                                                <Link href="/dashboard/candidate">
                                                    View My Applications
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : job.status === "CLOSED" ? (
                                        <div className="text-center py-4">
                                            <h4 className="font-semibold text-muted-foreground">Position Closed</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                This position is no longer accepting applications
                                            </p>
                                        </div>
                                    ) : (
                                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" size="lg">
                                                    Apply Now
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Apply for {job.title}</DialogTitle>
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
                                                    <p className="text-sm text-muted-foreground">
                                                        ⚠️ Make sure you have uploaded your resume in your profile before applying.
                                                    </p>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
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
                                        </Dialog>
                                    )}

                                    <Separator />

                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Posted on {formatDate(job.created_at)}
                                        </div>
                                        {job.company_email && (
                                            <div className="flex items-center text-muted-foreground">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                <a href={`mailto:${job.company_email}`} className="hover:text-emerald-600">
                                                    {job.company_email}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

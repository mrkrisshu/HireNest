"use client"

import * as React from "react"
import { Suspense, useState } from "react"
import { motion, Variants } from "framer-motion"
import { ImageSlider } from "@/components/image-slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Building2, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultRole = searchParams.get("role") === "recruiter" ? "recruiter" : "candidate"

    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState(defaultRole)

    // Candidate form
    const [candidateFirstName, setCandidateFirstName] = useState("")
    const [candidateLastName, setCandidateLastName] = useState("")
    const [candidateEmail, setCandidateEmail] = useState("")
    const [candidatePassword, setCandidatePassword] = useState("")
    const [candidatePhone, setCandidatePhone] = useState("")

    // Recruiter form
    const [recruiterFirstName, setRecruiterFirstName] = useState("")
    const [recruiterLastName, setRecruiterLastName] = useState("")
    const [recruiterEmail, setRecruiterEmail] = useState("")
    const [recruiterPassword, setRecruiterPassword] = useState("")
    const [companyName, setCompanyName] = useState("")

    // Job-related images from Unsplash
    const images = [
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&auto=format&fit=crop&q=80",
    ]

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { y: 15, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 12,
            },
        },
    }

    const handleCandidateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: candidateEmail,
                    password: candidatePassword,
                    role: "CANDIDATE",
                    first_name: candidateFirstName,
                    last_name: candidateLastName,
                    phone: candidatePhone,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Registration failed")
                return
            }

            toast.success("Account created! Please login.")
            router.push("/login")
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleRecruiterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: recruiterEmail,
                    password: recruiterPassword,
                    role: "RECRUITER",
                    first_name: recruiterFirstName,
                    last_name: recruiterLastName,
                    company_name: companyName,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Registration failed")
                return
            }

            toast.success("Account created! Please login.")
            router.push("/login")
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                className="w-full max-w-5xl min-h-[650px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border bg-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Left side: Image Slider */}
                <div className="hidden lg:block relative">
                    <ImageSlider images={images} interval={5000} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <div className="text-white">
                            <h2 className="text-2xl font-bold mb-2">Start Your Journey</h2>
                            <p className="text-white/80">Join thousands of professionals building their careers</p>
                        </div>
                    </div>
                </div>

                {/* Right side: Register Form */}
                <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-10 overflow-y-auto">
                    <motion.div
                        className="w-full max-w-sm"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-primary rounded-lg">
                                <Briefcase className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">HireNest</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-2xl font-bold tracking-tight mb-1">
                            Create Account
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-muted-foreground text-sm mb-5">
                            Choose your account type to get started.
                        </motion.p>

                        <motion.div variants={itemVariants}>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-5">
                                    <TabsTrigger value="candidate" className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Job Seeker
                                    </TabsTrigger>
                                    <TabsTrigger value="recruiter" className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Recruiter
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="candidate">
                                    <form onSubmit={handleCandidateSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="candidate-first-name">First Name</Label>
                                                <Input
                                                    id="candidate-first-name"
                                                    placeholder="John"
                                                    value={candidateFirstName}
                                                    onChange={(e) => setCandidateFirstName(e.target.value)}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="candidate-last-name">Last Name</Label>
                                                <Input
                                                    id="candidate-last-name"
                                                    placeholder="Doe"
                                                    value={candidateLastName}
                                                    onChange={(e) => setCandidateLastName(e.target.value)}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="candidate-email">Email</Label>
                                            <Input
                                                id="candidate-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={candidateEmail}
                                                onChange={(e) => setCandidateEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="candidate-password">Password</Label>
                                            <Input
                                                id="candidate-password"
                                                type="password"
                                                placeholder="Min 6 characters"
                                                value={candidatePassword}
                                                onChange={(e) => setCandidatePassword(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="candidate-phone">Phone (Optional)</Label>
                                            <Input
                                                id="candidate-phone"
                                                type="tel"
                                                placeholder="+1 234 567 890"
                                                value={candidatePhone}
                                                onChange={(e) => setCandidatePhone(e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                "Create Account"
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="recruiter">
                                    <form onSubmit={handleRecruiterSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="recruiter-first-name">First Name</Label>
                                                <Input
                                                    id="recruiter-first-name"
                                                    placeholder="John"
                                                    value={recruiterFirstName}
                                                    onChange={(e) => setRecruiterFirstName(e.target.value)}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="recruiter-last-name">Last Name</Label>
                                                <Input
                                                    id="recruiter-last-name"
                                                    placeholder="Doe"
                                                    value={recruiterLastName}
                                                    onChange={(e) => setRecruiterLastName(e.target.value)}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="recruiter-email">Email</Label>
                                            <Input
                                                id="recruiter-email"
                                                type="email"
                                                placeholder="you@company.com"
                                                value={recruiterEmail}
                                                onChange={(e) => setRecruiterEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="recruiter-password">Password</Label>
                                            <Input
                                                id="recruiter-password"
                                                type="password"
                                                placeholder="Min 6 characters"
                                                value={recruiterPassword}
                                                onChange={(e) => setRecruiterPassword(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="company-name">Company Name</Label>
                                            <Input
                                                id="company-name"
                                                placeholder="Your Company"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                "Create Account"
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </motion.div>

                        <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground mt-5">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-primary hover:underline">
                                Sign in
                            </Link>
                        </motion.p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <RegisterForm />
        </Suspense>
    )
}

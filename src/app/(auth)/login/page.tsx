"use client"

import * as React from "react"
import { useState } from "react"
import { motion, Variants } from "framer-motion"
import { ImageSlider } from "@/components/image-slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Briefcase, Building2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    // Job-related images from Unsplash
    const images = [
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1560472355-536de3962603?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop&q=80",
    ]

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Login failed")
                return
            }

            toast.success("Login successful!")

            // Redirect based on role
            if (data.user.role === "ADMIN") {
                router.push("/dashboard/admin")
            } else if (data.user.role === "RECRUITER") {
                router.push("/dashboard/recruiter")
            } else {
                router.push("/dashboard/candidate")
            }
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                className="w-full max-w-5xl min-h-[600px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border bg-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Left side: Image Slider */}
                <div className="hidden lg:block relative">
                    <ImageSlider images={images} interval={4000} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <div className="text-white">
                            <h2 className="text-2xl font-bold mb-2">Find Your Dream Job</h2>
                            <p className="text-white/80">Connect with top employers and unlock your career potential</p>
                        </div>
                    </div>
                </div>

                {/* Right side: Login Form */}
                <div className="w-full h-full flex flex-col items-center justify-center p-8 md:p-12">
                    <motion.div
                        className="w-full max-w-sm"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-primary rounded-lg">
                                <Briefcase className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">HireNest</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight mb-2">
                            Welcome Back
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-muted-foreground mb-8">
                            Sign in to access your account and explore opportunities.
                        </motion.p>

                        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </motion.form>

                        <motion.div variants={itemVariants} className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    New to HireNest?
                                </span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                            <Link href="/register?role=candidate">
                                <Button variant="outline" className="w-full">
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    Job Seeker
                                </Button>
                            </Link>
                            <Link href="/register?role=recruiter">
                                <Button variant="outline" className="w-full">
                                    <Building2 className="mr-2 h-4 w-4" />
                                    Recruiter
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground mt-6">
                            By signing in, you agree to our{" "}
                            <Link href="#" className="text-primary hover:underline">Terms</Link>
                            {" "}and{" "}
                            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                        </motion.p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

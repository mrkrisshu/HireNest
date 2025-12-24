"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    Briefcase,
    User,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    Building2,
    FileText,
    Users,
    Home,
    Sparkles,
    Phone
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export function Navbar() {
    const { user, isLoading } = useAuth()
    const [isOpen, setIsOpen] = React.useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const getDashboardLink = () => {
        if (!user) return '/login'
        switch (user.role) {
            case 'ADMIN':
                return '/dashboard/admin'
            case 'RECRUITER':
                return '/dashboard/recruiter'
            case 'CANDIDATE':
                return '/dashboard/candidate'
            default:
                return '/dashboard'
        }
    }

    // Different nav links for logged-in vs non-logged-in users
    const publicNavLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/#features', label: 'Features', icon: Sparkles },
        { href: '/#about', label: 'About', icon: User },
        { href: '/#contact', label: 'Contact', icon: Phone },
    ]

    const authNavLinks = [
        { href: getDashboardLink(), label: 'Dashboard', icon: LayoutDashboard },
        { href: '/jobs', label: 'Browse Jobs', icon: Briefcase },
    ]

    const navLinks = user ? authNavLinks : publicNavLinks

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

    // Show minimal navbar while loading to prevent flash
    if (isLoading) {
        return (
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                            <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            HireNest
                        </span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                        <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        HireNest
                    </span>
                </Link>

                {/* Desktop Navigation - Tubelight Style */}
                <div className="hidden md:flex items-center">
                    <div className="flex items-center gap-1 bg-muted/50 border border-border/50 backdrop-blur-sm py-1 px-1 rounded-full">
                        {navLinks.map((link) => {
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-colors",
                                        "text-muted-foreground hover:text-emerald-600",
                                        active && "text-emerald-600",
                                    )}
                                >
                                    <span>{link.label}</span>
                                    {active && (
                                        <motion.div
                                            layoutId="tubelight"
                                            className="absolute inset-0 w-full bg-emerald-500/10 rounded-full -z-10"
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 30,
                                            }}
                                        >
                                            {/* Tubelight glow effect */}
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-t-full">
                                                <div className="absolute w-12 h-6 bg-emerald-500/30 rounded-full blur-md -top-2 -left-2" />
                                                <div className="absolute w-8 h-6 bg-teal-500/30 rounded-full blur-md -top-1" />
                                                <div className="absolute w-4 h-4 bg-emerald-400/30 rounded-full blur-sm top-0 left-2" />
                                            </div>
                                        </motion.div>
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center space-x-4">
                    <ThemeToggle />

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.profile?.photo_url || undefined} alt={user.email} />
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                            {user.email[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        <p className="font-medium">{user.email}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {user.role.toLowerCase()}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={getDashboardLink()} className="cursor-pointer">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                {user.role === 'CANDIDATE' && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/candidate" className="cursor-pointer">
                                            <FileText className="mr-2 h-4 w-4" />
                                            My Applications
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {user.role === 'RECRUITER' && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/recruiter" className="cursor-pointer">
                                                <Building2 className="mr-2 h-4 w-4" />
                                                Post a Job
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/recruiter" className="cursor-pointer">
                                                <Users className="mr-2 h-4 w-4" />
                                                View Applications
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden md:flex items-center space-x-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                                <Link href="/register">Get Started</Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden border-t bg-background"
                >
                    <div className="container py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "relative flex items-center space-x-2 p-3 rounded-full transition-colors",
                                    isActive(link.href)
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950'
                                        : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                <link.icon className="h-5 w-5" />
                                <span>{link.label}</span>
                                {isActive(link.href) && (
                                    <motion.div
                                        layoutId="mobile-tubelight"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-r-full"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 30,
                                        }}
                                    />
                                )}
                            </Link>
                        ))}

                        {!user && (
                            <div className="flex flex-col space-y-2 pt-4 border-t">
                                <Button variant="outline" asChild>
                                    <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                                </Button>
                                <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
                                    <Link href="/register" onClick={() => setIsOpen(false)}>Get Started</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    )
}

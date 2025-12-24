"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { renderCanvas } from "@/components/ui/canvas"
import {
  ArrowRight,
  Briefcase,
  Building2,
  ChevronRight,
  Globe,
  Rocket,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  Plus
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import Testimonials from "@/components/testimonial-v2"
import IntegrationHero from "@/components/integration-hero"

// Feature card - supports light/dark theme
function FeatureCard({ icon: Icon, title, description, delay }: {
  icon: React.ElementType
  title: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative p-8 rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-emerald-500/50 transition-all duration-500 shadow-lg dark:shadow-none"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}


// Animated counter - supports light/dark theme
function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent"
    >
      {value}{suffix}
    </motion.span>
  )
}

// Landing header - supports light/dark theme with tubelight navigation
function LandingHeader() {
  const [activeTab, setActiveTab] = useState('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '#features', label: 'Features' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 px-6 py-3 shadow-lg dark:shadow-none relative z-50">
        <Link href="/" className="flex items-center gap-2" onClick={() => setActiveTab('Home')}>
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900 dark:text-white font-bold text-xl">HireNest</span>
        </Link>

        {/* Tubelight Navigation - Desktop */}
        <nav className="hidden md:flex items-center">
          <div className="flex items-center gap-1 bg-muted/50 border border-border/50 backdrop-blur-sm py-1 px-1 rounded-full">
            {navLinks.map((link) => {
              const isActive = activeTab === link.label
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActiveTab(link.label)}
                  className={`relative cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-colors ${isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-white/80 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="landing-tubelight"
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
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 hover:from-emerald-600 hover:to-cyan-600">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button - Mobile Only */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 right-0 p-4 z-40 md:hidden"
        >
          <div className="bg-white/90 dark:bg-[#0a0a0b]/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-xl flex flex-col gap-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setActiveTab(link.label)
                    setMobileMenuOpen(false)
                  }}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${activeTab === link.label
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="h-px bg-gray-200 dark:bg-white/10" />
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-gray-600 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 justify-start h-12 text-base">
                  Log in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 h-12 text-base font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}

export default function LandingPage() {
  useEffect(() => {
    renderCanvas()
  }, [])

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0a0a0b] overflow-hidden transition-colors duration-300">
      <LandingHeader />

      {/* Hero Section with Canvas */}
      <section id="home" className="relative min-h-screen">
        <div className="animate-fadeIn mt-20 flex flex-col items-center justify-center px-4 text-center md:mt-20 relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="z-10 mb-6 mt-10 sm:justify-center md:mb-4 md:mt-20"
          >
            <div className="relative flex items-center whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm leading-6 text-emerald-600 dark:text-emerald-300">
              <Sparkles className="h-4 w-4 mr-2" /> AI-Powered Career Matching
              <Link
                href="/jobs"
                className="hover:text-emerald-500 dark:hover:text-emerald-400 ml-2 flex items-center font-semibold"
              >
                Explore{" "}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </motion.div>

          {/* Main Hero Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-10 mt-4 md:mt-6"
          >
            <div className="px-2">
              <div className="border-emerald-500/20 relative mx-auto h-full max-w-7xl border p-6 [mask-image:radial-gradient(800rem_96rem_at_center,white,transparent)] md:px-12 md:py-20 rounded-3xl bg-white/50 dark:bg-white/5">
                {/* Corner decorations */}
                <Plus strokeWidth={3} className="text-emerald-500 absolute -left-3 -top-3 h-6 w-6" />
                <Plus strokeWidth={3} className="text-emerald-500 absolute -bottom-3 -left-3 h-6 w-6" />
                <Plus strokeWidth={3} className="text-emerald-500 absolute -right-3 -top-3 h-6 w-6" />
                <Plus strokeWidth={3} className="text-emerald-500 absolute -bottom-3 -right-3 h-6 w-6" />

                <h1 className="flex select-none flex-col px-3 py-2 text-center text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl text-gray-900 dark:text-white">
                  Your Complete Platform for
                  <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent mt-2">
                    Career Success
                  </span>
                </h1>

                {/* Live indicator */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">10K+ Jobs Available Now</p>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mb-10 mt-8 max-w-2xl px-6 text-lg text-gray-600 dark:text-gray-400 md:text-xl"
            >
              Connect with world-class companies, discover opportunities that match your skills,
              and take the next step in your career journey.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link href="/register?role=candidate">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0 rounded-full shadow-lg shadow-emerald-500/25"
                >
                  Find Your Dream Job
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register?role=recruiter">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base rounded-full border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <Building2 className="mr-2 w-5 h-5" />
                  Hire Top Talent
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mb-20"
          >
            {[
              { value: "50K", label: "Active Jobs", suffix: "+" },
              { value: "10K", label: "Companies", suffix: "+" },
              { value: "200K", label: "Candidates", suffix: "+" },
              { value: "95", label: "Success Rate", suffix: "%" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="text-center"
              >
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Canvas Background - only visible in dark mode */}
        <canvas
          className="pointer-events-none absolute inset-0 mx-auto dark:opacity-100 opacity-30"
          id="canvas"
        />
      </section>

      <IntegrationHero />

      {/* Features Section - supports light/dark theme */}
      <section id="features" className="relative py-32 px-4 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-emerald-500 font-medium mb-4 block">WHY HIRENEST</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Built for the Future of Work
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Experience hiring reimagined with cutting-edge technology and human-centered design.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Zap}
              title="Lightning Fast Matching"
              description="Our AI analyzes data points to connect the right talent with the perfect opportunity in seconds."
              delay={0}
            />
            <FeatureCard
              icon={Target}
              title="Precision Targeting"
              description="Advanced filters and smart recommendations ensure you only see the most relevant opportunities."
              delay={0.1}
            />
            <FeatureCard
              icon={Globe}
              title="Global Reach"
              description="Access talent and opportunities from around the world, breaking geographical barriers."
              delay={0.2}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Career Insights"
              description="Data-driven insights help you understand market trends and optimize your career trajectory."
              delay={0.3}
            />
            <FeatureCard
              icon={Users}
              title="Community Driven"
              description="Join a thriving community of professionals networking and growing together."
              delay={0.4}
            />
            <FeatureCard
              icon={Rocket}
              title="Fast-Track Applications"
              description="One-click applications and instant notifications keep you ahead in the hiring race."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      <Testimonials />

      {/* About Section */}
      <section id="about" className="relative py-32 px-4 bg-gray-50 dark:bg-[#0d0d0e]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-emerald-500 font-medium mb-4 block">ABOUT HIRENEST</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Connecting Talent with
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent"> Opportunity</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 leading-relaxed">
                HireNest was founded with a simple mission: to make hiring faster, smarter, and more human.
                We believe that finding the right job or the right candidate shouldn&apos;t feel like searching for a needle in a haystack.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                Our AI-powered platform connects ambitious professionals with forward-thinking companies,
                creating meaningful career opportunities that drive growth for everyone.
              </p>
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">2024</p>
                  <p className="text-gray-500 text-sm">Founded</p>
                </div>
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">50+</p>
                  <p className="text-gray-500 text-sm">Countries</p>
                </div>
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">24/7</p>
                  <p className="text-gray-500 text-sm">Support</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                    <Briefcase className="w-10 h-10 text-emerald-500 mb-4" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">For Job Seekers</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Find opportunities that match your skills and career goals</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl p-6 text-white">
                    <Star className="w-10 h-10 mb-4" />
                    <h4 className="font-semibold mb-2">Top Rated</h4>
                    <p className="text-sm text-white/80">Trusted by thousands of professionals worldwide</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                    <Building2 className="w-10 h-10 mb-4" />
                    <h4 className="font-semibold mb-2">For Recruiters</h4>
                    <p className="text-sm text-white/80">Access a pool of pre-vetted, quality candidates</p>
                  </div>
                  <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                    <Rocket className="w-10 h-10 text-cyan-500 mb-4" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Fast Hiring</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reduce time-to-hire by up to 60%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - supports light/dark theme */}
      <section id="contact" className="relative py-32 px-4 bg-white dark:bg-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 dark:border-white/10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/30 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-500/30 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20"
              >
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-white/80">Join 200,000+ professionals</span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Transform
                <br />
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Your Career?
                </span>
              </h2>

              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-xl mx-auto mb-10">
                Whether you&apos;re looking for your next opportunity or searching for exceptional talent,
                HireNest is your gateway to success.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-base bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-semibold shadow-xl"
                  >
                    Get Started Free
                    <Briefcase className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-10 text-base rounded-full border-gray-300 dark:border-white/30 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    Explore Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - supports light/dark theme */}
      <footer className="relative py-12 px-4 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white font-semibold text-lg">HireNest</span>
          </div>

          <p className="text-gray-500 text-sm">
            © 2024 HireNest. Built for the future of work.
          </p>

          <div className="flex items-center gap-6">
            <Link href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Privacy</Link>
            <Link href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Terms</Link>
            <Link href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

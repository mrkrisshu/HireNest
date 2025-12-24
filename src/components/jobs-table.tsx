"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Building2, DollarSign, Clock, Briefcase, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export interface Job {
    id: string;
    title: string;
    description: string;
    location: string;
    salary: string | null;
    job_type: string | null;
    experience: string | null;
    skills: string[];
    company: string;
    status: string;
    created_at: string;
}

interface JobsTableProps {
    title?: string;
    jobs: Job[];
    onApply?: (jobId: string, coverLetter: string) => Promise<void>;
    className?: string;
}

export function JobsTable({
    title = "Browse Jobs",
    jobs,
    onApply,
    className = ""
}: JobsTableProps) {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [isApplying, setIsApplying] = useState(false);

    const openJobModal = (job: Job) => {
        setSelectedJob(job);
        setCoverLetter("");
    };

    const closeJobModal = () => {
        setSelectedJob(null);
        setCoverLetter("");
    };

    const handleApply = async () => {
        if (!selectedJob || !onApply) return;

        setIsApplying(true);
        try {
            await onApply(selectedJob.id, coverLetter);
            closeJobModal();
        } catch (error) {
            // Error handled by parent
        } finally {
            setIsApplying(false);
        }
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    const getJobTypeBadge = (jobType: string | null) => {
        if (!jobType) return null;
        const colors: Record<string, string> = {
            "Full-time": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
            "Part-time": "bg-blue-500/10 text-blue-400 border-blue-500/30",
            "Contract": "bg-purple-500/10 text-purple-400 border-purple-500/30",
            "Internship": "bg-orange-500/10 text-orange-400 border-orange-500/30",
            "Remote": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        };
        return (
            <div className={`px-2.5 py-1 rounded-lg border ${colors[jobType] || "bg-muted/50 text-muted-foreground border-border"}`}>
                <span className="text-xs font-medium">{jobType}</span>
            </div>
        );
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="relative border border-border/30 rounded-2xl p-6 bg-card">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h1 className="text-xl font-medium text-foreground">{title}</h1>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {jobs.length} jobs available
                        </div>
                    </div>
                </div>

                {/* Table */}
                <motion.div
                    className="space-y-2"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.06,
                                delayChildren: 0.1,
                            }
                        }
                    }}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Headers - Hidden on Mobile */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-1">No</div>
                        <div className="col-span-3">Position</div>
                        <div className="col-span-2">Company</div>
                        <div className="col-span-2">Location</div>
                        <div className="col-span-2">Posted</div>
                        <div className="col-span-2">Type</div>
                    </div>

                    {/* Job Rows */}
                    {jobs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No jobs available at the moment
                        </div>
                    ) : (
                        jobs.map((job, index) => (
                            <motion.div
                                key={job.id}
                                variants={{
                                    hidden: {
                                        opacity: 0,
                                        x: -25,
                                        scale: 0.95,
                                        filter: "blur(4px)"
                                    },
                                    visible: {
                                        opacity: 1,
                                        x: 0,
                                        scale: 1,
                                        filter: "blur(0px)",
                                        transition: {
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 28,
                                            mass: 0.6,
                                        },
                                    },
                                }}
                                className="relative cursor-pointer"
                                onClick={() => openJobModal(job)}
                            >
                                <motion.div
                                    className="relative bg-muted/50 border border-border/50 rounded-xl p-4 overflow-hidden"
                                    whileHover={{
                                        y: -1,
                                        borderColor: "rgba(16, 185, 129, 0.3)",
                                        transition: { type: "spring", stiffness: 400, damping: 25 }
                                    }}
                                >
                                    {/* Gradient overlay */}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none"
                                        style={{
                                            backgroundSize: "30% 100%",
                                            backgroundPosition: "right",
                                            backgroundRepeat: "no-repeat"
                                        }}
                                    />

                                    {/* Mobile Layout */}
                                    <div className="md:hidden relative space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                                    <Briefcase className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <span className="text-foreground font-medium block">
                                                        {job.title}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" />
                                                        {job.company}
                                                    </span>
                                                </div>
                                            </div>
                                            {getJobTypeBadge(job.job_type)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatRelativeTime(job.created_at)}
                                            </span>
                                        </div>
                                        {job.skills.length > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                                {job.skills.slice(0, 3).join(", ")}
                                            </div>
                                        )}
                                    </div>

                                    {/* Desktop Grid Content */}
                                    <div className="relative hidden md:grid grid-cols-12 gap-4 items-center">
                                        {/* Number */}
                                        <div className="col-span-1">
                                            <span className="text-2xl font-bold text-muted-foreground">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Position */}
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <span className="text-foreground font-medium block">
                                                    {job.title}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {job.skills.slice(0, 2).join(", ")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Company */}
                                        <div className="col-span-2 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-foreground">
                                                {job.company}
                                            </span>
                                        </div>

                                        {/* Location */}
                                        <div className="col-span-2 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-foreground">
                                                {job.location}
                                            </span>
                                        </div>

                                        {/* Posted */}
                                        <div className="col-span-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-foreground">
                                                {formatRelativeTime(job.created_at)}
                                            </span>
                                        </div>

                                        {/* Type */}
                                        <div className="col-span-2">
                                            {getJobTypeBadge(job.job_type)}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))
                    )}
                </motion.div>

                {/* Job Details Overlay */}
                <AnimatePresence>
                    {selectedJob && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) closeJobModal();
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-background w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="relative bg-gradient-to-r from-emerald-500/10 to-transparent p-4 border-b border-border/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                            <Briefcase className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">
                                                {selectedJob.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" />
                                                    {selectedJob.company}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {selectedJob.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {getJobTypeBadge(selectedJob.job_type)}
                                        <motion.button
                                            className="w-8 h-8 bg-background/80 hover:bg-background rounded-full flex items-center justify-center border border-border/50"
                                            onClick={closeJobModal}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <X className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Content - No scroll */}
                                <div className="flex-1 p-4 space-y-3">
                                    {/* Info Grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {selectedJob.salary && (
                                            <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Salary
                                                </label>
                                                <div className="text-sm font-medium mt-1 flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                                    {selectedJob.salary}
                                                </div>
                                            </div>
                                        )}
                                        {selectedJob.experience && (
                                            <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Experience
                                                </label>
                                                <div className="text-sm font-medium mt-1">
                                                    {selectedJob.experience}
                                                </div>
                                            </div>
                                        )}
                                        <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Posted
                                            </label>
                                            <div className="text-sm font-medium mt-1">
                                                {formatRelativeTime(selectedJob.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                                            Job Description
                                        </label>
                                        <p className="text-sm text-foreground whitespace-pre-wrap">
                                            {selectedJob.description}
                                        </p>
                                    </div>

                                    {/* Skills */}
                                    {selectedJob.skills.length > 0 && (
                                        <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                                                Required Skills
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.skills.map((skill, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Cover Letter */}
                                    <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                                            Cover Letter (Optional)
                                        </label>
                                        <Textarea
                                            placeholder="Tell the recruiter why you're the perfect fit..."
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            rows={2}
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t border-border/30 flex justify-end gap-2">
                                    <Button variant="outline" onClick={closeJobModal}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                        onClick={handleApply}
                                        disabled={isApplying}
                                    >
                                        {isApplying ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Applying...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Apply Now
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}

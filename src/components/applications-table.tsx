"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Building2, Clock, Briefcase, Eye, CheckCircle, XCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Application {
    id: string;
    status: string;
    applied_at: string;
    cover_letter: string | null;
    job: {
        id: string;
        title: string;
        location: string;
        salary: string | null;
        job_type: string | null;
        status: string;
        company: string;
    };
}

interface ApplicationsTableProps {
    title?: string;
    applications: Application[];
    className?: string;
}

export function ApplicationsTable({
    title = "My Applications",
    applications,
    className = ""
}: ApplicationsTableProps) {
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    const openAppModal = (app: Application) => {
        setSelectedApp(app);
    };

    const closeAppModal = () => {
        setSelectedApp(null);
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

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "PENDING":
                return {
                    icon: Clock,
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/30",
                    label: "Pending",
                    gradient: "from-amber-500/10"
                };
            case "VIEWED":
                return {
                    icon: Eye,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/30",
                    label: "Viewed",
                    gradient: "from-blue-500/10"
                };
            case "SHORTLISTED":
                return {
                    icon: CheckCircle,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/30",
                    label: "Shortlisted",
                    gradient: "from-emerald-500/10"
                };
            case "REJECTED":
                return {
                    icon: XCircle,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    border: "border-red-500/30",
                    label: "Rejected",
                    gradient: "from-red-500/10"
                };
            default:
                return {
                    icon: Clock,
                    color: "text-muted-foreground",
                    bg: "bg-muted/50",
                    border: "border-border",
                    label: status,
                    gradient: "from-muted/10"
                };
        }
    };

    const getStatusBadge = (status: string) => {
        const config = getStatusConfig(status);
        const Icon = config.icon;
        return (
            <div className={`px-3 py-1.5 rounded-lg ${config.bg} border ${config.border} flex items-center gap-1.5`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                <span className={`${config.color} text-sm font-medium`}>{config.label}</span>
            </div>
        );
    };

    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === "PENDING").length,
        viewed: applications.filter(a => a.status === "VIEWED").length,
        shortlisted: applications.filter(a => a.status === "SHORTLISTED").length,
        rejected: applications.filter(a => a.status === "REJECTED").length,
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="relative border border-border/30 rounded-2xl p-6 bg-card">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <h1 className="text-xl font-medium text-foreground">{title}</h1>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {stats.total} total • {stats.pending} pending • {stats.shortlisted} shortlisted
                        </div>
                    </div>
                </div>

                {/* Stats Pills */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    <div className="px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs">
                        <span className="text-muted-foreground">Total:</span>{" "}
                        <span className="font-medium text-foreground">{stats.total}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs">
                        <span className="text-amber-400">Pending:</span>{" "}
                        <span className="font-medium text-amber-400">{stats.pending}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs">
                        <span className="text-blue-400">Viewed:</span>{" "}
                        <span className="font-medium text-blue-400">{stats.viewed}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs">
                        <span className="text-emerald-400">Shortlisted:</span>{" "}
                        <span className="font-medium text-emerald-400">{stats.shortlisted}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs">
                        <span className="text-red-400">Rejected:</span>{" "}
                        <span className="font-medium text-red-400">{stats.rejected}</span>
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
                    {/* Headers */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-1">No</div>
                        <div className="col-span-3">Position</div>
                        <div className="col-span-2">Company</div>
                        <div className="col-span-2">Location</div>
                        <div className="col-span-2">Applied</div>
                        <div className="col-span-2">Status</div>
                    </div>

                    {/* Application Rows */}
                    {applications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No applications yet</p>
                            <p className="text-sm">Start applying to see your applications here</p>
                        </div>
                    ) : (
                        applications.map((app, index) => {
                            const statusConfig = getStatusConfig(app.status);
                            return (
                                <motion.div
                                    key={app.id}
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
                                    onClick={() => openAppModal(app)}
                                >
                                    <motion.div
                                        className="relative bg-muted/50 border border-border/50 rounded-xl p-4 overflow-hidden"
                                        whileHover={{
                                            y: -1,
                                            borderColor: "rgba(59, 130, 246, 0.3)",
                                            transition: { type: "spring", stiffness: 400, damping: 25 }
                                        }}
                                    >
                                        {/* Status gradient overlay */}
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-l ${statusConfig.gradient} to-transparent pointer-events-none`}
                                            style={{
                                                backgroundSize: "30% 100%",
                                                backgroundPosition: "right",
                                                backgroundRepeat: "no-repeat"
                                            }}
                                        />

                                        {/* Grid Content */}
                                        <div className="relative grid grid-cols-12 gap-4 items-center">
                                            {/* Number */}
                                            <div className="col-span-1">
                                                <span className="text-2xl font-bold text-muted-foreground">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                            </div>

                                            {/* Position */}
                                            <div className="col-span-3 flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center`}>
                                                    <Briefcase className={`w-5 h-5 ${statusConfig.color}`} />
                                                </div>
                                                <span className="text-foreground font-medium">
                                                    {app.job.title}
                                                </span>
                                            </div>

                                            {/* Company */}
                                            <div className="col-span-2 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-foreground">
                                                    {app.job.company}
                                                </span>
                                            </div>

                                            {/* Location */}
                                            <div className="col-span-2 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-foreground">
                                                    {app.job.location}
                                                </span>
                                            </div>

                                            {/* Applied */}
                                            <div className="col-span-2 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-foreground">
                                                    {formatRelativeTime(app.applied_at)}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-2">
                                                {getStatusBadge(app.status)}
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })
                    )}
                </motion.div>

                {/* Application Details Overlay */}
                <AnimatePresence>
                    {selectedApp && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col rounded-2xl z-10 overflow-hidden"
                        >
                            {/* Header */}
                            <div className={`relative bg-gradient-to-r ${getStatusConfig(selectedApp.status).gradient} to-transparent p-4 border-b border-border/30 flex items-center justify-between`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${getStatusConfig(selectedApp.status).bg} border ${getStatusConfig(selectedApp.status).border} flex items-center justify-center`}>
                                        <Briefcase className={`w-6 h-6 ${getStatusConfig(selectedApp.status).color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">
                                            {selectedApp.job.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-4 h-4" />
                                                {selectedApp.job.company}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {selectedApp.job.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {getStatusBadge(selectedApp.status)}
                                    <motion.button
                                        className="w-8 h-8 bg-background/80 hover:bg-background rounded-full flex items-center justify-center border border-border/50"
                                        onClick={closeAppModal}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <X className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                {/* Info Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Applied On
                                        </label>
                                        <div className="text-sm font-medium mt-1">
                                            {new Date(selectedApp.applied_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </div>
                                    </div>
                                    <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Job Status
                                        </label>
                                        <div className="text-sm font-medium mt-1">
                                            <Badge variant={selectedApp.job.status === "OPEN" ? "default" : "secondary"}>
                                                {selectedApp.job.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Application Status
                                        </label>
                                        <div className="mt-1">
                                            {getStatusBadge(selectedApp.status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Cover Letter */}
                                {selectedApp.cover_letter && (
                                    <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                                            Your Cover Letter
                                        </label>
                                        <p className="text-sm text-foreground whitespace-pre-wrap">
                                            {selectedApp.cover_letter}
                                        </p>
                                    </div>
                                )}

                                {/* Status Timeline */}
                                <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                                        Application Progress
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedApp.status !== "REJECTED" ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <div className={`flex-1 h-1 rounded ${["VIEWED", "SHORTLISTED"].includes(selectedApp.status) ? "bg-emerald-500/50" : "bg-muted"}`} />
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${["VIEWED", "SHORTLISTED"].includes(selectedApp.status) ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground"}`}>
                                            <Eye className="w-4 h-4" />
                                        </div>
                                        <div className={`flex-1 h-1 rounded ${selectedApp.status === "SHORTLISTED" ? "bg-emerald-500/50" : "bg-muted"}`} />
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedApp.status === "SHORTLISTED" ? "bg-emerald-500/20 text-emerald-400" : selectedApp.status === "REJECTED" ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground"}`}>
                                            {selectedApp.status === "REJECTED" ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                        <span>Applied</span>
                                        <span>Viewed</span>
                                        <span>{selectedApp.status === "REJECTED" ? "Rejected" : "Shortlisted"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-border/30 flex justify-end">
                                <Button variant="outline" onClick={closeAppModal}>
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

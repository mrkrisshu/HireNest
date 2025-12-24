"use client";

import { useImageUpload } from "@/components/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, FileText, Upload, Loader2, Settings, Globe } from "lucide-react";
import { useId, useState, useRef } from "react";
import { motion } from "framer-motion";

interface ProfileEditDialogProps {
    user: {
        email: string;
        profile?: {
            phone?: string | null;
            photo_url?: string | null;
            resume_url?: string | null;
            bio?: string | null;
            portfolio_url?: string | null;
        };
    } | null;
    onSave: (data: { phone: string; bio: string; portfolio_url: string }) => Promise<void>;
    onPhotoUpload: (file: File) => Promise<void>;
    onResumeUpload: (file: File) => Promise<void>;
    isUploading: boolean;
    isSaving: boolean;
    sidebarOpen: boolean;
}

export function ProfileEditDialog({
    user,
    onSave,
    onPhotoUpload,
    onResumeUpload,
    isUploading,
    isSaving,
    sidebarOpen,
}: ProfileEditDialogProps) {
    const id = useId();
    const [phone, setPhone] = useState(user?.profile?.phone || "");
    const [bio, setBio] = useState(user?.profile?.bio || "");
    const [portfolioUrl, setPortfolioUrl] = useState(user?.profile?.portfolio_url || "");
    const [open, setOpen] = useState(false);

    const maxBioLength = 300;
    const bioCharCount = bio.length;

    const handleSave = async () => {
        await onSave({ phone, bio, portfolio_url: portfolioUrl });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="w-full flex items-center gap-2 py-2.5 px-2 rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <Settings className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
                    <motion.span
                        animate={{
                            display: sidebarOpen ? "inline-block" : "none",
                            opacity: sidebarOpen ? 1 : 0,
                        }}
                        className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre"
                    >
                        Profile Settings
                    </motion.span>
                </button>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b border-border px-6 py-4 text-base">
                        Edit profile
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription className="sr-only">
                    Update your profile information, photo and resume.
                </DialogDescription>
                <div className="overflow-y-auto max-h-[70vh]">
                    {/* Avatar Section */}
                    <div className="p-6 pb-4 flex items-center gap-4 border-b border-border">
                        <Avatar
                            defaultImage={user?.profile?.photo_url || undefined}
                            onUpload={onPhotoUpload}
                            isUploading={isUploading}
                        />
                        <div>
                            <p className="font-medium">{user?.email}</p>
                            <p className="text-sm text-muted-foreground">Click to change photo</p>
                        </div>
                    </div>

                    <div className="px-6 pb-6 pt-4 space-y-5">
                        {/* Contact Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-email`}>Email Address</Label>
                                <Input
                                    id={`${id}-email`}
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-phone`}>Phone Number</Label>
                                <Input
                                    id={`${id}-phone`}
                                    placeholder="+1 (555) 000-0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    type="tel"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-bio`}>
                                Bio <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                            </Label>
                            <Textarea
                                id={`${id}-bio`}
                                placeholder="Write a few sentences about yourself..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value.slice(0, maxBioLength))}
                                maxLength={maxBioLength}
                                className="min-h-[80px] resize-none"
                            />
                            <p className="text-right text-xs text-muted-foreground">
                                <span className="tabular-nums">{maxBioLength - bioCharCount}</span> characters left
                            </p>
                        </div>

                        {/* Portfolio URL */}
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-portfolio`}>
                                Portfolio URL <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                            </Label>
                            <div className="flex rounded-lg shadow-sm shadow-black/5">
                                <span className="inline-flex items-center rounded-s-lg border border-input bg-muted px-3 text-sm text-muted-foreground">
                                    <Globe className="h-4 w-4" />
                                </span>
                                <Input
                                    id={`${id}-portfolio`}
                                    className="-ms-px rounded-s-none shadow-none"
                                    placeholder="https://yourportfolio.com"
                                    value={portfolioUrl}
                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                    type="url"
                                />
                            </div>
                        </div>

                        {/* Resume Upload */}
                        <ResumeUpload
                            currentResumeUrl={user?.profile?.resume_url || null}
                            onUpload={onResumeUpload}
                            isUploading={isUploading}
                        />
                    </div>
                </div>
                <DialogFooter className="border-t border-border px-6 py-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface AvatarProps {
    defaultImage?: string;
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
}

function Avatar({ defaultImage, onUpload, isUploading }: AvatarProps) {
    const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange } = useImageUpload();
    const currentImage = previewUrl || defaultImage;

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileChange(e);
        const file = e.target.files?.[0];
        if (file) {
            await onUpload(file);
        }
    };

    return (
        <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm cursor-pointer"
            onClick={handleThumbnailClick}>
            {currentImage ? (
                <img
                    src={currentImage}
                    className="h-full w-full object-cover"
                    width={64}
                    height={64}
                    alt="Profile image"
                />
            ) : (
                <span className="text-xl text-white font-bold">?</span>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                {isUploading ? (
                    <Loader2 size={20} className="animate-spin text-white" />
                ) : (
                    <ImagePlus size={20} className="text-white" />
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                className="hidden"
                accept="image/*"
                aria-label="Upload profile picture"
            />
        </div>
    );
}

interface ResumeUploadProps {
    currentResumeUrl: string | null;
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
}

function ResumeUpload({ currentResumeUrl, onUpload, isUploading }: ResumeUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            await onUpload(file);
        }
    };

    return (
        <div className="space-y-2">
            <Label>Resume</Label>
            {currentResumeUrl || fileName ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                            <FileText className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{fileName || "Resume uploaded"}</p>
                            <p className="text-xs text-muted-foreground">PDF Document</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {currentResumeUrl && (
                            <a href={currentResumeUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm">View</Button>
                            </a>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClick}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Replace
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={isUploading}
                    className="w-full border-2 border-dashed rounded-xl p-6 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer"
                >
                    <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                        {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                        ) : (
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                    <p className="text-sm font-medium">Upload your resume</p>
                    <p className="text-xs text-muted-foreground">PDF files only, max 10MB</p>
                </button>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                className="hidden"
                accept=".pdf"
                aria-label="Upload resume"
            />
            {!currentResumeUrl && !fileName && (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-2">
                    ⚠️ Resume required to apply for jobs
                </p>
            )}
        </div>
    );
}

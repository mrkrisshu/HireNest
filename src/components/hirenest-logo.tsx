import Image from "next/image"
import { cn } from "@/lib/utils"

interface HireNestLogoProps {
    className?: string
    size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
    sm: { width: 16, height: 16 },
    md: { width: 20, height: 20 },
    lg: { width: 32, height: 32 },
    xl: { width: 40, height: 40 },
}

export function HireNestLogo({ className, size = "md" }: HireNestLogoProps) {
    const { width, height } = sizeMap[size]

    return (
        <Image
            src="/logo.png"
            alt="HireNest Logo"
            width={width}
            height={height}
            className={cn("object-contain", className)}
            priority
        />
    )
}

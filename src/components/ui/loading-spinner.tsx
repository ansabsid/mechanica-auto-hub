
import React from "react";
import { Cog } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({
  size = "md",
  className,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative animate-spin">
        <Cog 
          className={cn(
            sizeClasses[size], 
            "text-mechanica-500"
          )} 
        />
      </div>
    </div>
  );
};

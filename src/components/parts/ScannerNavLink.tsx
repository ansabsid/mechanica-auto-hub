
import React from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScannerNavLinkProps {
  className?: string;
}

const ScannerNavLink: React.FC<ScannerNavLinkProps> = ({ className }) => {
  return (
    <Link
      to="/scanner"
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium hover:text-mechanica-500 transition-colors",
        className
      )}
    >
      <Camera className="w-4 h-4" />
      <span>Scan Part</span>
    </Link>
  );
};

export default ScannerNavLink;

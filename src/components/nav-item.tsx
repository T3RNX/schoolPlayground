"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  onNavigate?: () => void;
}

export function NavItem({ href, icon: Icon, label, onNavigate }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    // If we're already on this page, prevent navigation and just close sidebar
    if (isActive) {
      e.preventDefault();
      if (onNavigate) onNavigate();
    } else {
      // For other pages, let the navigation happen naturally
      // and the onNavigate will be called by the Link component
      if (onNavigate) onNavigate();
    }
  };

  return (
    <Link href={href} className="block" onClick={handleClick}>
      <div
        className={`w-full rounded-md p-2 flex items-center gap-2 transition-colors ${
          isActive
            ? "bg-secondary hover:bg-secondary"
            : "hover:bg-secondary/50 cursor-pointer"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </div>
    </Link>
  );
}

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold font-poppins transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-coral/15 text-coral",
        secondary: "border-transparent bg-electric/15 text-electric",
        destructive: "border-transparent bg-destructive/15 text-destructive",
        outline: "text-foreground border-border/50",
        romance: "border-transparent bg-hotpink/15 text-hotpink",
        action: "border-transparent bg-orange-500/15 text-orange-600",
        comedy: "border-transparent bg-sunshine/15 text-amber-600",
        thriller: "border-transparent bg-slate-500/15 text-slate-600",
        horror: "border-transparent bg-purple-900/15 text-purple-800",
        adventure: "border-transparent bg-teal/15 text-teal-600",
        drama: "border-transparent bg-blue-500/15 text-blue-600",
        fantasy: "border-transparent bg-indigo-500/15 text-indigo-600",
        mystery: "border-transparent bg-gray-600/15 text-gray-700",
        watched: "border-transparent bg-emerald-500/15 text-emerald-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

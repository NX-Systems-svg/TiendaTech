import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-850/80 p-6 elevation-base transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:elevation-raised",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-800/80 px-3 py-1 text-xs font-semibold text-mist-300">
      {children}
    </span>
  );
}

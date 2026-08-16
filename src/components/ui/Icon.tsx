import {
  ShieldCheck,
  Thermometer,
  HardDrive,
  Coins,
  Sparkles,
  Cpu,
  MemoryStick,
  Monitor,
  Briefcase,
  Search,
  Headset,
  Timer,
  Shield,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const icons: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  thermometer: Thermometer,
  "hard-drive": HardDrive,
  coins: Coins,
  sparkles: Sparkles,
  chip: Cpu,
  memory: MemoryStick,
  monitor: Monitor,
  briefcase: Briefcase,
  search: Search,
  headset: Headset,
  timer: Timer,
  shield: Shield,
  lifebuoy: LifeBuoy,
};

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const LucideIconComponent = icons[name] ?? Sparkles;
  return <LucideIconComponent className={cn("h-6 w-6", className)} strokeWidth={2} aria-hidden />;
}

import {
  AlertTriangle,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Flame,
  Home,
  Info,
  Landmark,
  ListChecks,
  Mail,
  Phone,
  QrCode,
  ScrollText,
  Shield,
  Shirt,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wifi,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "home"
  | "bell"
  | "report"
  | "list"
  | "info"
  | "building"
  | "clock"
  | "wrench"
  | "phone"
  | "qr"
  | "install"
  | "users"
  | "shield"
  | "scroll"
  | "wifi"
  | "utensils"
  | "shirt"
  | "alert"
  | "check"
  | "bed"
  | "sparkles"
  | "landmark"
  | "clipboard"
  | "mail"
  | "task";

const ICON_MAP: Record<IconName, LucideIcon> = {
  home: Home,
  bell: Bell,
  report: FileText,
  list: ClipboardList,
  info: Info,
  building: Building2,
  clock: Clock,
  wrench: Wrench,
  phone: Phone,
  qr: QrCode,
  install: Download,
  users: Users,
  shield: Shield,
  scroll: ScrollText,
  wifi: Wifi,
  utensils: UtensilsCrossed,
  shirt: Shirt,
  alert: AlertTriangle,
  check: CheckCircle2,
  bed: Landmark,
  sparkles: Sparkles,
  landmark: Landmark,
  clipboard: ListChecks,
  mail: Mail,
  task: ClipboardList,
};

interface AppIconProps {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}

export function AppIcon({ name, className = "h-5 w-5", strokeWidth = 1.75 }: AppIconProps) {
  const Icon = ICON_MAP[name];
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function IconBox({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/40 text-ht-navy transition-colors ${className}`}
    >
      <AppIcon name={name} className="h-5 w-5" />
    </div>
  );
}

export { Bell, BookOpen, ChevronRight, Flame, Smartphone };

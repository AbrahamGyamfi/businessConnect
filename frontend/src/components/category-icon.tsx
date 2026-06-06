import {
  Home,
  Briefcase,
  UtensilsCrossed,
  Heart,
  GraduationCap,
  Sparkles,
  Car,
  Laptop,
  Palette,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Home,
  Briefcase,
  UtensilsCrossed,
  Heart,
  GraduationCap,
  Sparkles,
  Car,
  Laptop,
  Palette,
  MoreHorizontal,
}

export function CategoryIcon({
  icon,
  className,
}: {
  icon: string
  className?: string
}) {
  const Icon = iconMap[icon] ?? MoreHorizontal
  return <Icon className={className} />
}

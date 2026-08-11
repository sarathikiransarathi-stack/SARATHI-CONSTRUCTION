import { Building2, ClipboardList, Compass, Factory, Hammer, Home, Ruler, Sofa, type LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  Building2,
  ClipboardList,
  Compass,
  Factory,
  Hammer,
  Home,
  Ruler,
  Sofa,
};

export function ServiceIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = icons[name] ?? Building2;
  return <Icon size={size} strokeWidth={1.5} />;
}

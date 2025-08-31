"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, Calculator, BookOpen, User } from "lucide-react";

const items = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/symptoms", label: "علائم", icon: Stethoscope },
  { href: "/dose-calculator", label: "دوز", icon: Calculator },
  { href: "/education", label: "آموزش", icon: BookOpen },
  { href: "/profile", label: "پروفایل", icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto mb-3 max-w-screen-sm px-4">
      <div className="grid grid-cols-5 rounded-2xl border bg-white/90 backdrop-blur px-2 py-2 shadow-lg">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center py-1 text-xs transition-colors duration-200 ${active ? "text-brand font-semibold" : "text-text-secondary hover:text-brand"}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? "text-brand" : "text-text-secondary"}`} strokeWidth={1.5} />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
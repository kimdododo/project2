"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Search,
  Heart,
  MapPin,
  Calendar,
  MessageSquare,
  Brain
} from "lucide-react";

export default function MobileNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "홈" },
    { href: "/recommendations", icon: Users, label: "추천" },
    { href: "/analysis", icon: TrendingUp, label: "분석" },
    { href: "/dashboard", icon: BarChart3, label: "대시보드" },
    { href: "/settings", icon: Search, label: "설정" }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center py-2 px-3 ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

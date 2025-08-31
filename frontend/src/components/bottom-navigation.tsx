'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, Stethoscope, Home, BookOpen, Pill, User } from 'lucide-react';
import { useState, useEffect } from 'react';

const navigationItems = [
  {
    name: 'خانه',
    href: '/',
    icon: Home,
  },
  {
    name: 'دوز',
    href: '/dose-calculator',
    icon: Calculator,
  },
  {
    name: 'علائم',
    href: '/symptoms',
    icon: Stethoscope,
    isCenter: true,
  },
  {
    name: 'داروها',
    href: '/my-meds',
    icon: Pill,
    requiresAuth: false,
    needsLogin: true,
  },
  {
    name: 'آموزش',
    href: '/education',
    icon: BookOpen,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
      <div className="grid grid-cols-5 h-16">
        {navigationItems
          .filter((item) => !item.requiresAuth || isLoggedIn)
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            const handleClick = (e: React.MouseEvent) => {
              if (item.needsLogin && !isLoggedIn) {
                e.preventDefault();
                alert('برای تنظیم یادآور، ابتدا باید وارد حساب کاربری خود شوید');
              }
            };
            
            if (item.isCenter) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleClick}
                  className="flex flex-col items-center justify-center relative"
                >
                  <div className={`absolute -top-2 bg-blue-600 rounded-full p-3 shadow-lg border-4 border-white transition-all ${
                    isActive ? 'bg-blue-700' : 'hover:bg-blue-700'
                  }`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`text-xs font-medium mt-6 ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleClick}
                className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <span className={`text-xs font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {item.name}
                </span>
              </Link>
             );
          })}
        
        {/* Profile/Auth Button */}
        <Link
          href={isLoggedIn ? '/profile' : '/auth/login'}
          className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
            pathname === '/profile' || pathname.startsWith('/auth')
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
          }`}
        >
          <User className={`h-5 w-5 mb-1 ${
            pathname === '/profile' || pathname.startsWith('/auth')
              ? 'text-blue-600' 
              : 'text-gray-600'
          }`} />
          <span className={`text-xs font-medium ${
            pathname === '/profile' || pathname.startsWith('/auth')
              ? 'text-blue-600' 
              : 'text-gray-600'
          }`}>
            {isLoggedIn ? 'پروفایل' : 'ورود'}
          </span>
        </Link>
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, Stethoscope, Home, User, BookOpen, LogIn, Pill } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const navigationItems = [
  {
    name: 'خانه',
    href: '/',
    icon: Home,
  },
  {
    name: 'تشخیص علائم',
    href: '/symptoms',
    icon: Stethoscope,
  },
  {
    name: 'محاسبه دوز',
    href: '/dose-calculator',
    icon: Calculator,
  },
  {
    name: 'تنظیم یادآور دارو',
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

export default function Navigation() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ profile?: { first_name?: string } } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 space-x-reverse">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">مشاور OTC</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
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
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleClick}
                    className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4 space-x-reverse">
              {isLoggedIn ? (
                <Link href="/profile">
                  <Button variant="outline" className="flex items-center space-x-2 space-x-reverse">
                    <User className="h-4 w-4" />
                    <span>{user?.profile?.first_name || 'پروفایل'}</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" className="flex items-center space-x-2 space-x-reverse">
                      <LogIn className="h-4 w-4" />
                      <span>ورود</span>
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="flex items-center space-x-2 space-x-reverse">
                      <User className="h-4 w-4" />
                      <span>ثبت‌نام</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Auth Buttons */}
          <div className="md:hidden flex items-center space-x-3 space-x-reverse">
            {isLoggedIn ? (
              <Link href="/profile">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2.5 rounded-full border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                  <div className="bg-blue-600 rounded-full p-1">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">
                    {user?.profile?.first_name || 'پروفایل'}
                  </span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button 
                    variant="outline" 
                    className="px-5 py-2.5 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 min-w-[70px]"
                  >
                    ورود
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button 
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 min-w-[80px]"
                  >
                    ثبت‌نام
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation is now handled by BottomNavigation component */}
    </nav>
  );
}
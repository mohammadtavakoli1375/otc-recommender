'use client';

import Link from 'next/link';
import { Menu, User, Bell, X, Home, Stethoscope, Calculator, BookOpen, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { name: 'خانه', href: '/', icon: Home },
  { name: 'تشخیص علائم', href: '/symptoms', icon: Stethoscope },
  { name: 'محاسبه دوز', href: '/dose-calculator', icon: Calculator },
  { name: 'تنظیم یادآور دارو', href: '/my-meds', icon: Pill, needsLogin: true },
  { name: 'آموزش', href: '/education', icon: BookOpen },
];

export default function HeaderCompact() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ profile?: { first_name?: string } } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo/Brand - Right Side */}
        <Link href="/" className="flex items-center space-x-2 space-x-reverse">
          <div className="bg-blue-600 text-white p-2 rounded-2xl shadow-sm">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">مشاور OTC</span>
            <span className="text-xs text-gray-500">راهنمای هوشمند دارو</span>
          </div>
        </Link>

        {/* User Status & Menu - Left Side */}
        <div className="flex items-center space-x-3 space-x-reverse">
          {/* User Status Badge */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs px-2 py-1"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setIsLoggedIn(false);
                  setUser(null);
                  window.location.href = '/';
                }}
              >
                خروج
              </Button>
              <Link href="/profile">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 cursor-pointer hover:bg-green-200">
                  <User className="h-3 w-3 ml-1" />
                  {user?.profile?.first_name || 'کاربر'}
                </Badge>
              </Link>
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 space-x-reverse">
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="text-xs px-3 py-1">
                  ورود
                </Button>
              </Link>
              <Badge variant="outline" className="text-gray-600">
                مهمان
              </Badge>
            </div>
          )}

          {/* Hamburger Menu */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" strokeWidth={1.5} />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" strokeWidth={1.5} />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ease-out ${
        isMenuOpen 
          ? 'opacity-100 visible backdrop-blur-sm' 
          : 'opacity-0 invisible'
      }`}>
        <div 
          className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"
          onClick={() => setIsMenuOpen(false)}
        />
        
        <div className={`absolute top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out ${
          isMenuOpen 
            ? 'translate-x-0 opacity-100' 
            : 'translate-x-full opacity-0'
        }`}>
          <div className="relative h-full overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30" />
            
            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col">
              {/* Menu Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Menu className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    منوی اصلی
                  </h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  const handleClick = (e: React.MouseEvent) => {
                    if (item.needsLogin && !isLoggedIn) {
                      e.preventDefault();
                      alert('برای تنظیم یادآور، ابتدا باید وارد حساب کاربری خود شوید');
                      return;
                    }
                    setIsMenuOpen(false);
                  };

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleClick}
                      className={`group flex items-center space-x-4 space-x-reverse p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: isMenuOpen ? 'slideInRight 0.6s ease-out forwards' : 'none'
                      }}
                    >
                      <div className={`p-2 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                      }`}>
                        <Icon className={`h-5 w-5 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                        }`} />
                      </div>
                      <span className={`font-medium transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {item.name}
                      </span>
                      {isActive && (
                        <div className="mr-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Section */}
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                {isLoggedIn ? (
                  <div className="space-y-3">
                    <Link 
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center space-x-4 space-x-reverse p-4 rounded-2xl text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <div className="p-2 bg-gray-100 group-hover:bg-white group-hover:shadow-sm rounded-xl transition-all duration-300">
                        <User className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                      </div>
                      <span className="font-medium group-hover:text-gray-900 transition-colors duration-300">پروفایل</span>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start space-x-4 space-x-reverse p-4 h-auto rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setIsLoggedIn(false);
                        setUser(null);
                        setIsMenuOpen(false);
                        window.location.href = '/';
                      }}
                    >
                      <div className="p-2 bg-red-100 rounded-xl">
                        <X className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="font-medium">خروج از حساب</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      href="/auth/login"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                        ورود به حساب
                      </Button>
                    </Link>
                    <Link 
                      href="/auth/register"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full h-12 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 font-medium transition-all duration-300 transform hover:scale-[1.02]">
                        ثبت‌نام رایگان
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </header>
  );
}
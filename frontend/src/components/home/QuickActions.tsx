'use client';

import Link from 'next/link';
import { Bell, HelpCircle, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const quickActions = [
  {
    title: 'یادآورها',
    href: '/reminders',
    icon: Clock,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'اعلان‌ها',
    href: '/notifications',
    icon: Bell,
    color: 'bg-green-50 text-green-600',
  },
  {
    title: 'سوالات متداول',
    href: '/education/faqs',
    icon: HelpCircle,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    title: 'پروفایل',
    href: '/profile',
    icon: User,
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function QuickActions() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="px-4 py-2"
    >
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
            >
              <Link
                href={action.href}
                className="flex flex-col items-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 h-20 justify-center"
              >
                <div className={`p-2 rounded-xl ${action.color} mb-2`}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                  {action.title}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
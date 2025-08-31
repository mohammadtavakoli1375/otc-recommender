'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 1.4 }}
      className="fixed bottom-20 left-4 z-40 md:bottom-4"
    >
      <Button
        onClick={toggleTheme}
        variant="outline"
        size="sm"
        className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl rounded-full p-3 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-yellow-600" strokeWidth={1.5} />
          ) : (
            <Moon className="h-4 w-4 text-gray-700" strokeWidth={1.5} />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
}
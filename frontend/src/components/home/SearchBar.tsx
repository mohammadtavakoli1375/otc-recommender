'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="px-4 py-3"
    >
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
            strokeWidth={1.5}
          />
          <Input
            type="text"
            placeholder="جست‌وجوی علائم، محتوای آموزشی یا دارو…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 text-right bg-gray-50 border-gray-200 rounded-2xl shadow-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
        </div>
      </form>
    </motion.div>
  );
}
'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function EducationalAlert() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.8 }}
      className="px-4 py-2"
    >
      <Alert className="border-amber-200 bg-amber-50 rounded-2xl">
        <AlertTriangle className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
        <AlertDescription className="text-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex-1 ml-3">
              <p className="text-sm font-medium mb-1">
                هشدار مهم درباره خودداری
              </p>
              <p className="text-xs leading-relaxed">
                این اپلیکیشن جایگزین مشاوره پزشک نیست. در موارد اورژانسی به پزشک مراجعه کنید.
              </p>
            </div>
            <Link href="/education/medical-disclaimer">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-amber-700 hover:text-amber-800 hover:bg-amber-100 rounded-xl flex-shrink-0"
              >
                بیشتر بخوانید
                <ArrowLeft className="h-3 w-3 mr-1" strokeWidth={1.5} />
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
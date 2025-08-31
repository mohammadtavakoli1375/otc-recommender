'use client';

import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "توصیف علائم",
    description: "علائم خود را به صورت دقیق وارد کنید"
  },
  {
    number: 2,
    title: "تحلیل هوشمند",
    description: "سیستم علائم را بر اساس پروتکل‌های علمی بررسی می‌کند"
  },
  {
    number: 3,
    title: "دریافت راهکار",
    description: "بهترین داروهای OTC و دوز مناسب را دریافت کنید"
  }
];

export function HowItWorks() {
  return (
    <section className="py-6 px-4 md:py-10 md:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            چگونه کار می‌کند؟
          </h2>
          
          {/* Mobile: Vertical Layout */}
          <div className="md:hidden space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 + index * 0.1 }}
                className="flex-1 text-center relative"
              >
                <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">{step.description}</p>
                
                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-full w-full flex justify-center pointer-events-none">
                    <svg
                      className="w-8 h-8 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
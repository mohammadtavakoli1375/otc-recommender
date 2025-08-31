'use client';

import { useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Only register in production (non-localhost)
      if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('SW registered: ', registration);
          })
          .catch(function(registrationError) {
            console.log('SW registration failed: ', registrationError);
          });
      } else {
        // In development, unregister all service workers
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
            console.log('SW unregistered in development');
          }
        });
      }
    }
  }, []);

  return <>{children}</>;
}
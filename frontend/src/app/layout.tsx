import "./globals.css";
import ClientLayout from "./client-layout";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export const metadata = {
  title: 'مشاور OTC - راهنمای هوشمند داروهای بدون نسخه',
  description: 'راهنمای هوشمند برای مصرف صحیح داروهای OTC با استفاده از پروتکل‌های علمی',
  keywords: 'OTC, دارو, بدون نسخه, علائم, تشخیص, مصرف صحیح, سلامت',
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://otc-recommender.com/#website',
      url: 'https://otc-recommender.com/',
      name: 'مشاور OTC',
      description: 'راهنمای هوشمند برای مصرف صحیح داروهای OTC',
      inLanguage: 'fa-IR',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://otc-recommender.com/symptoms?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://otc-recommender.com/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'خانه',
          item: 'https://otc-recommender.com/',
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

      </head>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <ClientLayout>
          <div className="mx-auto max-w-screen-sm px-4 py-4">
            {children}
          </div>
        </ClientLayout>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== "undefined") {
                if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
                  import("/register-sw.js").catch(() => {});
                } else if ("serviceWorker" in navigator) {
                  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

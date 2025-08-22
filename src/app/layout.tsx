
import type { Metadata } from 'next';
import './globals.css';
import { Toaster as OldToaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Feastly',
  description: 'Transform Meal Planning with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ scrollBehavior: 'smooth' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <AuthProvider>
          {children}
          <OldToaster />
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}

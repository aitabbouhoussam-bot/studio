
import type { Metadata } from 'next';
import './globals.css';
import { Toaster as OldToaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from 'react-hot-toast';
import { Inter, Lora } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontLora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: 'MealGenius',
  description: 'Transform Meal Planning with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ scrollBehavior: 'smooth' }}>
      <body className={cn("font-body antialiased min-h-screen bg-background", fontInter.variable, fontLora.variable)}>
        <AuthProvider>
          {children}
          <OldToaster />
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}

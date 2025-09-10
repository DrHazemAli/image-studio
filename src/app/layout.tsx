import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import '@radix-ui/themes/styles.css';
import { ThemeProvider } from 'next-themes';
import { Theme } from '@radix-ui/themes';
import { ToastProvider } from '@/components/ui/toast';
import appConfig from '@/app/config/app-config.json';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: appConfig.app.name,
  description: appConfig.app.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Theme>
            <ToastProvider>{children}</ToastProvider>
          </Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}

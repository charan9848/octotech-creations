"use client";

import { ThemeProvider } from '@mui/material/styles';
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { usePathname } from 'next/navigation';
import { Toolbar } from "@mui/material";
import theme from './theme';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';
import VisitorTracker from '@/components/VisitorTracker';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <VisitorTracker />
        {!isAdminPage && <Navbar />}
        {!isAdminPage && <Toolbar />}
        
        <main>
          {children}
          <Analytics />
          <SpeedInsights />
          <Toaster
            toastOptions={{
              style: {
                fontFamily: theme.typography.body1.fontFamily,
                fontSize: theme.typography.body1.fontSize,
              },
            }}
          />
        </main>
        
        {!isAdminPage && <Footer />}
      </ThemeProvider>
    </SessionProvider>
  );
}

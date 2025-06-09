"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '@mui/material/styles';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import theme from './theme';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';
import "./globals.css";

import { Toolbar } from "@mui/material";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideNavAndFooter = false; // Show navbar and footer on all pages

  return (
    <html lang="en">
      <head>
        <title>Octotech Creations | VFX, Animation & Compositing Studio</title>
        <meta name="description" content="Pixel-perfect compositing, VFX, 3D animation, and motion graphics for film, ads, and brands. Elevate your visuals with Octotech Creations." />
        <meta name="keywords" content="VFX, Animation, 3D, Motion Graphics, Octotech, Video Editing, Compositing, Visual Effects, Studio" />
        <meta name="author" content="Octotech Creations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Octotech Creations | VFX, Animation & Compositing Studio" />
        <meta property="og:description" content="Pixel-perfect compositing, VFX, 3D animation, and motion graphics for film, ads, and brands. Elevate your visuals with Octotech Creations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://octotech-creations.vercel.app" />
        <meta property="og:image" content="/OCTOTECH.svg" />
        <meta property="og:see_also" content="https://www.youtube.com/@OCTOTECHCREATIONS" />
        <meta property="og:see_also" content="https://www.instagram.com/octotech_creations/?hl=en" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="canonical" href="https://octotech-creations.vercel.app/" />
        {/* Add your Google site verification meta tag below */}
        <meta name="google-site-verification" content="u8wjNF9K9V2zHuWohf1n3iK4AapXkxqOR4sL0FzUgkA" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Octotech Creations",
            "url": "https://octotech-creations.vercel.app",
            "logo": "https://octotech-creations.vercel.app/OCTOTECH.svg",
            "sameAs": [
              "https://www.facebook.com/octotechcreations",
              "https://www.instagram.com/octotech_creations",
              "https://www.youtube.com/@OCTOTECHCREATIONS"
            ]
          })
        }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <ThemeProvider theme={theme}>
            <Navbar />
            <Toolbar />
            
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
            
            <Footer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
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
        <meta property="og:url" content="https://octotechcreations.com" />
        <meta property="og:image" content="https://octotechcreations.com/favicon-196x196.png" />
        <meta property="og:image:width" content="196" />
        <meta property="og:image:height" content="196" />
        <meta property="og:see_also" content="https://www.youtube.com/@OCTOTECHCREATIONS" />
        <meta property="og:see_also" content="https://www.instagram.com/octotech_creations/?hl=en" />
        {/* Favicon - Complete set for all devices and browsers */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="196x196" href="/favicon-196x196.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/favicon-128x128.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png" />
          {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Windows Tiles */}
        <meta name="msapplication-TileColor" content="#0B1113" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-square70x70logo" content="/mstile-70x70.png" />
        <meta name="msapplication-square150x150logo" content="/mstile-150x150.png" />
        <meta name="msapplication-wide310x150logo" content="/mstile-310x150.png" />
        <meta name="msapplication-square310x310logo" content="/mstile-310x310.png" />
        <meta name="theme-color" content="#00ACC1" />
        <link rel="canonical" href="https://octotechcreations.com/" />
        {/* Add your Google site verification meta tag below */}
        <meta name="google-site-verification" content="u8wjNF9K9V2zHuWohf1n3iK4AapXkxqOR4sL0FzUgkA" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Octotech Creations",
            "alternateName": "OctoTech Creations",
            "url": "https://octotechcreations.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://octotechcreations.com/favicon-196x196.png",
              "width": "196",
              "height": "196"
            },
            "image": "https://octotechcreations.com/favicon-196x196.png",
            "description": "Pixel-perfect compositing, VFX, 3D animation, and motion graphics for film, ads, and brands.",
            "foundingDate": "2020",
            "founder": {
              "@type": "Person",
              "name": "Gannoj Bhanu Charan"
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "Global"
            },
            "serviceArea": "Worldwide",
            "knowsAbout": [
              "Visual Effects",
              "VFX",
              "Video Editing", 
              "3D Animation",
              "Motion Graphics",
              "Color Grading",
              "Digital Intermediate",
              "Compositing",
              "CGI",
              "Real Estate Video Production"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "VFX and Animation Services",
              "itemListElement": [
                {
                  "@type": "OfferCatalog",
                  "name": "Video Editing",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Professional Video Editing",
                        "description": "Professional video editing services with seamless cuts, color correction, and audio synchronization for films, commercials, and content."
                      }
                    }
                  ]
                },
                {
                  "@type": "OfferCatalog", 
                  "name": "VFX",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Visual Effects",
                        "description": "We add explosions, fire, smoke, and digital elements that bring your scenes to life. Perfect for films, commercials, and music videos."
                      }
                    }
                  ]
                }
              ]
            },
            "sameAs": [
              "https://www.facebook.com/octotechcreations",
              "https://www.instagram.com/octotech_creations",
              "https://www.youtube.com/@OCTOTECHCREATIONS"            ]
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
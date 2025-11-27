import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Octotech Creations | VFX, Animation & Compositing Studio",
  description: "At OctoTech, we turn that vision into visuals that sell, connect, and stay etched in the viewer’s mind. We create visuals that drive results.",
  keywords: "VFX, Animation, 3D, Motion Graphics, Octotech, Video Editing, Compositing, Visual Effects, Studio",
  authors: [{ name: "Octotech Creations" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Octotech Creations | VFX, Animation & Compositing Studio",
    description: "At OctoTech, we turn that vision into visuals that sell, connect, and stay etched in the viewer’s mind. We create visuals that drive results.",
    type: "website",
    url: "https://octotechcreations.com",
    images: [
      {
        url: "https://octotechcreations.com/favicon-196x196.png",
        width: 196,
        height: 196,
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
        <meta name="msapplication-wide310x150logo" content="/mstile-310x150.png" />        <meta name="msapplication-square310x310logo" content="/mstile-310x310.png" />
        <meta name="theme-color" content="#00ACC1" />
        {/* Add your Google site verification meta tag below */}
        <meta name="google-site-verification" content="u8wjNF9K9V2zHuWohf1n3iK4AapXkxqOR4sL0FzUgkA" />
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9290596302357676"
          crossOrigin="anonymous"></script>
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
            "description": "At OctoTech, we turn that vision into visuals that sell, connect, and stay etched in the viewer’s mind. We create visuals that drive results.",
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
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
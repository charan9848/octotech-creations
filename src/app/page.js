import Image from "next/image";
import styles from "./page.module.css";
import HomeComponent from "./home/page";
import { Box } from "@mui/material";

export const metadata = {
  title: "Octotech Creations | VFX, Animation & Compositing Studio",
  description: "Pixel-perfect compositing, VFX, 3D animation, and motion graphics for film, ads, and brands. Elevate your visuals with Octotech Creations.",
  alternates: {
    canonical: 'https://octotechcreations.com',
  },
  openGraph: {
    title: "Octotech Creations | VFX, Animation & Compositing Studio",
    description: "Pixel-perfect compositing, VFX, 3D animation, and motion graphics for film, ads, and brands. Elevate your visuals with Octotech Creations.",
    url: 'https://octotechcreations.com',
    siteName: 'Octotech Creations',
    type: 'website',
    images: [
      {
        url: 'https://octotechcreations.com/favicon-196x196.png',
        width: 196,
        height: 196,
        alt: 'Octotech Creations Logo',
      },
    ],
  },
};

export default function Home() {
  return (
    <Box>
      <HomeComponent/>
    </Box>
  );
}

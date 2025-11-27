import Image from "next/image";
import styles from "./page.module.css";
import HomeComponent from "./home/page";
import { Box } from "@mui/material";

export const metadata = {
  title: "Octotech Creations | VFX, Animation & Compositing Studio",
  description: "At OctoTech, we turn that vision into visuals that sell, connect, and stay etched in the viewer’s mind. We create visuals that drive results.",
  alternates: {
    canonical: 'https://octotechcreations.com',
  },
  openGraph: {
    title: "Octotech Creations | VFX, Animation & Compositing Studio",
    description: "At OctoTech, we turn that vision into visuals that sell, connect, and stay etched in the viewer’s mind. We create visuals that drive results.",
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

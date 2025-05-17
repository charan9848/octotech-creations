import Image from "next/image";
import styles from "./page.module.css";
import HomeComponent from "./home/page";
import { Box } from "@mui/material";

export default function Home() {
  return (
    <Box>
      <HomeComponent/>
    </Box>
  );
}

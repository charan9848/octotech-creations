import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Box, Typography } from "@mui/material";

const ArtistDashboard = async() => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/artist-login");
  }

  return (
    <Box sx={{backgroundColor: '#15191c' }}>
        <Typography variant="h4" color="white" textAlign="center" >
            Welcome to your Dashboard, {session.user.name}!
        </Typography>
    </Box>
  );
}

export default ArtistDashboard;
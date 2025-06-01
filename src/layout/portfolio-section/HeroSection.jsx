import { Box, Typography, Avatar } from "@mui/material";
import MailOutlineIcon from '@mui/icons-material/MailOutline';

export function HeroSection({ name, bio, quotation, email, phone, logo }) {
    return (
        <Box position="relative" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", padding: "10px" }}>
            {/* Background Video */}
            <video
                className="video-background"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    opacity: 0.25
                }}
                preload="auto"
                autoPlay
                loop
                muted
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                playsInline
            >
                <source src="https://res.cloudinary.com/djbilxr7i/video/upload/v1746872773/clouds_-_Trim_wyt1mv.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    width: "100%",
                    position: "relative",
                    zIndex: 1,
                    my: 5,
                    padding: 3,
                }}

            >
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: "center", width: "45%" }} my={5} p={3}>
                    <Typography
                        variant="h1"
                        color="White"
                        mt={2}
                        sx={{
                            fontSize: {
                                xs: "1.5rem",
                                sm: "2rem",
                                md: "2.5rem",
                                lg: "3rem"
                            }
                        }}
                    >
                        Hi, I'm <span style={{ color: "#32b4de" }}>{name}</span>,
                    </Typography>
                    <Typography
                        variant="h2"
                       
                        color="#707173"
                        mt={3}
                        sx={{
                            fontSize: {
                                xs: "0.6rem",
                                sm: "0.8rem",
                                md: "1rem",
                                lg: "1.2rem"
                            }
                        }}
                    >
                        {bio}
                    </Typography>
                </Box>
                <Box mt={5} p={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                            src={logo}
                            alt="Portfolio"
                            sx={{
                                width: { xs: '150px', sm: '200px', md: '350px' },
                                height: { xs: '150px', sm: '200px', md: '350px' },
                                bgcolor: "#222", fontSize: 48
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }} m={2}>
                        {quotation &&
                            <Typography variant="body2" sx={{
                                textDecoration: 'none',
                                fontSize: {
                                    xs: "8px",
                                    sm: "10px",
                                    md: "12px",
                                },
                                color: 'white'
                            }}>~ {quotation}</Typography>
                        }
                        {email &&
                            <Typography variant="body2" sx={{
                                textDecoration: 'none',
                                fontSize: {
                                    xs: "8px",
                                    sm: "10px",
                                    md: "12px",
                                },
                                color: 'white'
                            }}><MailOutlineIcon sx={{ fontSize: '12px', verticalAlign: "middle" }} /> {email}</Typography>
                        }
                        {phone &&
                            <Typography variant="body2" sx={{
                                textDecoration: 'none',
                                fontSize: {
                                    xs: "8px",
                                    sm: "10px",
                                    md: "12px",
                                },
                                color: 'white'
                            }}><MailOutlineIcon sx={{ fontSize: '12px', verticalAlign: "middle" }} /> {phone}</Typography>
                        }
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
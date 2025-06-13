import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material';
import React from 'react'
import { red } from '@mui/material/colors';
import InstagramIcon from '@mui/icons-material/Instagram';
import Link from 'next/link';
const OurTeam = () => {


    const teams = [
        {
            id: 1,
            name: 'Raghu Roman',
            role: 'VFX Artist',
            image: 'https://res.cloudinary.com/djbilxr7i/image/upload/v1749808666/Raghu_npl96k.jpg',
            description: "With over 5 years of experience crafting visual effects exclusively for Tollywood films, Raghu Roman is not just a VFX artist — he's a cinematic sculptor. From invisible compositing to high-impact sequences, his work blends seamlessly into the director's vision, enhancing emotion, scale, and story. Raghu brings a deep understanding of film grammar, color tone, and shot psychology. His work isn't just about adding effects — it's about elevating narrative to the screen with clarity, precision, and cinematic depth.",
            instagram: "https://www.instagram.com/raghu__roman",
            portfolio: '/portfolio/Raghuroman123'

        },
        {
            id: 2,
            name: 'Akash Narayandas',
            role: 'Video Editor',
            image: 'https://res.cloudinary.com/djbilxr7i/image/upload/v1749808666/Akash_apamic.jpg',
            description: "With over 5 years of experience in video editing and motion graphics, Akash has helped brands, influencers, and creators transform basic footage into scroll-stopping, emotionally powerful content. His editing style is known for impact and clarity — every cut, transition, and motion graphic is designed to hold attention and drive growth. Want to see the craft up close? Dive deeper into his work on his dedicated channel: 📺 'Akash Edit Maestro' – where creativity meets mastery",
            instagram: 'https://www.instagram.com/akash_edit_maestro/',
            portfolio: '/portfolio/narayandasakash'
        }
        ,
        {
            id: 3,
            name: 'Tillu',
            role: '3D Artist',
            image:'https://res.cloudinary.com/djbilxr7i/image/upload/v1748783457/artist-profiles/rg0efb1mrukfhcvyavpq.png',
            description: "Tillu is a 3D artist with a passion for creating stunning visual experiences. With expertise in modeling, texturing, and rendering, Tillu brings imagination to life through 3D art. Whether it's character design, environment creation, or product visualization, Tillu's work showcases a unique blend of creativity and technical skill.  Tillu's portfolio features a diverse range of projects, from realistic character models to intricate architectural visualizations. With a keen eye for detail and a commitment to quality, Tillu delivers exceptional 3D art that captivates audiences and enhances storytelling.",
            instagram: 'https://www.instagram.com/tilluanimator',
            portfolio: '/portfolio/tillu'
        }
    ]

    return (
        <Box sx={{ backgroundColor: '#15191C' }} p={5}>
            <Box m={5} sx={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center" }}>
                <Box textAlign="center" >
                    <Typography variant="h1" color="white">Our Team</Typography>
               
                    <Typography variant="h6" color="#32b4de" mt={2}>
                        Meet the creative minds behind our projects. Our team is a blend of artists, animators, and VFX specialists dedicated to bringing your vision to life.
                    </Typography>
                </Box>

                <Box my={7} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5 }}>
                    {
                        teams.map(team => (
                            <Card key={team.id} sx={{
                                width: 400,
                                backgroundColor: '#1a1e23',
                                color: 'white',
                                borderRadius: 5,
                                border: '1px solid #333',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.9)',
                                transition: 'transform 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '500'
                            }}>
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                                            <img src={team.image} alt={team.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                        </Avatar>
                                    }
                                    title={
                                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {team.name}
                                        </Typography>
                                    }
                                    subheader={
                                        <Typography variant="subtitle1" sx={{ color: '#b0b0b0' }}>
                                            {team.role}
                                        </Typography>
                                    }
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                                        {team.description}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', p: 2, marginTop: 'auto' }}>
                                    <Link href={team.instagram} target="_blank" rel="noopener noreferrer">
                                        <IconButton aria-label="instagram" sx={{ color: '#e1306c' }}>
                                            <InstagramIcon />
                                        </IconButton>
                                    </Link>
                                    <Link href={team.portfolio}>
                                        <Button variant='contained' size='small' sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                                            <Typography variant='body1'>View Portfolio</Typography>
                                        </Button>
                                    </Link>
                                </CardActions>
                            </Card>
                        ))
                    }
                </Box>
            </Box>
        </Box>
    )
}

export default OurTeam;
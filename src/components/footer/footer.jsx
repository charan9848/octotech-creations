import { Box, Button, FormHelperText, FormLabel, TextField, Typography, IconButton } from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import Link from "next/link";
import * as yup from "yup";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';


const footer = () => {
    const [loading, setLoading] = useState(false);
    const [version, setVersion] = useState('1.0');

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const res = await axios.get('/api/version');
                if (res.data?.version) {
                    setVersion(res.data.version);
                }
            } catch (error) {
                console.error('Failed to fetch version');
            }
        };
        fetchVersion();
    }, []);

    const octotechInfo = [
        {
            id: 1, // Numeric ID for the section
            title: "Navigations",
            links: [
                { id: 101, name: "Home", link: "/home" },
                { id: 102, name: "Contact Us", link: "/contact" },
                { id: 103, name: "Artist Login", link: "/artist-login" },
                { id: 104, name: "Services", link: "/#services" },
                
            ],
        },
        {
            id: 2, // Numeric ID for the section
            title: "Company",
            links: [
                { id: 201, name: "About Us", link: "/about" },
                { id: 202, name: "Testimonials", link: "/testimonials" },
                { id: 203, name: "Our Team", link: "/#ourteam" },
            ],
        },
        {
            id: 3, // Numeric ID for the section
            title: "Contact",
            links: [
                { id: 301, name: "Email", link: "mailto:octotechcreation@gmail.com" },
                { id: 302, name: "Instagram", link: "https://instagram.com/octotech_creation" },
                { id: 303, name: "YouTube", link: "https://youtube.com/@OctotechCreation" },
                { id: 304, name: "Phone/WhatsApp", link: "tel:+91XXXXXXXXXX" },
            ],
        },
    ];






    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            email: '',
            message: '',

        },
        validationSchema: yup.object({
            firstname: yup.string().required('Firstname is Required').min(4, 'Name too short'),
            lastname: yup.string(),
            email: yup.string().email('Invalid email address').required('Email is Required'),
            message: yup.string().required('Message is Required').min(10, 'Message too short'),
        }),
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            try {

                await axios.post('/api/contact', values);
                toast.success("Message sent successfully!");
                resetForm();
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    });



    return (
        <Box sx={{ backgroundColor: '#0B1113', display: "flex", flexWrap: 'wrap', flexDirection: { xs: "column", sm: "column", md: "row" }, borderTop: '1px solid #333' }} p={{ xs: 2, md: 5 }} >
            <Box sx={{ width: { md: "22%", sm: "45%", xs: "100%" }, padding: { xs: 0, md: "20px" }, mb: { xs: 4, md: 0 } }} >
                <Box sx={{ display: "flex", alignItems: "center", }} py={2} ps={1}>
                    <Box
                        component="img"
                        src="/OCTOTECH.svg"
                        alt="Logo"
                        sx={{
                            height: {
                                xs: "40px",
                                sm: "55px",
                                md: "55px",
                            },
                            mr: 1
                        }}
                    />
                    <Typography
                        variant="title"
                        sx={{
                            fontSize: {
                                xs: "16px",
                                sm: "18px",
                                md: "25px",
                            },
                            color: 'white'
                        }}
                    >
                        OCTOTECH
                    </Typography>
                </Box>

                <Box p={1}>
                    <Typography variant="h6" sx={{ fontSize: { md: '14px', xs: '12px', sm: "12px" }, color: '#78838D' }}>Octotech Creation is your ultimate destination for high-quality VFX, 2D/3D editing, and Photoshop resources. VFX can be complex, but with our creative expertise and powerful library, achieving stunning visual results becomes fast, professional, and effortless!</Typography>
                </Box>
            </Box>
            
            <Box sx={{ width: { md: "40%", sm: "70%", xs: '100%' }, display: "flex", justifyContent: { xs: 'flex-start', md: 'space-around' }, flexWrap: 'wrap' }} p={{ xs: 0, md: 3 }}>
                {
                    octotechInfo.map(infos => (
                        <Box key={infos.id} p={2} sx={{ width: { xs: '50%', md: 'auto' } }}>
                            <Typography variant="body1" my={2} sx={{ color: 'white', fontWeight: 'bold' }}>{infos.title.toUpperCase()}</Typography>
                            <Box>
                                {
                                    infos.links.map(info => (
                                        <Box key={info.id} mt={1} >
                                            <Link href={info.link} style={{ textDecoration: 'none' }}>
                                                <Typography variant="h6"
                                                    sx={{
                                                        fontSize: {
                                                            xs: "12px",
                                                            sm: "12px",
                                                            md: "12px",
                                                        },
                                                        color: '#78838D',
                                                        "&:hover": {
                                                            color: 'white'
                                                        }
                                                    }}
                                                >{info.name}</Typography>
                                            </Link>
                                        </Box>
                                    ))
                                }
                            </Box>
                        </Box>
                    ))
                }
            </Box>

            <Box sx={{ width: { md: "30%", sm: "50%", xs: '100%' }, display: "flex", justifyContent: 'center' }} p={{ xs: 0, md: 1 }}>
                <Box sx={{ width: '100%', maxWidth: '400px', p: { xs: 2, md: 4 }, mt: 1, borderRadius: '8px', backgroundColor: { xs: 'transparent', md: '#13171a' } }}>
                    <Box mb={2} >
                        <Typography variant="body1" mb={1} sx={{ color: 'white', fontWeight: 'bold' }}>CONNECT WITH US</Typography>
                        <Typography variant="h6" color='#78838D' fontSize="14px">Stay updated with Octotech news, offers, and promotions.</Typography>
                    </Box>

                    <form onSubmit={formik.handleSubmit}>
                        <dl>
                            <FormLabel sx={{ color: '#ccc' }}>First Name *</FormLabel>
                            <TextField
                                id="outlined-size-small"
                                type="text"
                                name="firstname"
                                placeholder="First Name"
                                size="small"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                fullWidth
                                value={formik.values.firstname}
                                error={formik.touched.firstname && Boolean(formik.errors.firstname)}
                                sx={{ mb: 1, '& input': { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' } } }}
                            />
                            <FormHelperText sx={{ minHeight: "10px" }} error>
                                {formik.touched.firstname && formik.errors.firstname}
                            </FormHelperText>

                            <FormLabel sx={{ color: '#ccc' }}>Last Name </FormLabel>
                            <TextField
                                id="outlined-size-small"
                                type="text"
                                name="lastname"
                                placeholder="Last Name"
                                size="small"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                fullWidth
                                value={formik.values.lastname}
                                error={formik.touched.lastname && Boolean(formik.errors.lastname)}
                                sx={{ mb: 1, '& input': { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' } } }}
                            />
                            <FormHelperText sx={{ minHeight: "10px" }} error>
                                {formik.touched.lastname && formik.errors.lastname}
                            </FormHelperText>


                            <FormLabel sx={{ color: '#ccc' }}>Email *</FormLabel>
                            <TextField
                                id="outlined-size-small"
                                fullWidth
                                type="email"
                                name="email"
                                placeholder="Email"
                                size="small"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                sx={{ mb: 1, '& input': { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' } } }}
                            />
                            <FormHelperText sx={{ minHeight: "10px" }} error>
                                {formik.touched.email && formik.errors.email}
                            </FormHelperText>

                            <FormLabel sx={{ color: '#ccc' }}>Message *</FormLabel>
                            <TextField
                                name="message"
                                type="text"
                                placeholder="Enter your message"
                                fullWidth
                                size="small"
                                multiline
                                minRows={2}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.message}
                                error={formik.touched.message && Boolean(formik.errors.message)}
                                sx={{ mb: 1, '& textarea': { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' } } }}
                            />
                            <FormHelperText sx={{ minHeight: "10px" }} error>
                                {formik.touched.message && formik.errors.message}
                            </FormHelperText>
                        </dl>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={!formik.isValid || loading}
                            sx={{ backgroundColor: '#00ACC1', '&:hover': { backgroundColor: '#00838F' } }}
                        >
                            {loading ? "Sending..." : "Subscribe"}
                        </Button>


                    </form>

                    {/* Socials icons */}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 3, justifyContent: { xs: 'flex-start', md: 'flex-start' } }}>
                        <IconButton href="https://www.facebook.com/people/Octotech-creations/100063945101191/" target="_blank">
                            <FacebookIcon sx={{ color: 'rgba(77, 84, 87,1)' }} />
                        </IconButton>
                        <IconButton href="https://www.youtube.com/@OCTOTECHCREATIONS" target="_blank">
                            <YouTubeIcon sx={{ color: 'rgba(77, 84, 87,1)' }} />
                        </IconButton>
                        <IconButton href="https://www.instagram.com/octotech_creations" target="_blank">
                            <InstagramIcon sx={{ color: 'rgba(77, 84, 87,1)' }} />
                        </IconButton>
                    </Box>



                </Box>
            </Box>

            <Box sx={{ width: "100%", display: "flex", flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #333', mt: 4, pt: 3 }} p={1}>
                {/* Internal navigation links */}

                <Typography variant="h6" color='rgba(77, 84, 87,1)' fontSize="12px" sx={{ mb: { xs: 2, md: 0 }, textAlign: 'center' }}>
                    &copy; {new Date().getFullYear()} Octotech Creation. All rights reserved. | v{version} | Developed by Gannoj Bhanu Charan
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Link href="/terms" style={{ textDecoration: 'none' }}>
                        <Typography variant="h6" fontSize="12px" color='rgba(77, 84, 87,1)' sx={{ '&:hover': { color: '#00ACC1' } }}>Terms</Typography>
                    </Link>
                    <Link href="/privacy-policy" style={{ textDecoration: 'none' }}>
                        <Typography variant="h6" fontSize="12px" color='rgba(77, 84, 87,1)' sx={{ '&:hover': { color: '#00ACC1' } }}>Privacy Policy</Typography>
                    </Link>
                    <Typography variant="h6" fontSize="12px" color='rgba(77, 84, 87,1)'>License Agreement</Typography>
                </Box>
            </Box>

        </Box>
    )
}

export default footer
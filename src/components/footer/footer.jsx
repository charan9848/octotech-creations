import { Box, Button, FormHelperText, FormLabel, TextField, Typography, IconButton } from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import Link from "next/link";
import * as yup from "yup";
import { useState } from "react";
import { toast } from "react-hot-toast";

import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';


const footer = () => {
    const [loading, setLoading] = useState(false);

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
        <Box sx={{ backgroundColor: '#0B1113', display: "flex", flexWrap: 'wrap', flexDirection: { xs: "column", sm: "column", md: "row" } }} p={5} >
            <Box sx={{ width: { md: "22%", sm: "45%", xs: "75%" }, padding: "20px" }} >
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
                        }}
                    >
                        OCTOTECH
                    </Typography>
                </Box>

                <Box p={2}>
                    <Typography variant="h6" sx={{ fontSize: { md: '14px', xs: '12px', sm: "12px" }, color: '#78838D' }}>Octotech Creation is your ultimate destination for high-quality VFX, 2D/3D editing, and Photoshop resources. VFX can be complex, but with our creative expertise and powerful library, achieving stunning visual results becomes fast, professional, and effortless!</Typography>
                </Box>
            </Box>
            <Box sx={{ width: { md: "40%", sm: "70%", xs: '95%' }, display: "flex", justifyContent: 'space-around' }} p={3}>
                {
                    octotechInfo.map(infos => (
                        <Box key={infos.id} p={2}>
                            <Typography variant="body1" my={2}>{infos.title.toUpperCase()}</Typography>
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
            <Box sx={{ width: { md: "30%", sm: "50%", xs: '100%' }, display: "flex", justifyContent: 'space-between' }} p={1}>

                <Box sx={{ display: 'flex', justifyContent: "center", alignItems: 'center', maxWidth: '100' }}>
                    <Box p={4} mt={1} sx={{ height: '100', width: '100', borderRadius: '8px' }}>

                        <Box mb={2} >
                            <Typography variant="body1" mb={1} >CONNECT WITH US</Typography>
                            <Typography variant="h6" color='#78838D' fontSize="14px">Stay updated with Octotech news, offers, and promotions.</Typography>
                        </Box>

                        <form onSubmit={formik.handleSubmit}>
                            <dl>
                                <FormLabel>First Name *</FormLabel>
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
                                />
                                <FormHelperText sx={{ minHeight: "10px" }} error>
                                    {formik.touched.firstname && formik.errors.firstname}
                                </FormHelperText>

                                <FormLabel>Last Name </FormLabel>
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
                                />
                                <FormHelperText sx={{ minHeight: "10px" }} error>
                                    {formik.touched.lastname && formik.errors.lastname}
                                </FormHelperText>


                                <FormLabel>Email *</FormLabel>
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
                                />
                                <FormHelperText sx={{ minHeight: "10px" }} error>
                                    {formik.touched.email && formik.errors.email}
                                </FormHelperText>

                                <FormLabel>Message *</FormLabel>
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
                            >
                                {loading ? "Sending..." : "Subscribe"}
                            </Button>


                        </form>

                        {/* Socials icons */}

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 3, }}>
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
            </Box>

            <Box sx={{ width: { md: "100%", sm: "100%", xs: '100%' }, display: "flex", justifyContent: { md: 'space-between', xs: 'center' }, alignItems: 'center', flexWrap: 'wrap' }} p={1}>
                {/* Internal navigation links */}

                <Typography variant="h6" color='rgba(77, 84, 87,1)' fontSize="12px">
                    &copy; {new Date().getFullYear()} Octotech Creation. All rights reserved.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="h6" fontSize="12px" color='rgba(77, 84, 87,1)'>Terms</Typography>
                    <Typography variant="h6" fontSize="12px" color='rgba(77, 84, 87,1)'>Privacy Policy</Typography>
                    <Typography variant="h6" fontSize="12px" color='rgba(77, 84, 87,1)'>License Agreement</Typography>
                </Box>
            </Box>

        </Box>
    )
}

export default footer
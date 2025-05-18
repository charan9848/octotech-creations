"use client";
import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';
import { Box, Typography } from '@mui/material';
import { Button, CircularProgress, FormHelperText, FormLabel, Snackbar, TextField } from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import * as yup from "yup";
import React from 'react'
import Link from 'next/link';

const Contact = () => {

    const [loading, setLoading] = useState(false);



    const validationSchema = yup.object({
        firstname: yup.string().required('First name is required').min(4, 'First name must be at least 4 characters').max(20, 'First name must be at most 20 characters'),
        lastname: yup.string(),
        email: yup.string().email('Invalid email').required('Email is required'),
        message: yup.string().required('Message is required'),

    });

    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            email: '',
            message: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (artist) => {
            setLoading(true);
            try {
                const response = await axios.post(``, artist, {

                });

                // Show success toast
                toast.success("Login Successful!");

                // Navigate to dashboard
                setTimeout(() => {
                    navigate("/artist-dashboard");
                }, 3000);
            } catch (error) {
                console.error('Login error:', error);

                // Show error toast
                toast.error(error.response?.data?.message || "Login failed. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    });
    return (
        <Box
            sx={{
                backgroundColor: '#15191c',
                display: "flex",
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                alignItems: 'center',
                flexDirection: { xs: "column", sm: "column", md: "row" },
            }}
            p={5}>

            <Box
                p={4}
                mt={3}
                sx={{
                    height: 'auto',
                    width: '100',
                    borderRadius: '8px',
                }}
            >
                <Box>
                    <motion.div
                        variants={fadeIn('right', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.7 }}>
                        <Typography variant="h4" color="white" mb={1}>
                            Contact Us
                        </Typography>

                        <Typography
                            variant="body2"
                            color="#78838D"
                            mb={1}
                            fontSize="14px"
                        >
                            We are here to help you with any questions or concerns you may have.
                        </Typography>
                    </motion.div>
                </Box>
                <motion.div 
                    variants={fadeIn('right', 0.4)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.7 }}>
                    <form onSubmit={formik.handleSubmit}>
                        <FormLabel>First name *</FormLabel>
                        <TextField
                            name="firstname"
                            type="text"
                            placeholder="Enter your first name"
                            fullWidth
                            size="small"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.firstname && Boolean(formik.errors.firstname)}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.firstname && formik.errors.firstname}
                        </FormHelperText>
                        <FormLabel>Last name (Optional)</FormLabel>
                        <TextField
                            name="lastname"
                            type="text"
                            placeholder="Enter your last name"
                            fullWidth
                            size="small"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.lastname && Boolean(formik.errors.lastname)}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.lastname && formik.errors.lastname}
                        </FormHelperText>
                        <FormLabel>Email *</FormLabel>
                        <TextField
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            fullWidth
                            size="small"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.email && formik.errors.email}
                        </FormHelperText>
                        <FormLabel>Message</FormLabel>
                        <TextField
                            name="message"
                            type="text"
                            placeholder="Enter your message"
                            fullWidth
                            size="small"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.message && Boolean(formik.errors.message)}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.message && formik.errors.message}
                        </FormHelperText>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={!formik.isValid || loading}
                            startIcon={
                                loading ? <CircularProgress size={20} color="inherit" /> : null
                            }
                        >
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </form>
                </motion.div>
            </Box>
            <Box sx={{ width: "40%", display: { xs: "none", md: 'flex' }, alignItems: 'center' }}  >
                <Box
                    component="img"
                    src="https://www.actionvfx.com/img/home/artist.jpg"
                    alt="Artist"

                    sx={{
                        width: "100%", // Ensures the image takes the full width of the container
                        height: "auto", // Maintains the aspect ratio
                        borderRadius: "8px", // Adds rounded corners
                    }}
                />
            </Box>

        </Box>
    )
}

export default Contact;
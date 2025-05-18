"use client";

import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';
import { Box, Typography, Button, CircularProgress, FormHelperText, FormLabel, TextField } from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import * as yup from "yup";
import { toast, Toaster } from "react-hot-toast";
import React from 'react';

const ArtistRegister = () => {
    const [loading, setLoading] = useState(false);

    const validationSchema = yup.object({
        artistid: yup.string().required('Artist ID is required').min(4, 'User ID too short'),
        username: yup.string().required('Username is required').min(4, 'Username too short'),
        email: yup.string().email('Invalid email').required('Email is required'),
        password: yup.string()
            .required('Password is required')
            .min(8, 'Password is too short - should be 8 chars minimum.')
            .matches(/[A-Z]/, 'Password must contain at least one uppercase letter.')
            .matches(/[0-9]/, 'Password must contain at least one number.')
            .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character.'),
    });

    const formik = useFormik({
        initialValues: {
            artistid: '',
            username: '',
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                await axios.post(`/api/register-user`, values);
                toast.success("User Registered Successfully!");
               
            } catch (error) {
                toast.error(error.response?.data?.message || "Registration failed. Please try again.");
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
            p={5}
        >
            <Toaster position="top-center" reverseOrder={false} />
            <Box
                p={4}
                mt={3}
                sx={{
                     height: 'auto',
                    width: '100',
                    borderRadius: '8px'
                    
                }}
            >
                <Box>
                    <motion.div
                        variants={fadeIn('right', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.7 }}>
                        <Typography variant="h4" color="white" mb={1}>
                            Artist Register
                        </Typography>
                        <Typography
                            variant="body2"
                            color="#78838D"
                            mb={1}
                            fontSize="14px"
                        >
                            Register now to start your journey as an artist and share your creativity with the world.
                        </Typography>
                    </motion.div>
                </Box>
                <motion.div
                    variants={fadeIn('right', 0.4)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.7 }}>
                    <form onSubmit={formik.handleSubmit}>
                        <FormLabel>Artistid *</FormLabel>
                        <TextField
                            name="artistid"
                            type="text"
                            placeholder="Enter your user ID"
                            fullWidth
                            size="small"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.artistid && Boolean(formik.errors.artistid)}
                            value={formik.values.artistid}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.artistid && formik.errors.artistid}
                        </FormHelperText>

                        <FormLabel>Username *</FormLabel>
                        <TextField
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            fullWidth
                            size="small"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            value={formik.values.username}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.username && formik.errors.username}
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
                            value={formik.values.email}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.email && formik.errors.email}
                        </FormHelperText>

                        <FormLabel>Password *</FormLabel>
                        <TextField
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            fullWidth
                            size="small"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            value={formik.values.password}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.password && formik.errors.password}
                        </FormHelperText>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={!formik.isValid || loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{ mt: 2 }}
                        >
                            {loading ? "Registering..." : "Register"}
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
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                    }}
                />
            </Box>
        </Box>
    );
}

export default ArtistRegister;
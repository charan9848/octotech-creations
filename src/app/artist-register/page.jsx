"use client";

import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';
import { Box, Typography, Button, CircularProgress, FormHelperText, FormLabel, TextField, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import * as yup from "yup";
import { toast, Toaster } from "react-hot-toast";
import React from 'react';
import { useRouter } from "next/navigation";
import Link from 'next/link';

const ArtistRegister = () => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailChecking, setEmailChecking] = useState(false);
    const [artistIdChecking, setArtistIdChecking] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [artistIdAvailable, setArtistIdAvailable] = useState(null);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const router = useRouter();

    const handleClickShowPassword = () => setShowPassword((show) => !show); const validationSchema = yup.object({
        artistid: yup.string().required('Artist ID is required').min(4, 'User ID too short'),
        username: yup.string().required('Username is required').min(4, 'Username too short'),
        email: yup.string().email('Invalid email').required('Email is required'),
        phone: yup.string().required('Phone number is required').matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
        password: yup.string()
            .required('Password is required')
            .min(8, 'Password is too short - should be 8 chars minimum.')
            .matches(/[A-Z]/, 'Password must contain at least one uppercase letter.')
            .matches(/[0-9]/, 'Password must contain at least one number.')
            .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character.'),
    });    // Function to check email uniqueness
    const checkEmailUniqueness = async (email) => {
        if (!email || !yup.string().email().isValidSync(email)) {
            setEmailAvailable(null);
            return;
        }

        setEmailChecking(true);
        try {
            const response = await axios.post('/api/check-email', { email });
            setEmailAvailable(response.data.available);
        } catch (error) {
            console.error('Email check failed:', error);
            setEmailAvailable(null);
        } finally {
            setEmailChecking(false);
        }
    };

    // Function to check artistid uniqueness
    const checkArtistIdUniqueness = async (artistid) => {
        if (!artistid || artistid.length < 4) {
            setArtistIdAvailable(null);
            return;
        }

        setArtistIdChecking(true);
        try {
            const response = await axios.post('/api/check-artistid', { artistid });
            setArtistIdAvailable(response.data.available);
        } catch (error) {
            console.error('Artist ID check failed:', error);
            setArtistIdAvailable(null);
        } finally {
            setArtistIdChecking(false);
        }
    };    // Debounced validation
    const handleEmailChange = (e) => {
        formik.handleChange(e);
        const email = e.target.value;

        // Clear previous timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Set new timeout
        const newTimeout = setTimeout(() => {
            checkEmailUniqueness(email);
        }, 500);
        setDebounceTimeout(newTimeout);
    };

    const handleArtistIdChange = (e) => {
        formik.handleChange(e);
        const artistid = e.target.value;

        // Clear previous timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Set new timeout
        const newTimeout = setTimeout(() => {
            checkArtistIdUniqueness(artistid);
        }, 500);
        setDebounceTimeout(newTimeout);
    };

    const formik = useFormik({
        initialValues: {
            artistid: '',
            username: '',
            email: '',
            phone: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                await axios.post(`/api/register-artist`, values);
                toast.success("User Registered Successfully!");
                setTimeout(() => {
                    router.push("/artist-login");
                }, 3000);
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
                    <form onSubmit={formik.handleSubmit}>                        <FormLabel>Artistid *</FormLabel>
                        <TextField
                            name="artistid"
                            type="text"
                            placeholder="Enter your user ID"
                            fullWidth
                            size="small"
                            onChange={handleArtistIdChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.artistid && Boolean(formik.errors.artistid)}
                            value={formik.values.artistid}
                            InputProps={{
                                endAdornment: artistIdChecking ? (
                                    <CircularProgress size={16} />
                                ) : artistIdAvailable === false ? (
                                    <span style={{ color: 'red', fontSize: '12px' }}>❌</span>
                                ) : artistIdAvailable === true ? (
                                    <span style={{ color: 'green', fontSize: '12px' }}>✅</span>
                                ) : null
                            }}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.artistid && formik.errors.artistid}
                            {!formik.errors.artistid && artistIdAvailable === false && (
                                <span style={{ color: 'red' }}>Artist ID already exists</span>
                            )}
                            {!formik.errors.artistid && artistIdAvailable === true && (
                                <span style={{ color: 'green' }}>Artist ID is available</span>
                            )}
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
                        </FormHelperText>                        <FormLabel>Email *</FormLabel>
                        <TextField
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            fullWidth
                            size="small"
                            onChange={handleEmailChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            value={formik.values.email}
                            InputProps={{
                                endAdornment: emailChecking ? (
                                    <CircularProgress size={16} />
                                ) : emailAvailable === false ? (
                                    <span style={{ color: 'red', fontSize: '12px' }}>❌</span>
                                ) : emailAvailable === true ? (
                                    <span style={{ color: 'green', fontSize: '12px' }}>✅</span>
                                ) : null
                            }}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.email && formik.errors.email}
                            {!formik.errors.email && emailAvailable === false && (
                                <span style={{ color: 'red' }}>Email already exists</span>
                            )}
                            {!formik.errors.email && emailAvailable === true && (
                                <span style={{ color: 'green' }}>Email is available</span>
                            )}
                        </FormHelperText>

                        <FormLabel>Phone Number *</FormLabel>
                        <TextField
                            name="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            fullWidth
                            size="small"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                            value={formik.values.phone}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.phone && formik.errors.phone}
                        </FormHelperText>

                        <FormLabel>Password *</FormLabel>
                        <TextField
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            fullWidth
                            size="small"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            value={formik.values.password}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                        size="small"
                                        color="inherit"
                                    >
                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                ),
                            }}
                        />
                        <FormHelperText sx={{ minHeight: "10px" }} error>
                            {formik.touched.password && formik.errors.password}
                        </FormHelperText>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={
                                !formik.isValid ||
                                loading ||
                                emailAvailable === false ||
                                artistIdAvailable === false ||
                                emailChecking ||
                                artistIdChecking
                            }
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{ mt: 2 }}
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>
                        <Typography
                            variant="body1"
                            sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
                            color="#78838D"
                        >
                            <small>
                                Already have an account? <Link href="/artist-login">Login</Link>
                            </small>
                        </Typography>
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
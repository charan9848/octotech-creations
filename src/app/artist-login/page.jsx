'use client';
import { Box, Button, CircularProgress, FormHelperText, FormLabel, Snackbar, TextField, Typography, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useFormik } from "formik";
import { useState } from "react";


import * as yup from "yup";
import { toast } from "react-hot-toast";
import Link from "next/link";


const Artistlogin = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Add this state
 
  const router = useRouter();

    const validationSchema = yup.object({
        artistid: yup.string().required('Artist ID is required'),
        password: yup.string().required('Password is required'),
    });    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const res = await signIn("credentials", {
                redirect: false,
                artistid: values.artistid,
                password: values.password,
            });
            if (res.ok) {
                toast.success("Login Success");
                router.push("/artist-dashboard");
            } else {
                toast.error("Invalid credentials");
                setLoading(false); // Reset loading state on failed login
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An error occurred during login");
            setLoading(false); // Reset loading state on error
        }
    };

    const formik = useFormik({
        initialValues: {
            artistid: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: handleLogin
    });

    // Add this handler
    const handleClickShowPassword = () => setShowPassword((show) => !show);

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

            <Box
                p={4}
                mt={5}
                sx={{
                    height: 'auto',
                    width: '100',
                    borderRadius: '8px',
                    
                }}
            >
                <Box
                    sx={{
                        
                    }}
                >
                    <Typography variant="h4" color="white" mb={1}>
                        Artist Login
                    </Typography>
                    <Typography
                        variant="body2"
                        color="#78838D"
                        mb={1}
                        fontSize="14px"
                    >
                        Please enter your artistid and password to login to your account.
                    </Typography>
                </Box>
                <form onSubmit={formik.handleSubmit}>
                    <FormLabel>Artistid *</FormLabel>
                    <TextField
                        name="artistid"
                        type="text"
                        placeholder="Enter your artistid"
                        fullWidth
                        size="small"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.artistid && Boolean(formik.errors.artistid)}
                    />
                    <FormHelperText sx={{ minHeight: "10px" }} error>
                        {formik.touched.artistid && formik.errors.artistid}
                    </FormHelperText>
                    <FormLabel>Password</FormLabel>
                    <TextField
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        fullWidth
                        size="small"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                              size="small"
                              tabIndex={-1}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
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
                        disabled={!formik.isValid || loading}
                        startIcon={
                            loading ? <CircularProgress size={20} color="inherit" /> : null
                        }
                    >
                        {loading ? "Logging in..." : "Login"}
                    </Button>

                    <Typography
                        variant="body1"
                        sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
                        color="#78838D"
                    >
                        <small>
                            Don't have an account? <Link href="/artist-register">Register</Link>
                        </small>
                    </Typography>
                </form>

            </Box>
            <Box  sx={{ width: "40%", display:{xs:"none" ,md:'flex'}} }  mt={6} >
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
    );
}

export default Artistlogin;



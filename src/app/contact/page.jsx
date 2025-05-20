"use client";


import { motion } from 'framer-motion';
import { fadeIn } from '@/app/variants';
import { Box, Typography, TextField, Button, FormLabel, FormHelperText, CircularProgress } from '@mui/material';
import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import React from 'react';
import Link from 'next/link';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        // Replace '/api/contact' with your actual API endpoint
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
        mt={3}
        sx={{
          height: 'auto',
          width: '100',
          borderRadius: '8px',
        }}
      >
        <Box>
          {isClient && (
            <motion.div
              variants={fadeIn('right', 0.2)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.7 }}>
              <Typography variant="h1" color="white" mb={1}>
                Contact Us
              </Typography>
              <Typography
                variant="h2"
                color="#78838D"
                mb={1}
                fontSize="14px"
              >
                We are here to help you with any questions or concerns you may have.
              </Typography>
            </motion.div>
          )}
        </Box>
        {isClient && (
          <motion.div
            variants={fadeIn('right', 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.7 }}>
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
                value={formik.values.firstname}
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
                value={formik.values.lastname}
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
                minRows={3}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.message}
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
                sx={{ mt: 2 }}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
        )}
      </Box>
      <Box sx={{ width: "40%", display: { xs: "none", md: 'flex' }, alignItems: 'center' }}  >
        {isClient && (
          <motion.div  
            variants={fadeIn('left', 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.7 }}>
            <Box
              component="img"
              src="/OCTOTECH.svg"
              alt="Contact Octotech Creations"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
              }}
            />
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default Contact;
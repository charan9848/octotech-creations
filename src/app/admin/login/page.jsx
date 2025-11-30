"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert, 
  CircularProgress,
  InputAdornment,
  IconButton,
  Link as MuiLink
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        artistid: credentials.username,
        password: credentials.password,
      });

      if (result?.error) {
        setError('Invalid admin credentials');
        setLoading(false);
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#15191c',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #1a2027 0%, #0a0e12 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(50, 180, 222, 0.1)',
        filter: 'blur(80px)',
      }} />
      
      <Box sx={{
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'rgba(50, 180, 222, 0.05)',
        filter: 'blur(100px)',
      }} />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography component="h1" variant="h4" sx={{ color: '#32b4de', fontWeight: 'bold', letterSpacing: 1 }}>
                Admin Portal
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
                Sign in to manage your dashboard
              </Typography>
            </Box>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ width: '100%' }}
              >
                <Alert severity="error" sx={{ width: '100%', mb: 2, backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#ffcdd2', border: '1px solid rgba(211, 47, 47, 0.3)' }}>
                  {error}
                </Alert>
              </motion.div>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Admin Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={credentials.username}
                onChange={handleChange}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': { borderColor: '#32b4de' },
                    '&.Mui-focused fieldset': { borderColor: '#32b4de' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#32b4de' },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.5)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': { borderColor: '#32b4de' },
                    '&.Mui-focused fieldset': { borderColor: '#32b4de' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#32b4de' },
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 4,
                  mb: 2,
                  bgcolor: '#32b4de',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 14px 0 rgba(50, 180, 222, 0.39)',
                  '&:hover': { 
                    bgcolor: '#2a9ac0',
                    boxShadow: '0 6px 20px 0 rgba(50, 180, 222, 0.23)',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(50, 180, 222, 0.3)',
                    color: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Link href="/" passHref style={{ textDecoration: 'none' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: 'rgba(255,255,255,0.5)', 
                    transition: 'color 0.2s',
                    '&:hover': { color: '#32b4de' }
                  }}>
                    <ArrowBack sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2">Back to Home</Typography>
                  </Box>
                </Link>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

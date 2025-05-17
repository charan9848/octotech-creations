import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        appBar: {
            main: '#0b1013', 
        },
    },
    typography:{
       
        
    
        title: {
            fontFamily: '"Megabot Five", sans-serif', 
            fontSize: '20px', // Custom font size for title
            fontWeight: 600, // Bold font weight
            color: '#ffffff', // White color for the title
            letterSpacing: '0.3rem', // Add character spacing
        },
    },
    components: {
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    color: "#222", // or "black"
                    fontWeight: 600,
                },
            },
        },

        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: "#616161",
                        },
                        "&:hover fieldset": {
                            borderColor: "rgb(255, 255, 255)",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "rgb(0, 161, 224)",
                        },
                        backgroundColor: "rgb(11, 14, 20)",
                        color: "white",
                        borderRadius: "8px",
                    },
                },
            },
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: "hsl(0, 0.00%, 100.00%)",
                    "&.Mui-focused": {
                        color: "#311B92",
                    },
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.875rem",
                    marginBottom: "8px",
                    fontWeight: "400",
                },
            },
        },

        MuiTypography: {
            styleOverrides: {
                body1: {
                    textTransform: 'capitalize !important', // Force capitalization
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ffffff',
                },
                h3: {
                    fontFamily: '"Eurostile", sans-serif',
                    fontWeight: 1000,
                    fontSize: '44px',
                    textTransform: 'uppercase',
                    letterSpacing:'2.5px',
                    lineHeight:'44px',    
                },
                h4: {
                    fontFamily: '"Eurostile", sans-serif',
                    fontWeight: 1000,
                    fontSize: {
                        md: '44px', // Medium screens and up
                        sm: '36px', // Small screens
                        xs: '28px', // Extra-small screens
                    },
                    textTransform: 'uppercase',
                    letterSpacing:'2.5px',
                    lineHeight:'44px', 
                    WebkitTextStroke:"0.5px"   
                },
                h6: {
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#aeb4b4',
                    textTransform: 'none', // Force capitalization
                },
            
            },
        },
        MuiButton: {
            styleOverrides: {
                text: {
                    color: 'white', // Default color for text buttons
                    textTransform: 'none',
                    fontWeight: 510,
                    fontSize: '17px',
                },
                contained: {
                    backgroundColor: 'rgb(0, 161, 224)',
                    color: 'white',
                    fontFamily: '"Eurostile", sans-serif',
                    fontWeight: 700,
                    WebkitTextStroke: '0.1px white',
                    letterSpacing: '1px', // Add a black stroke to the text
                    // Responsive styles
                    padding: {
                        xs: '2px 6px', // Smaller padding for extra-small screens
                        sm: '8px 16px', // Small screens
                        md: '10px 20px', // Medium screens
                        lg: '12px 24px', // Large screens
                        xl: '14px 28px', // Extra-large screens
                    },
                    fontSize: {
                        xs: '8px', // Smaller font size for extra-small screens
                        sm: '14px', // Small screens
                        md: '16px', // Medium screens
                        lg: '18px', // Large screens
                        xl: '20px', // Extra-large screens
                    },
                    height: {
                        xs: '24px', // Smaller height for extra-small screens
                        sm: '36px', // Small screens
                        md: '40px', // Medium screens
                        lg: '44px', // Large screens
                        xl: '48px', // Extra-large screens
                    },
                },
                outlined: {
                    color: 'rgb(0, 161, 224)',
                    borderColor: 'white',
                    backgroundColor:"white",
                    fontFamily: '"Eurostile", sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    WebkitTextStroke: '0.1px rgb(0, 161, 224)',
                    letterSpacing:'1px', // Add a black stroke to the text
                    '&:hover': {
                        backgroundColor: 'rgb(0, 161, 224)',
                        color: 'white',
                        borderColor: 'white',
                        WebkitTextStroke: '0.1px white',
                    },
                },
            },
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: '#32b4de', // Apply custom color to all icons
                    fontSize: '20px', // Custom size for all icons
                },
            },
        },
    },
});

export default theme;
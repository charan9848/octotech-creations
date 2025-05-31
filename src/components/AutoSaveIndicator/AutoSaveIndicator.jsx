import { Box, Typography, Button } from "@mui/material";
import { Save as SaveIcon, CheckCircle as CheckIcon } from "@mui/icons-material";

const AutoSaveIndicator = ({ 
  hasSavedData, 
  clearSavedData, 
  onManualSave,
  showKeyboardShortcut = true 
}) => {
  return (
    <>
      {/* Auto-save status info */}
      {showKeyboardShortcut && (
        <Typography 
          component="span" 
          sx={{ 
            color: "#00a1e0", 
            fontSize: "12px",
            fontStyle: "italic",
            display: "block",
            mb: 2
          }}
        >
          <SaveIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
          Auto-save enabled • Press Ctrl+S to save manually
        </Typography>
      )}

      {/* Draft data indicator */}
      {hasSavedData && (
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          backgroundColor: "#2d4a22", 
          borderRadius: 1,
          border: "1px solid #4caf50"
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: "#81c784", 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            }}
          >
            <CheckIcon sx={{ fontSize: 16 }} />
            Draft data available from previous session
            <Button 
              size="small" 
              onClick={clearSavedData}
              sx={{ 
                ml: 'auto', 
                color: "#81c784", 
                textDecoration: 'underline',
                fontSize: '12px',
                minWidth: 'auto',
                p: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Clear Draft
            </Button>
          </Typography>
        </Box>
      )}
    </>
  );
};

export default AutoSaveIndicator;

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  IconButton,
  Paper,
  InputAdornment,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
  SupportAgent as SupportIcon,
  DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';

export default function ArtistChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        // Mark messages as read
        await fetch('/api/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = async () => {
    try {
      await fetch('/api/messages', { method: 'DELETE' });
      setMessages([]);
      setClearDialogOpen(false);
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(fetchMessages, 3000);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
             d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress sx={{ color: '#32b4de' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#fff' }}>
        Chat with Admin
      </Typography>

      <Card sx={{ 
        height: 'calc(100vh - 200px)', 
        bgcolor: '#1a2027', 
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Chat Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar sx={{ bgcolor: '#32b4de', width: 45, height: 45 }}>
            <SupportIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
              Octotech Admin Support
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              We typically reply within a few hours
            </Typography>
          </Box>
          {messages.length > 0 && (
            <Tooltip title="Clear all messages">
              <IconButton 
                onClick={() => setClearDialogOpen(true)}
                size="small"
                sx={{ color: 'rgba(244, 67, 54, 0.7)', '&:hover': { color: '#f44336', bgcolor: 'rgba(244, 67, 54, 0.1)' } }}
              >
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Messages */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 }
        }}>
          {messages.length === 0 ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1 }}>
                  Welcome to Octotech Support!
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                  Send a message to start a conversation with our admin team.
                </Typography>
              </Box>
            </Box>
          ) : (
            messages.map((msg, index) => (
              <Box
                key={msg._id || index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.senderType === 'artist' ? 'flex-end' : 'flex-start',
                  mb: 0.5
                }}
              >
                {msg.senderType === 'admin' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: '#32b4de', 
                      width: 32, 
                      height: 32, 
                      mr: 1,
                      alignSelf: 'flex-end'
                    }}
                  >
                    <SupportIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 1.5,
                    px: 2,
                    maxWidth: '70%',
                    bgcolor: msg.senderType === 'artist' ? '#32b4de' : 'rgba(255,255,255,0.08)',
                    borderRadius: msg.senderType === 'artist' 
                      ? '16px 16px 4px 16px' 
                      : '16px 16px 16px 4px'
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#fff', wordBreak: 'break-word' }}>
                    {msg.message}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: msg.senderType === 'artist' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
                      display: 'block',
                      textAlign: 'right',
                      mt: 0.5
                    }}
                  >
                    {formatTime(msg.createdAt)}
                  </Typography>
                </Paper>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    sx={{ 
                      color: newMessage.trim() ? '#32b4de' : 'rgba(255,255,255,0.3)',
                      '&:hover': { bgcolor: 'rgba(50, 180, 222, 0.1)' }
                    }}
                  >
                    {sending ? <CircularProgress size={24} sx={{ color: '#32b4de' }} /> : <SendIcon />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.1)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#32b4de'
                }
              }
            }}
          />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mt: 1, textAlign: 'center' }}>
            Press Enter to send • Shift+Enter for new line
          </Typography>
        </Box>
      </Card>

      {/* Clear Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1a2027', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <DialogTitle sx={{ color: '#f44336', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteSweepIcon /> Clear Chat History
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to delete all your messages? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setClearDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Cancel
          </Button>
          <Button onClick={clearMessages} variant="contained" color="error">
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

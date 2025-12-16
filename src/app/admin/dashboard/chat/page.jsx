'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Paper,
  InputAdornment,
  CircularProgress,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  DeleteSweep as DeleteSweepIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export default function AdminChatPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [allArtists, setAllArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [clearConvoDialogOpen, setClearConvoDialogOpen] = useState(false);
  const [initialArtistLoaded, setInitialArtistLoaded] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllArtists = useCallback(async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data && Array.isArray(data)) {
        setAllArtists(data
          .filter(a => a && a.artistid) // Filter out invalid entries
          .map(a => ({
            artistId: a.artistid || '',
            artistName: a.username || 'Unknown Artist',
            artistImage: a.profileImage || null
          })));
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  }, []);

  const fetchMessages = useCallback(async (artistId) => {
    try {
      const res = await fetch(`/api/messages?artistId=${artistId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        // Mark messages as read
        await fetch('/api/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artistId })
        });
        // Refresh conversations to update unread count
        fetchConversations();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
    fetchAllArtists();
  }, [fetchConversations, fetchAllArtists]);

  // Handle URL params - auto-select artist when coming from Artists page
  useEffect(() => {
    if (!initialArtistLoaded && allArtists.length > 0) {
      const artistId = searchParams.get('artistId');
      const artistName = searchParams.get('artistName');
      
      if (artistId) {
        // Find artist from allArtists or create a minimal object
        const existingArtist = allArtists.find(a => a.artistId === artistId);
        if (existingArtist) {
          setSelectedArtist(existingArtist);
        } else {
          // Create minimal artist object if not found in list
          setSelectedArtist({
            artistId: artistId,
            artistName: artistName ? decodeURIComponent(artistName) : 'Artist',
            artistImage: null
          });
        }
        setInitialArtistLoaded(true);
      }
    }
  }, [searchParams, allArtists, initialArtistLoaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedArtist) {
      fetchMessages(selectedArtist.artistId);
      // Poll for new messages every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedArtist.artistId);
      }, 3000);
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedArtist, fetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedArtist) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: selectedArtist.artistId,
          message: newMessage.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        fetchMessages(selectedArtist.artistId);
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

  const handleClearAllMessages = async () => {
    try {
      const res = await fetch('/api/messages?clearAll=true', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setConversations([]);
        setMessages([]);
        setSelectedArtist(null);
        setClearAllDialogOpen(false);
      }
    } catch (error) {
      console.error('Error clearing all messages:', error);
    }
  };

  const handleClearConversation = async () => {
    if (!selectedArtist) return;
    try {
      const res = await fetch(`/api/messages?artistId=${selectedArtist.artistId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessages([]);
        setSelectedArtist(null);
        fetchConversations();
        setClearConvoDialogOpen(false);
      }
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  // When searching, show matching artists from all artists list
  // When not searching, show only conversations (artists who have chatted)
  const getDisplayList = () => {
    if (searchQuery.trim()) {
      // Search through all artists
      const filtered = allArtists.filter(a => {
        const name = a.artistName || '';
        const id = a.artistId || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               id.toLowerCase().includes(searchQuery.toLowerCase());
      });
      // Add conversation data if exists
      return filtered.map(artist => {
        const convo = conversations.find(c => c.artistId === artist.artistId);
        return {
          ...artist,
          lastMessage: convo?.lastMessage || null,
          lastMessageTime: convo?.lastMessageTime || null,
          lastSenderType: convo?.lastSenderType || null,
          unreadCount: convo?.unreadCount || 0,
          hasConversation: !!convo
        };
      });
    }
    // No search - show conversations only
    return conversations;
  };

  const displayList = getDisplayList();

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress sx={{ color: '#2196f3' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#fff' }}>
          Chat with Artists
        </Typography>
        {conversations.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DeleteSweepIcon />}
            onClick={() => setClearAllDialogOpen(true)}
            sx={{
              color: '#f44336',
              borderColor: 'rgba(244, 67, 54, 0.5)',
              '&:hover': { borderColor: '#f44336', bgcolor: 'rgba(244, 67, 54, 0.1)' }
            }}
          >
            Clear All Chats
          </Button>
        )}
      </Box>

      <Grid container spacing={2} sx={{ height: 'calc(100vh - 180px)' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: '#1a2027', 
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.1)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2196f3'
                    }
                  }
                }}
              />
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
            <List sx={{ 
              flex: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 }
            }}>
              {displayList.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <ChatIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {searchQuery ? 'No artists found' : 'No conversations yet'}
                  </Typography>
                  {!searchQuery && (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mt: 1 }}>
                      Search for an artist to start chatting
                    </Typography>
                  )}
                </Box>
              ) : (
                displayList.map((conv) => (
                  <ListItem
                    key={conv.artistId}
                    button
                    onClick={() => setSelectedArtist(conv)}
                    sx={{
                      bgcolor: selectedArtist?.artistId === conv.artistId ? 'rgba(33, 150, 243, 0.15)' : 'transparent',
                      borderLeft: selectedArtist?.artistId === conv.artistId ? '3px solid #2196f3' : '3px solid transparent',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge 
                        badgeContent={conv.unreadCount || 0} 
                        color="error"
                        invisible={!conv.unreadCount}
                        sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 18, minWidth: 18 } }}
                      >
                        <Avatar 
                          src={conv.artistImage} 
                          sx={{ bgcolor: '#2196f3' }}
                        >
                          {conv.artistName[0]?.toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: conv.unreadCount > 0 ? 600 : 400 }}>
                          {conv.artistName}
                        </Typography>
                      }
                      secondary={
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'rgba(255,255,255,0.5)',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {conv.lastMessage 
                            ? `${conv.lastSenderType === 'admin' ? 'You: ' : ''}${conv.lastMessage}`
                            : (searchQuery ? 'Start a new conversation' : '')}
                        </Typography>
                      }
                    />
                    {conv.lastMessageTime && (
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        {formatTime(conv.lastMessageTime)}
                      </Typography>
                    )}
                  </ListItem>
                ))
              )}
            </List>
          </Card>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: '#1a2027', 
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {selectedArtist ? (
              <>
                {/* Chat Header */}
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <IconButton 
                    sx={{ display: { md: 'none' }, color: '#fff' }}
                    onClick={() => setSelectedArtist(null)}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Avatar 
                    src={selectedArtist.artistImage} 
                    sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}
                  >
                    {selectedArtist.artistName[0]?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                      {selectedArtist.artistName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Artist ID: {selectedArtist.artistId}
                    </Typography>
                  </Box>
                  <Tooltip title="Clear this conversation">
                    <IconButton 
                      onClick={() => setClearConvoDialogOpen(true)}
                      sx={{ color: 'rgba(244, 67, 54, 0.7)', '&:hover': { color: '#f44336', bgcolor: 'rgba(244, 67, 54, 0.1)' } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
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
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          No messages yet. Start the conversation!
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    messages.map((msg, index) => (
                      <Box
                        key={msg._id || index}
                        sx={{
                          display: 'flex',
                          justifyContent: msg.senderType === 'admin' ? 'flex-end' : 'flex-start',
                          mb: 0.5
                        }}
                      >
                        <Paper
                          sx={{
                            p: 1.5,
                            px: 2,
                            maxWidth: '70%',
                            bgcolor: msg.senderType === 'admin' ? '#2196f3' : 'rgba(255,255,255,0.08)',
                            borderRadius: msg.senderType === 'admin' 
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
                              color: msg.senderType === 'admin' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
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
                    placeholder="Type a message..."
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
                              color: newMessage.trim() ? '#2196f3' : 'rgba(255,255,255,0.3)',
                              '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' }
                            }}
                          >
                            {sending ? <CircularProgress size={24} sx={{ color: '#2196f3' }} /> : <SendIcon />}
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
                          borderColor: '#2196f3'
                        }
                      }
                    }}
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2
              }}>
                <ChatIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.1)' }} />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Select a conversation to start chatting
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Clear All Messages Dialog */}
      <Dialog
        open={clearAllDialogOpen}
        onClose={() => setClearAllDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1a2027', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <DialogTitle sx={{ color: '#f44336' }}>Clear All Chats</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to delete ALL chat messages with ALL artists? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setClearAllDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Cancel
          </Button>
          <Button onClick={handleClearAllMessages} variant="contained" color="error">
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Conversation Dialog */}
      <Dialog
        open={clearConvoDialogOpen}
        onClose={() => setClearConvoDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1a2027', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <DialogTitle sx={{ color: '#f44336' }}>Clear Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to delete all messages with {selectedArtist?.artistName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setClearConvoDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Cancel
          </Button>
          <Button onClick={handleClearConversation} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

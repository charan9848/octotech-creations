"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, TextField, TablePagination, InputAdornment, TableSortLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from 'react-hot-toast';
import { downloadCSV } from '@/lib/exportUtils';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [editForm, setEditForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    message: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('firstname');

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (error) {
      console.error("Failed to fetch contacts", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Custom sort to keep unread items at the top
  const sortedContacts = stableSort(filteredContacts, (a, b) => {
    // If one is unread and the other is read, unread comes first
    if (a.read === false && b.read !== false) return -1;
    if (a.read !== false && b.read === false) return 1;
    
    // Otherwise sort by the selected column
    return getComparator(order, orderBy)(a, b);
  });

  const paginatedContacts = sortedContacts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDeleteClick = (contact) => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = async (contact) => {
    setSelectedContact(contact);
    setEditForm({
      firstname: contact.firstname || '',
      lastname: contact.lastname || '',
      email: contact.email || '',
      message: contact.message || ''
    });
    setEditDialogOpen(true);

    // Mark as read if not already
    if (contact.read === false) {
      try {
        await fetch('/api/admin/contacts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: contact._id, read: true })
        });
        // Update local state
        setContacts(prev => prev.map(c => c._id === contact._id ? { ...c, read: true } : c));
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
  };

  const handleEditSave = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/contacts?id=${selectedContact._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        toast.success("Contact updated successfully");
        fetchContacts();
        setEditDialogOpen(false);
      } else {
        toast.error("Failed to update contact");
      }
    } catch (error) {
      console.error("Update error", error);
      toast.error("Error updating contact");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContact) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/contacts?id=${selectedContact._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("Contact deleted successfully");
        fetchContacts();
      } else {
        toast.error("Failed to delete contact");
      }
    } catch (error) {
      console.error("Delete error", error);
      toast.error("Error deleting contact");
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setSelectedContact(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#32b4de' }} />
      </Box>
    );
  }

  const handleExport = () => {
    const dataToExport = filteredContacts.map(({ _id, ...rest }) => rest);
    downloadCSV(dataToExport, 'contacts_export.csv');
    toast.success("Export started");
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Contact Messages
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          sx={{ bgcolor: '#32b4de', '&:hover': { bgcolor: '#2a9ac0' } }}
        >
          Export CSV
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by Name, Email or Message..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
              </InputAdornment>
            ),
            sx: {
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.05)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.1)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.2)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#32b4de',
              },
            },
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1a2027', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="contacts table">
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>S.No</TableCell>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'firstname'}
                  direction={orderBy === 'firstname' ? order : 'asc'}
                  onClick={(event) => handleRequestSort(event, 'firstname')}
                  sx={{
                    '&.MuiTableSortLabel-root': { color: '#32b4de' },
                    '&.MuiTableSortLabel-root:hover': { color: '#32b4de' },
                    '&.Mui-active': { color: '#32b4de' },
                    '& .MuiTableSortLabel-icon': { color: '#32b4de !important' },
                  }}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={(event) => handleRequestSort(event, 'email')}
                  sx={{
                    '&.MuiTableSortLabel-root': { color: '#32b4de' },
                    '&.MuiTableSortLabel-root:hover': { color: '#32b4de' },
                    '&.Mui-active': { color: '#32b4de' },
                    '& .MuiTableSortLabel-icon': { color: '#32b4de !important' },
                  }}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'createdAt'}
                  direction={orderBy === 'createdAt' ? order : 'asc'}
                  onClick={(event) => handleRequestSort(event, 'createdAt')}
                  sx={{
                    '&.MuiTableSortLabel-root': { color: '#32b4de' },
                    '&.MuiTableSortLabel-root:hover': { color: '#32b4de' },
                    '&.Mui-active': { color: '#32b4de' },
                    '& .MuiTableSortLabel-icon': { color: '#32b4de !important' },
                  }}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>Message</TableCell>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedContacts.map((contact, index) => (
              <TableRow
                key={contact._id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 }, 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  bgcolor: contact.read === false ? 'rgba(50, 180, 222, 0.1)' : 'transparent',
                  transition: 'background-color 0.3s'
                }}
              >
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  {contact.read === false && <span style={{ color: '#32b4de', marginRight: 8, fontWeight: 'bold' }}>●</span>}
                  {page * rowsPerPage + index + 1}
                </TableCell>
                <TableCell component="th" scope="row" sx={{ color: 'white', fontWeight: contact.read === false ? 'bold' : 'normal' }}>
                  {contact.firstname} {contact.lastname}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: contact.read === false ? 'bold' : 'normal' }}>{contact.email}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{formatDate(contact.createdAt)}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {contact.message}
                </TableCell>
                <TableCell>
                  <IconButton 
                    aria-label="edit" 
                    onClick={() => handleEditClick(contact)}
                    sx={{ color: '#32b4de', mr: 1, '&:hover': { bgcolor: 'rgba(50, 180, 222, 0.1)' } }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    aria-label="delete" 
                    onClick={() => handleDeleteClick(contact)}
                    sx={{ color: '#ef5350', '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.1)' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 3 }}>
                  No messages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredContacts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: 'white',
            '.MuiTablePagination-selectIcon': { color: 'white' },
            '.MuiTablePagination-actions': { color: 'white' },
          }}
        />
      </TableContainer>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a2027',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#32b4de' }}>Edit Message</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="First Name"
              type="text"
              fullWidth
              variant="outlined"
              value={editForm.firstname}
              onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Last Name"
              type="text"
              fullWidth
              variant="outlined"
              value={editForm.lastname}
              onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Box>
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editForm.message}
            onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }} disabled={actionLoading}>
            Cancel
          </Button>
          <Button onClick={handleEditSave} sx={{ color: '#32b4de' }} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a2027',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#ef5350' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to delete this contact from <strong>{selectedContact?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }} disabled={actionLoading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} sx={{ color: '#ef5350' }} autoFocus disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

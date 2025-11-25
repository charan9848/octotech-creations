"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Alert, TextField, TablePagination, InputAdornment, TableSortLabel } from '@mui/material';
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

export default function AdminArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('username');

  const fetchArtists = async () => {
    try {
      const res = await fetch('/api/admin/artists');
      if (res.ok) {
        const data = await res.json();
        setArtists(data);
      }
    } catch (error) {
      console.error("Failed to fetch artists", error);
      toast.error("Failed to load artists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
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

  const filteredArtists = artists.filter((artist) =>
    artist.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.artistid?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedArtists = stableSort(filteredArtists, getComparator(order, orderBy));

  const paginatedArtists = sortedArtists.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDeleteClick = (artist) => {
    setSelectedArtist(artist);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (artist) => {
    setSelectedArtist(artist);
    setEditForm({
      username: artist.username || '',
      email: artist.email || ''
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/artists?id=${selectedArtist._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        toast.success("Artist updated successfully");
        fetchArtists();
        setEditDialogOpen(false);
      } else {
        toast.error("Failed to update artist");
      }
    } catch (error) {
      console.error("Update error", error);
      toast.error("Error updating artist");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedArtist) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/artists?id=${selectedArtist._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("Artist deleted successfully");
        fetchArtists();
      } else {
        toast.error("Failed to delete artist");
      }
    } catch (error) {
      console.error("Delete error", error);
      toast.error("Error deleting artist");
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setSelectedArtist(null);
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
    const dataToExport = filteredArtists.map(({ _id, password, ...rest }) => rest);
    downloadCSV(dataToExport, 'artists_export.csv');
    toast.success("Export started");
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Manage Artists
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
          placeholder="Search by Name, Email or ID..."
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
        <Table sx={{ minWidth: 650 }} aria-label="artists table">
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>S.No</TableCell>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'artistid'}
                  direction={orderBy === 'artistid' ? order : 'asc'}
                  onClick={(event) => handleRequestSort(event, 'artistid')}
                  sx={{
                    '&.MuiTableSortLabel-root': { color: '#32b4de' },
                    '&.MuiTableSortLabel-root:hover': { color: '#32b4de' },
                    '&.Mui-active': { color: '#32b4de' },
                    '& .MuiTableSortLabel-icon': { color: '#32b4de !important' },
                  }}
                >
                  Artist ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'username'}
                  direction={orderBy === 'username' ? order : 'asc'}
                  onClick={(event) => handleRequestSort(event, 'username')}
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
                  Joined Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedArtists.map((artist, index) => (
              <TableRow
                key={artist._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}
              >
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  {page * rowsPerPage + index + 1}
                </TableCell>
                <TableCell component="th" scope="row" sx={{ color: 'white' }}>
                  {artist.artistid}
                </TableCell>
                <TableCell sx={{ color: 'white' }}>{artist.username}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{artist.email}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{formatDate(artist.createdAt)}</TableCell>
                <TableCell>
                  <IconButton 
                    aria-label="edit" 
                    onClick={() => handleEditClick(artist)}
                    sx={{ color: '#32b4de', mr: 1, '&:hover': { bgcolor: 'rgba(50, 180, 222, 0.1)' } }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    aria-label="delete" 
                    onClick={() => handleDeleteClick(artist)}
                    sx={{ color: '#ef5350', '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.1)' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredArtists.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 3 }}>
                  No artists found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredArtists.length}
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
        <DialogTitle sx={{ color: '#32b4de' }}>Edit Artist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={editForm.username}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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
            Are you sure you want to delete artist <strong>{selectedArtist?.name}</strong>? This action cannot be undone.
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

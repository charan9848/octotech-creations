"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Alert, TextField, TablePagination, InputAdornment, TableSortLabel, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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
  const searchParams = useSearchParams();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: 'artist',
    password: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('username');
  
  // Role Management
  const [roles, setRoles] = useState([
    { value: 'artist', label: 'Artist' },
    { value: 'admin', label: 'Admin' },
    { value: 'vfx_artist', label: 'VFX Artist' },
    { value: '3d_artist', label: '3D Artist' },
    { value: 'animator', label: 'Animator' },
    { value: 'illustrator', label: 'Illustrator' }
  ]);
  const [newRoleDialogOpen, setNewRoleDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      const value = newRoleName.toLowerCase().replace(/\s+/g, '_');
      const label = newRoleName;
      // Check if already exists
      if (!roles.some(r => r.value === value)) {
        setRoles([...roles, { value, label }]);
        setEditForm({ ...editForm, role: value });
        toast.success(`Role "${label}" added`);
      } else {
        toast.error("Role already exists");
      }
      setNewRoleDialogOpen(false);
      setNewRoleName('');
    }
  };

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
      email: artist.email || '',
      role: artist.role || 'artist',
      password: '' // Reset password field
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    setActionLoading(true);
    try {
      // Note: We are sending the ID in the body now, not query param, to match standard PUT practices
      // But the API route currently expects ID in body for PUT based on my read
      const res = await fetch(`/api/admin/artists`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedArtist._id,
          ...editForm
        }),
      });

      if (res.ok) {
        toast.success("Artist updated successfully");
        setEditDialogOpen(false);
        fetchArtists();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update artist");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An error occurred");
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
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>Role</TableCell>
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
                <TableCell sx={{ color: artist.role === 'admin' ? '#00ACC1' : 'rgba(255,255,255,0.7)', fontWeight: artist.role === 'admin' ? 'bold' : 'normal' }}>
                  {artist.role || 'artist'}
                </TableCell>
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
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="New Password (leave blank to keep current)"
            type="password"
            fullWidth
            variant="outlined"
            value={editForm.password}
            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel id="role-select-label" sx={{ color: 'rgba(255,255,255,0.7)' }}>Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              label="Role"
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#32b4de' },
                '.MuiSvgIcon-root': { color: 'white' }
              }}
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            size="small" 
            onClick={() => setNewRoleDialogOpen(true)} 
            sx={{ mt: 1, color: '#32b4de', textTransform: 'none' }}
          >
            + Add New Role
          </Button>
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

      {/* New Role Dialog */}
      <Dialog
        open={newRoleDialogOpen}
        onClose={() => setNewRoleDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a2027',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '300px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#32b4de' }}>Add New Role</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="e.g. Sound Designer"
            sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#32b4de' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#32b4de' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewRoleDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Cancel
          </Button>
          <Button onClick={handleAddRole} sx={{ color: '#32b4de' }}>
            Add
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

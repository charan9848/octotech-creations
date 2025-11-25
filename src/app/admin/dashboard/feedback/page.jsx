"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Rating, TextField, TablePagination, InputAdornment, TableSortLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
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

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [editForm, setEditForm] = useState({
    clientName: '',
    rating: 0,
    review: ''
  });
  const [addForm, setAddForm] = useState({
    clientName: '',
    rating: 5,
    review: '',
    artistId: 'Admin'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('clientName');

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/admin/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error("Failed to fetch feedback", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
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

  const filteredFeedback = feedback.filter((item) =>
    item.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.review?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artistId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFeedback = stableSort(filteredFeedback, getComparator(order, orderBy));

  const paginatedFeedback = sortedFeedback.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDeleteClick = (item) => {
    setSelectedFeedback(item);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (item) => {
    setSelectedFeedback(item);
    setEditForm({
      clientName: item.clientName,
      rating: item.rating,
      review: item.review || ''
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/feedback?id=${selectedFeedback._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        toast.success("Feedback updated successfully");
        fetchFeedback();
        setEditDialogOpen(false);
      } else {
        toast.error("Failed to update feedback");
      }
    } catch (error) {
      console.error("Update error", error);
      toast.error("Error updating feedback");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddClick = () => {
    setAddForm({
      clientName: '',
      rating: 5,
      review: '',
      artistId: 'Admin'
    });
    setAddDialogOpen(true);
  };

  const handleAddSave = async () => {
    if (!addForm.clientName || !addForm.review) {
      toast.error("Please fill in all required fields");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addForm),
      });

      if (res.ok) {
        toast.success("Feedback added successfully");
        fetchFeedback();
        setAddDialogOpen(false);
      } else {
        toast.error("Failed to add feedback");
      }
    } catch (error) {
      console.error("Add error", error);
      toast.error("Error adding feedback");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFeedback) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/feedback?id=${selectedFeedback._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("Feedback deleted successfully");
        fetchFeedback();
      } else {
        toast.error("Failed to delete feedback");
      }
    } catch (error) {
      console.error("Delete error", error);
      toast.error("Error deleting feedback");
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setSelectedFeedback(null);
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
    const dataToExport = filteredFeedback.map(({ _id, ...rest }) => rest);
    downloadCSV(dataToExport, 'feedback_export.csv');
    toast.success("Export started");
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Manage Feedback
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#43a047' } }}
          >
            Add Feedback
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ bgcolor: '#32b4de', '&:hover': { bgcolor: '#2a9ac0' } }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by Client Name, Review or Artist ID..."
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
        <Table sx={{ minWidth: 650 }} aria-label="feedback table">
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>S.No</TableCell>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'clientName'}
                  direction={orderBy === 'clientName' ? order : 'asc'}
                  onClick={(event) => handleRequestSort(event, 'clientName')}
                  sx={{
                    '&.MuiTableSortLabel-root': { color: '#32b4de' },
                    '&.MuiTableSortLabel-root:hover': { color: '#32b4de' },
                    '&.Mui-active': { color: '#32b4de' },
                    '& .MuiTableSortLabel-icon': { color: '#32b4de !important' },
                  }}
                >
                  Client Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#32b4de', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'artistId'}
                  direction={orderBy === 'artistId' ? order : 'asc'}
                  onClick={(event) => handleRequestSort(event, 'artistId')}
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
                  active={orderBy === 'rating'}
                  direction={orderBy === 'rating' ? order : 'asc'}
                  onClick={(event) => handleRequestSort(event, 'rating')}
                  sx={{
                    '&.MuiTableSortLabel-root': { color: '#32b4de' },
                    '&.MuiTableSortLabel-root:hover': { color: '#32b4de' },
                    '&.Mui-active': { color: '#32b4de' },
                    '& .MuiTableSortLabel-icon': { color: '#32b4de !important' },
                  }}
                >
                  Rating
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
            {paginatedFeedback.map((item, index) => (
              <TableRow
                key={item._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}
              >
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  {page * rowsPerPage + index + 1}
                </TableCell>
                <TableCell component="th" scope="row" sx={{ color: 'white' }}>
                  {item.clientName}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{item.artistId}</TableCell>
                <TableCell>
                  <Rating value={item.rating} readOnly size="small" />
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{formatDate(item.createdAt)}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.review}
                </TableCell>
                <TableCell>
                  <IconButton 
                    aria-label="edit" 
                    onClick={() => handleEditClick(item)}
                    sx={{ color: '#32b4de', mr: 1, '&:hover': { bgcolor: 'rgba(50, 180, 222, 0.1)' } }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    aria-label="delete" 
                    onClick={() => handleDeleteClick(item)}
                    sx={{ color: '#ef5350', '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.1)' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredFeedback.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 3 }}>
                  No feedback found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredFeedback.length}
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
        <DialogTitle sx={{ color: '#32b4de' }}>Edit Feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Client Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editForm.clientName}
            onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typography component="legend" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Rating</Typography>
            <Rating
              value={editForm.rating}
              onChange={(event, newValue) => {
                setEditForm({ ...editForm, rating: newValue });
              }}
            />
          </Box>
          <TextField
            margin="dense"
            label="Review"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editForm.review}
            onChange={(e) => setEditForm({ ...editForm, review: e.target.value })}
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
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a2027',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#4caf50' }}>Add New Feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Client Name"
            type="text"
            fullWidth
            variant="outlined"
            value={addForm.clientName}
            onChange={(e) => setAddForm({ ...addForm, clientName: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typography component="legend" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Rating</Typography>
            <Rating
              value={addForm.rating}
              onChange={(event, newValue) => {
                setAddForm({ ...addForm, rating: newValue });
              }}
            />
          </Box>
          <TextField
            margin="dense"
            label="Review"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={addForm.review}
            onChange={(e) => setAddForm({ ...addForm, review: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }} disabled={actionLoading}>
            Cancel
          </Button>
          <Button onClick={handleAddSave} sx={{ color: '#4caf50' }} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Add'}
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
            Are you sure you want to delete this feedback from <strong>{selectedFeedback?.clientName}</strong>?
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

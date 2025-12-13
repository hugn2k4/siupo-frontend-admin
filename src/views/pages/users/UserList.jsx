import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import MainCard from '../../../ui-component/cards/MainCard.jsx';
import { useState, useEffect } from 'react';
import userApi from '../../../api/userApi';
import { useSnackbar } from '../../../contexts/SnackbarProvider';

// Components
import DeleteConfirmDialog from './component/DeleteConfirmDialog';
import UserStatusChip from './component/UserStatusChip';

export default function UserList() {
  // ==== State ====
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const { showSnackbar } = useSnackbar();

  // ==== Load customers from API ====
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await userApi.getAllCustomers();
        const activeUsers = (response.data || []).filter((u) => u.status !== 'DELETED');
        setUsers(activeUsers);
      } catch (error) {
        console.error('Failed to load customers:', error);
        showSnackbar({ message: 'Could not load customer list', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [showSnackbar]);

  // ==== Search by name, email, or phone number ====
  const filteredUsers = users
    .filter((u) => u.status !== 'DELETED')
    .filter((u) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.phoneNumber && u.phoneNumber.includes(query)) // Search by phone
      );
    });

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0); // Reset to first page on search
  };

  // ==== Open status edit dialog (only 3 options) ====
  const openStatusDialog = (user) => {
    setEditUser(user);
    setOpenEdit(true);
  };

  // ==== Update status (ACTIVE / INACTIVE / SUSPENDED only) ====
  const handleStatusChange = async (userId, newStatus) => {
    setUpdatingId(userId);
    try {
      await userApi.updateCustomerStatus(userId, newStatus);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      setOpenEdit(false);
    } catch {
      showSnackbar({ message: 'Failed to update status', severity: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  // ==== Delete → set DELETED + remove from list ====
  const openDeleteDialog = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setOpenDelete(true);
  };

  const handleDelete = async (id) => {
    setUpdatingId(id);
    try {
      await userApi.updateCustomerStatus(id, 'DELETED');
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      showSnackbar({ message: 'Failed to delete customer', severity: 'error' });
    } finally {
      setOpenDelete(false);
      setUpdatingId(null);
    }
  };

  return (
    <MainCard
      title="Customer Management"
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ width: 300 }}
          />
        </Box>
      }
    >
      {/* ==== Table ==== */}
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Loading customers...
            </Typography>
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No customers found
            </Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {user.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber || '-'}</TableCell>
                  <TableCell>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-GB') : '-'}</TableCell>
                  <TableCell>{user.gender === 'MALE' ? 'Male' : user.gender === 'FEMALE' ? 'Female' : 'Other'}</TableCell>
                  <TableCell align="center">
                    <UserStatusChip status={user.status} />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit status">
                      <IconButton size="small" color="primary" onClick={() => openStatusDialog(user)} disabled={updatingId === user.id}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog(user.id, user.fullName)}
                        disabled={updatingId === user.id}
                      >
                        {updatingId === user.id ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* ==== Pagination ==== */}
      <TablePagination
        component="div"
        count={filteredUsers.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 15, 25]}
        labelRowsPerPage="Rows per page:"
      />

      {/* ==== Status Edit Dialog (only 3 options) ==== */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              Customer: <strong>{editUser?.fullName}</strong>
            </Typography>
            <FormControl fullWidth size="small" sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editUser?.status || 'ACTIVE'}
                onChange={(e) => handleStatusChange(editUser.id, e.target.value)}
                label="Status"
                disabled={updatingId === editUser?.id}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* ==== Delete Confirmation Dialog ==== */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        id={deleteId}
        name={deleteName}
        onConfirm={handleDelete}
        title="Delete Customer"
      />
    </MainCard>
  );
}

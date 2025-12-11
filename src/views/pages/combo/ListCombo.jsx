import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useSnackbar } from 'contexts/SnackbarProvider';
import { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import comboService from '../../../services/comboService';
import ComboEditDialog from './component/ComboEditDialog';
import DeleteConfirmDialog from './component/DeleteConfirmDialog';

export default function ListCombo() {
  const [combos, setCombos] = useState([]);
  const [filteredCombos, setFilteredCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableFilter, setAvailableFilter] = useState('all');

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editMode, setEditMode] = useState('create');
  const [editData, setEditData] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    loadCombos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableFilter]);

  useEffect(() => {
    filterCombos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combos, searchQuery, availableFilter]);

  const loadCombos = async () => {
    setLoading(true);
    try {
      // Chỉ gọi API với availableOnly=true khi filter là 'available'
      const availableOnly = availableFilter === 'available';
      const result = await comboService.getAll(availableOnly);
      setCombos(result || []);
    } catch (error) {
      showSnackbar({ message: 'Lỗi khi tải danh sách combo', severity: 'error' });
      console.error('Error loading combos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCombos = () => {
    let filtered = [...combos];

    // Lọc theo trạng thái available
    if (availableFilter === 'available') {
      filtered = filtered.filter((combo) => combo.status?.toUpperCase() === 'AVAILABLE');
    } else if (availableFilter === 'unavailable') {
      filtered = filtered.filter((combo) => combo.status?.toUpperCase() !== 'AVAILABLE');
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((combo) => combo.name?.toLowerCase().includes(query) || combo.description?.toLowerCase().includes(query));
    }

    setFilteredCombos(filtered);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAvailableFilterChange = (e) => {
    setAvailableFilter(e.target.value);
  };

  const handleToggleStatus = async (id) => {
    try {
      const updatedCombo = await comboService.toggleStatus(id);
      // Cập nhật lại danh sách combos
      setCombos((prev) => prev.map((combo) => (combo.id === id ? { ...combo, status: updatedCombo.status } : combo)));
      const statusMessage = updatedCombo.status === 'AVAILABLE' ? 'Combo đã được kích hoạt' : 'Combo đã bị vô hiệu hóa';
      showSnackbar({ message: statusMessage, severity: 'success' });
    } catch (error) {
      showSnackbar({ message: error.message || 'Lỗi khi thay đổi trạng thái combo', severity: 'error' });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAdd = () => {
    setEditMode('create');
    setEditData(null);
    setOpenEditDialog(true);
  };

  const handleEdit = (combo) => {
    setEditMode('edit');
    setEditData(combo);
    setOpenEditDialog(true);
  };

  const handleSave = async (payload, mode) => {
    try {
      if (mode === 'create') {
        await comboService.create(payload);
        showSnackbar({ message: 'Tạo combo thành công', severity: 'success' });
      } else {
        await comboService.update(editData.id, payload);
        showSnackbar({ message: 'Cập nhật combo thành công', severity: 'success' });
      }
      await loadCombos();
      setOpenEditDialog(false);
    } catch (error) {
      showSnackbar({ message: error.message || 'Lỗi khi lưu combo', severity: 'error' });
      throw error;
    }
  };

  const handleOpenDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await comboService.delete(deleteId);
      showSnackbar({ message: 'Xóa combo thành công', severity: 'success' });
      await loadCombos();
      setOpenDeleteDialog(false);
    } catch (error) {
      showSnackbar({ message: error.message || 'Lỗi khi xóa combo', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusChip = (status) => {
    const statusUpper = status?.toUpperCase();
    if (statusUpper === 'AVAILABLE') {
      return <Chip label={statusUpper} color="success" size="small" />;
    }
    return <Chip label={statusUpper} color="default" size="small" />;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const paginatedCombos = filteredCombos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <MainCard
      title="List combo items"
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={availableFilter} onChange={handleAvailableFilterChange} label="Status">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="unavailable">Unavailable</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />

          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Combo
          </Button>
        </Box>
      }
    >
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>No.</TableCell>
              <TableCell sx={{ width: 72 }}>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Products</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedCombos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No combos found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCombos.map((combo, index) => (
                <TableRow key={combo.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    {combo.imageUrls && combo.imageUrls.length > 0 ? (
                      <Avatar src={combo.imageUrls[0]} alt={combo.name} variant="rounded" sx={{ width: 48, height: 48 }} />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 48, height: 48 }}>
                        {combo.name?.charAt(0)}
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>{combo.name}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {combo.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{formatPrice(combo.basePrice)}</TableCell>
                  <TableCell align="center">
                    <Chip label={combo.items?.length || 0} size="small" />
                  </TableCell>
                  <TableCell align="center">{getStatusChip(combo.status)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(combo)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleOpenDelete(combo.id, combo.name)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle status">
                      <IconButton size="small" onClick={() => handleToggleStatus(combo.id)}>
                        {combo.status?.toUpperCase() === 'AVAILABLE' ? (
                          <ToggleOnIcon color="success" />
                        ) : (
                          <ToggleOffIcon color="disabled" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredCombos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      <ComboEditDialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} onSave={handleSave} mode={editMode} data={editData} />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        itemName={deleteName}
        loading={deleting}
      />
    </MainCard>
  );
}

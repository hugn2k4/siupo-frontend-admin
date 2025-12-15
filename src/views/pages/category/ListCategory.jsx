import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { Image as ImageIcon } from 'lucide-react'; // Đảm bảo bạn import ImageIcon từ lucide-react hoặc @mui/icons-material
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import { useSnackbar } from 'contexts/SnackbarProvider';
import React from 'react';
import categoryService from 'services/categoryService';
import MainCard from 'ui-component/cards/MainCard';
import DeleteConfirmDialog from '../menu/component/DeleteConfirmDialog';
import CategoryDialog from './component/CategoryDialog';

export default function ListCategory() {
  const [query, setQuery] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const { showSnackbar } = useSnackbar();
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState(null);
  const [confirmName, setConfirmName] = React.useState('');

  const fetchCategories = async () => {
    const res = await categoryService.getAll();
    if (res && Array.isArray(res?.data)) setRows(res.data);
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    // initialData giờ sẽ chứa cả trường image.url và image.name
    setEditing(item);
    setDialogOpen(true);
  };

  const handleDelete = (id, name) => {
    setConfirmId(id);
    setConfirmName(name || '');
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async (id) => {
    setOpenConfirm(false);
    const previousRows = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    try {
      const res = await categoryService.delete(id);
      if (res && res.success === false) {
        showSnackbar({ message: res.message || 'Failed to delete category', severity: 'error' });
        setRows(previousRows);
        return;
      }
      showSnackbar({ message: 'Category deleted', severity: 'success' });
    } catch (err) {
      setRows(previousRows);
      showSnackbar({ message: err?.message || 'Failed to delete category', severity: 'error' });
    }
  };

  // Payload giờ chứa { id, name, imageUrl, imageName }
  const handleSave = async (payload, mode) => {
    try {
      if (mode === 'create') {
        // Gửi payload đầy đủ (name, imageUrl, imageName)
        const res = await categoryService.create(payload);
        if (!res || res.success === false) {
          showSnackbar({ message: res?.message || 'Failed to create category', severity: 'error' });
          return;
        }
        const created = res.data || res;
        setRows((r) => [created, ...r]);
        showSnackbar({ message: 'Category created', severity: 'success' });
      } else {
        const targetId = payload.id;
        // Gửi payload đầy đủ (name, imageUrl, imageName)
        const res = await categoryService.update(targetId, payload);
        if (!res || res.success === false) {
          showSnackbar({ message: res?.message || 'Failed to update category', severity: 'error' });
          return;
        }
        const updated = res.data || res;
        setRows((r) => r.map((it) => (it.id === updated.id ? updated : it)));
        showSnackbar({ message: 'Category updated', severity: 'success' });
      }
      setDialogOpen(false);
    } catch (err) {
      showSnackbar({ message: err.message || 'An error occurred', severity: 'error' });
    }
  };

  const filtered = rows.filter((r) => r.name?.toLowerCase().includes(query.toLowerCase()));

  return (
    <MainCard
      title="Categories"
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search by name"
            value={query}
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
            Add Category
          </Button>
        </Box>
      }
    >
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80 }}>No.</TableCell>
              <TableCell sx={{ width: 100 }}>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row, idx) => (
              <TableRow key={row.id} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  {' '}
                  {/* <<< HIỂN THỊ IMAGE */}
                  {row.image?.url ? (
                    <img src={row.image.url} alt={row.name} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                  ) : (
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        bgcolor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4
                      }}
                    >
                      <ImageIcon size={18} color="gray" />
                    </Box>
                  )}
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" aria-label="edit" onClick={() => handleEdit(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" aria-label="delete" onClick={() => handleDelete(row.id, row.name)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CategoryDialog open={dialogOpen} onClose={() => setDialogOpen(false)} initialData={editing} onSave={handleSave} />
      <DeleteConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        id={confirmId}
        name={confirmName}
      />
    </MainCard>
  );
}

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
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
  Typography
} from '@mui/material';
import { useSnackbar } from 'contexts/SnackbarProvider';
import { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import tagService from '../../../services/tagService';

export default function ManageTags() {
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedTag, setSelectedTag] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { showSnackbar } = useSnackbar();

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await tagService.getAllTags();
      const tagList = response.data || response || [];
      setTags(tagList);
      setFilteredTags(tagList);
    } catch (err) {
      console.error('Failed to load tags:', err);
      showSnackbar({ message: 'Failed to load tags', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch tags
  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter tags based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTags(tags);
    } else {
      const filtered = tags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTags(filtered);
    }
    setPage(0);
  }, [searchQuery, tags]);

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({ name: '', description: '' });
    setSelectedTag(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (tag) => {
    setDialogMode('edit');
    setSelectedTag(tag);
    setFormData({ name: tag.name, description: tag.description || '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', description: '' });
    setSelectedTag(null);
  };

  const handleSaveTag = async () => {
    if (!formData.name.trim()) {
      showSnackbar({ message: 'Tag name is required', severity: 'warning' });
      return;
    }

    try {
      if (dialogMode === 'create') {
        await tagService.createTag(formData);
        showSnackbar({ message: 'Tag created successfully', severity: 'success' });
      } else {
        await tagService.updateTag(selectedTag.id, formData);
        showSnackbar({ message: 'Tag updated successfully', severity: 'success' });
      }
      fetchTags();
      handleCloseDialog();
    } catch (error) {
      showSnackbar({ message: error.message || 'Failed to save tag', severity: 'error' });
    }
  };

  const handleOpenDeleteDialog = (tag) => {
    setDeleteTarget(tag);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteTarget(null);
  };

  const handleDeleteTag = async () => {
    if (!deleteTarget) return;

    try {
      await tagService.deleteTag(deleteTarget.id);
      showSnackbar({ message: 'Tag deleted successfully', severity: 'success' });
      fetchTags();
      handleCloseDeleteDialog();
    } catch (error) {
      showSnackbar({ message: error.message || 'Failed to delete tag', severity: 'error' });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTags = filteredTags.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <MainCard title="Manage Tags">
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
          Add Tag
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedTags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No tags found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTags.map((tag, index) => (
                <TableRow key={tag.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {tag.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {tag.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditDialog(tag)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(tag)}>
                        <DeleteIcon fontSize="small" />
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
        count={filteredTags.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? 'Create New Tag' : 'Edit Tag'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tag Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTag} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete tag "<strong>{deleteTarget?.name}</strong>"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteTag} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

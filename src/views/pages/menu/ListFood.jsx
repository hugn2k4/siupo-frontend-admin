import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Popover,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
// filters removed (FormControl, Select etc.)
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useSnackbar } from 'contexts/SnackbarProvider';
import { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import productService from '../../../services/productService';
import DeleteConfirmDialog from './component/DeleteConfirmDialog';
import ProductEditDialog from './component/ProductEditDialog';

// Mock data generator imported from api/menu.mock

export default function ListFood() {
  // Server-like paging using mockFetchMenu
  const [dataRows, setDataRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [query, setQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  // appliedPriceRange is the one actually used for filtering; priceRange is the editor value
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 200000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceAnchorEl, setPriceAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openPopupDelete, setOpenPopupDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const allCategories = ['Pasta', 'Main'];

  // Page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const next = parseInt(event.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
  };

  // Category
  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setSelectedCategories(typeof value === 'string' ? value.split(',') : value);
    setPage(0);
  };
  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    setPage(0);
  };

  // Price
  const handleOpenPrice = (event) => {
    setPriceRange(appliedPriceRange);
    setPriceAnchorEl(event.currentTarget);
  };
  const handleClosePrice = () => {
    setPriceRange(appliedPriceRange);
    setPriceAnchorEl(null);
  };
  const handleApplyPrice = () => {
    setAppliedPriceRange(priceRange);
    setPage(0);
    setPriceAnchorEl(null);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  // Item action
  const handleToggleStatus = async (id) => {
    let oldStatus;
    setDataRows((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          oldStatus = row.status;
          const newStatus = row.status.toUpperCase() === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
          return { ...row, status: newStatus };
        }
        return row;
      })
    );

    try {
      const res = await productService.changStatusProduct(id);
      if (res && res.success === false) {
        setDataRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: oldStatus } : row)));
        showSnackbar({ message: res?.message || 'Failed to change status', severity: 'error' });
      } else {
        const newStatusMessage = oldStatus.toUpperCase() === 'AVAILABLE' ? 'Product is now UNAVAILABLE' : 'Product is now AVAILABLE';
        showSnackbar({ message: newStatusMessage, severity: 'success' });
      }
    } catch (err) {
      setDataRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: oldStatus } : row)));
      showSnackbar({ message: err?.message || 'Failed to change status', severity: 'error' });
    }
  };

  const handleOpenDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name || '');
    setOpenPopupDelete(true);
  };
  // Edit / Create dialog
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [editMode, setEditMode] = useState('create');
  const [editData, setEditData] = useState(null);

  const handleAdd = () => {
    setEditMode('create');
    setEditData(null);
    setOpenEditPopup(true);
  };

  const handleEdit = (id) => {
    const row = dataRows.find((r) => r.id === id);
    if (!row) return;
    setEditMode('edit');
    setEditData(row);
    setOpenEditPopup(true);
  };

  const { showSnackbar } = useSnackbar();

  const handleSave = async (payload, mode, fileData = {}) => {
    // Optimistic UI: create/update locally and call API in background if available
    const { files = [], removedImageIds = [] } = fileData || {};

    if (mode === 'create') {
      const tempId = `tmp-${Date.now()}`;
      // attach preview urls for new files so UI shows thumbnails immediately
      const previews = (files || []).map((f) => ({ url: URL.createObjectURL(f), _temp: true }));
      const newItem = { ...payload, id: tempId, images: previews };
      setDataRows((prev) => [newItem, ...prev]);
      setTotalRows((t) => t + 1);

      if (productService.createProduct) {
        try {
          // if service expects FormData, caller can implement accordingly. Try FormData when files exist.
          let res;
          if (files && files.length) {
            const form = new FormData();
            form.append('name', payload.name || '');
            form.append('price', payload.price ?? '');
            form.append('description', payload.description || '');
            form.append('status', payload.status || 'ACTIVE');
            if (payload.category && payload.category.id) form.append('categoryId', payload.category.id);
            files.forEach((f) => form.append('files', f));
            // optional: send JSON of other fields if backend expects
            res = await productService.createProduct(form);
          } else {
            res = await productService.createProduct(payload);
          }

          // replace temp item with server-provided one when available
          if (res && res.data) {
            setDataRows((prev) => prev.map((r) => (r.id === tempId ? res.data : r)));
            showSnackbar({ message: 'Product created', severity: 'success' });
          }
        } catch (err) {
          // revert
          setDataRows((prev) => prev.filter((r) => r.id !== tempId));
          setTotalRows((t) => Math.max(0, t - 1));
          showSnackbar({ message: err?.message || 'Failed to create product', severity: 'error' });
        }
      } else {
        showSnackbar({ message: 'Product created (local)', severity: 'success' });
      }
    } else if (mode === 'edit') {
      // optimistic: update row locally, merging in new previews and removing any images that were deleted in the dialog
      setDataRows((prev) =>
        prev.map((r) => {
          if (r.id !== payload.id) return r;
          const existing = Array.isArray(r.images) ? r.images.filter((img) => !removedImageIds.includes(img.id)) : [];
          const previews = (files || []).map((f) => ({ url: URL.createObjectURL(f), _temp: true }));
          return { ...r, ...payload, images: [...existing, ...previews] };
        })
      );

      if (productService.updateProduct) {
        try {
          let res;
          if (files && files.length) {
            const form = new FormData();
            form.append('name', payload.name || '');
            form.append('price', payload.price ?? '');
            form.append('description', payload.description || '');
            form.append('status', payload.status || 'ACTIVE');
            if (payload.category && payload.category.id) form.append('categoryId', payload.category.id);
            form.append('removedImageIds', JSON.stringify(removedImageIds || []));
            files.forEach((f) => form.append('files', f));
            res = await productService.updateProduct(payload.id, form);
          } else {
            // also send removedImageIds if present
            const body = { ...payload };
            if (removedImageIds && removedImageIds.length) body.removedImageIds = removedImageIds;
            res = await productService.updateProduct(payload.id, body);
          }

          if (res && res.success === false) {
            showSnackbar({ message: res.message || 'Failed to update', severity: 'error' });
          } else {
            showSnackbar({ message: 'Product updated', severity: 'success' });
            // reconcile server data if returned
            if (res && res.data) {
              setDataRows((prev) => prev.map((r) => (r.id === payload.id ? res.data : r)));
            }
          }
        } catch (err) {
          showSnackbar({ message: err?.message || 'Failed to update', severity: 'error' });
        }
      } else {
        showSnackbar({ message: 'Product updated (local)', severity: 'success' });
      }
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProducts(page, rowsPerPage);
      const envelope = res?.data ?? res;
      const content = envelope?.content ?? envelope?.items ?? envelope?.results ?? (Array.isArray(envelope) ? envelope : undefined) ?? [];
      const items = Array.isArray(content) ? content : [];
      const total = envelope?.totalElements ?? envelope?.total ?? res?.totalElements ?? res?.total ?? items.length;
      setDataRows(items);
      setTotalRows(Number(total) || 0);
    } catch (err) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async (id) => {
    // Optimistic UI: remove the item locally first for a smooth UX,
    // then call delete API in background and reconcile or revert on failure.
    const previousRows = dataRows;
    const prevTotal = totalRows;

    // optimistic remove
    setDataRows((prev) => prev.filter((r) => r.id !== id));
    setTotalRows((t) => Math.max(0, t - 1));
    setOpenPopupDelete(false);
    setDeleteId(null);
    setDeleteName('');
    setDeletingId(id);

    try {
      const res = await productService.deleteProduct(id);
      if (res && res.success !== false) {
        if (typeof showSnackbar === 'function') showSnackbar({ message: 'Product deleted', severity: 'success' });
        // optionally refresh in background to reconcile any server-side differences
        fetchProducts().catch(() => {});
      } else {
        // revert optimistic update
        setDataRows(previousRows);
        setTotalRows(prevTotal);
        if (typeof showSnackbar === 'function') showSnackbar({ message: res?.message || 'Failed to delete', severity: 'error' });
      }
    } catch (err) {
      setDataRows(previousRows);
      setTotalRows(prevTotal);
      if (typeof showSnackbar === 'function') showSnackbar({ message: err?.message || 'Failed to delete', severity: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to robustly obtain the first image URL from a product row
  const getFirstImage = (row) => {
    if (!row) return '';
    // candidate fields that may contain images
    const candidates = [row.image, row.images, row.imageUrls, row.imagesUrl, row.thumbnail, row.avatar, row.imageUrl];
    for (const c of candidates) {
      if (!c) continue;
      if (typeof c === 'string') return c;
      if (Array.isArray(c) && c.length) {
        const first = c[0];
        if (!first) continue;
        if (typeof first === 'string') return first;
        if (first.url) return first.url;
        if (first.path) return first.path;
      }
      if (c?.url) return c.url;
      if (c?.path) return c.path;
    }
    return '';
  };

  // Fetch page from mock API whenever page/filters/sort change
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    productService
      .getProducts(page, rowsPerPage)
      .then((res) => {
        if (!mounted) return;

        // Support multiple possible response shapes from the service/backend
        // Common shapes observed:
        // 1) { success, message, data: { content: [...], totalElements, ... } }
        // 2) { content: [...], totalElements, ... }
        // 3) { items: [...], total: n }
        // 4) normalized { items, total }

        const envelope = res?.data ?? res;
        const content = envelope?.content ?? envelope?.items ?? envelope?.results ?? (Array.isArray(envelope) ? envelope : undefined) ?? [];
        const items = Array.isArray(content) ? content : [];
        const total = envelope?.totalElements ?? envelope?.total ?? res?.totalElements ?? res?.total ?? items.length;

        setDataRows(items);
        setTotalRows(Number(total) || 0);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load');
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page, rowsPerPage, query, appliedPriceRange, selectedCategories]);

  return (
    <MainCard
      title="List food items"
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search by name or description..."
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

          {/* Category multi-select */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="category-multi-label">Category</InputLabel>
            <Select
              labelId="category-multi-label"
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Category"
            >
              {allCategories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Price popover editor (editor changes don't apply until user clicks Apply) */}
          <Box>
            <Button size="large" variant="outlined" onClick={handleOpenPrice}>
              {appliedPriceRange[0] > 0 || appliedPriceRange[1] < 200000
                ? `${appliedPriceRange[0].toLocaleString()} - ${appliedPriceRange[1].toLocaleString()} VND`
                : 'Price'}
            </Button>
            <Popover
              open={Boolean(priceAnchorEl)}
              anchorEl={priceAnchorEl}
              onClose={handleClosePrice}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <Box sx={{ margin: 1, marginTop: 3, width: 260, p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Slider value={priceRange} onChange={handlePriceChange} valueLabelDisplay="auto" size="small" min={0} max={200000} />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setPriceRange([0, 200000]);
                      setAppliedPriceRange([0, 200000]);
                      setPage(0);
                      handleClosePrice();
                    }}
                  >
                    Reset
                  </Button>
                  <Button size="small" variant="contained" onClick={handleApplyPrice}>
                    Apply
                  </Button>
                </Box>
              </Box>
            </Popover>
          </Box>

          <Button size="large" variant="outlined" color="secondary" onClick={handleAdd}>
            Add
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
              <TableCell>
                <TableSortLabel>Name</TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel>Category</TableSortLabel>
              </TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">
                <TableSortLabel>Price</TableSortLabel>
              </TableCell>
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
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {`Error: ${error}`}
                </TableCell>
              </TableRow>
            ) : dataRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No items
                </TableCell>
              </TableRow>
            ) : (
              dataRows.map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    {(() => {
                      const img = getFirstImage(row);
                      return img ? (
                        <Avatar variant="square" src={img} alt={row.name} sx={{ width: 48, height: 48, objectFit: 'cover' }} />
                      ) : (
                        <Avatar variant="square" sx={{ width: 48, height: 48, bgcolor: 'grey.300' }}>
                          {row.name ? String(row.name).charAt(0) : ''}
                        </Avatar>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">{row.name}</Typography>
                  </TableCell>
                  <TableCell>{row.categoryName}</TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {row.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{Number(row.price).toLocaleString()} VND</TableCell>
                  <TableCell align="center">
                    <Chip label={row.status} color={row.status.toUpperCase() === 'AVAILABLE' ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" aria-label="edit" onClick={() => handleEdit(row.id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="delete"
                        onClick={() => handleOpenDelete(row.id, row.name)}
                        disabled={deletingId === row.id}
                      >
                        {deletingId === row.id ? <CircularProgress size={18} thickness={5} /> : <DeleteIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle status">
                      <IconButton size="small" onClick={() => handleToggleStatus(row.id)}>
                        {row.status.toUpperCase() === 'AVAILABLE' ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="disabled" />}
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
        count={totalRows}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[25, 50, 100]}
      />
      <DeleteConfirmDialog
        open={openPopupDelete}
        onClose={() => setOpenPopupDelete(false)}
        id={deleteId}
        name={deleteName}
        onConfirm={() => handleConfirmDelete(deleteId)}
        title="Xóa sản phẩm"
      />
      <ProductEditDialog
        open={openEditPopup}
        onClose={() => setOpenEditPopup(false)}
        mode={editMode}
        initialData={editData}
        categories={allCategories}
        onSave={handleSave}
      />
    </MainCard>
  );
}

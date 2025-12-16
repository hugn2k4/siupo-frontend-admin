import AddIcon from '@mui/icons-material/Add';
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
import categoryService from '../../../services/categoryService';
import productService from '../../../services/productService';
import uploadService from '../../../services/uploadService';
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
  const [priceRange, setPriceRange] = useState([0, 200]);
  // appliedPriceRange is the one actually used for filtering; priceRange is the editor value
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 200]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceAnchorEl, setPriceAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openPopupDelete, setOpenPopupDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [allCategories, setAllCategories] = useState([]);

  // fetch categories from API on mount (keep id/name pairs)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await categoryService.getAll();
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const mapped = list
          .map((c) =>
            typeof c === 'string'
              ? null
              : {
                  id: c?.id ?? c?.value ?? null,
                  name: c?.name ?? c?.label ?? ''
                }
          )
          .filter((x) => x && x.id != null);
        if (mounted) setAllCategories(mapped);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

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
          // Upload files first via upload API, then send JSON payload including returned URLs
          let res;
          if (files && files.length) {
            const urls = await uploadService.uploadMultiple(files);
            const body = {
              name: payload.name,
              description: payload.description,
              price: payload.price,
              categoryId: payload.categoryId ?? payload.category?.id ?? null,
              imageUrls: urls,
              tags: payload.tags || []
            };
            res = await productService.createProduct(body);
          } else {
            const body = {
              name: payload.name,
              description: payload.description,
              price: payload.price,
              categoryId: payload.categoryId ?? payload.category?.id ?? null,
              imageUrls: payload.imageUrls ?? payload.images ?? [],
              tags: payload.tags || []
            };
            res = await productService.createProduct(body);
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
          // helper to extract url from different shapes
          const extractUrl = (img) => {
            if (!img) return '';
            if (typeof img === 'string') return img;
            return img.url || img.path || img.imageUrl || img.src || img.link || '';
          };

          // obtain existing images from current row so we can remove by id
          const currentRow = dataRows.find((r) => r.id === payload.id) || {};
          const existingArr = currentRow.images ?? currentRow.imageUrls ?? payload.imageUrls ?? payload.images ?? [];
          const normalizedExisting = Array.isArray(existingArr)
            ? existingArr.map((it) => ({ id: it?.id ?? null, url: extractUrl(it) }))
            : [];

          const keptExistingUrls = normalizedExisting
            .filter((it) => !removedImageIds.includes(it.id))
            .map((it) => it.url)
            .filter(Boolean);

          let res;
          if (files && files.length) {
            const newUrlsRaw = await uploadService.uploadMultiple(files);
            const newUrls = Array.isArray(newUrlsRaw) ? newUrlsRaw : (newUrlsRaw?.data ?? newUrlsRaw?.urls ?? []);
            const combined = [...keptExistingUrls, ...newUrls];
            const body = {
              name: payload.name,
              description: payload.description,
              price: payload.price,
              categoryId: payload.categoryId ?? payload.category?.id ?? null,
              imageUrls: combined,
              tags: payload.tags || []
            };
            res = await productService.updateProduct(payload.id, body);
          } else {
            const body = {
              name: payload.name,
              description: payload.description,
              price: payload.price,
              categoryId: payload.categoryId ?? payload.category?.id ?? null,
              imageUrls: keptExistingUrls,
              tags: payload.tags || []
            };
            res = await productService.updateProduct(payload.id, body);
          }

          if (res && res.success === false) {
            showSnackbar({ message: res.message || 'Failed to update', severity: 'error' });
          } else {
            showSnackbar({ message: 'Product updated', severity: 'success' });
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
      // build filters to send to backend /products/search
      const filters = {};
      if (query) filters.name = query;
      if (Array.isArray(appliedPriceRange)) {
        filters.minPrice = appliedPriceRange[0];
        filters.maxPrice = appliedPriceRange[1];
      }
      if (Array.isArray(selectedCategories) && selectedCategories.length) {
        filters.categoryIds = selectedCategories.join(',');
      }

      const res = await productService.getProducts(page, rowsPerPage, filters);
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
      .getProducts(page, rowsPerPage, {
        name: query || undefined,
        minPrice: appliedPriceRange?.[0],
        maxPrice: appliedPriceRange?.[1],
        categoryIds: Array.isArray(selectedCategories) && selectedCategories.length ? selectedCategories.join(',') : undefined
      })
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
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Price popover editor (editor changes don't apply until user clicks Apply) */}
          <Box>
            <Button size="large" variant="outlined" onClick={handleOpenPrice}>
              {appliedPriceRange[0] > 0 || appliedPriceRange[1] < 200000
                ? `${appliedPriceRange[0].toLocaleString()} - ${appliedPriceRange[1].toLocaleString()} $`
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

          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Food
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
              <TableCell align="left">Tags</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  {`Error: ${error}`}
                </TableCell>
              </TableRow>
            ) : dataRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
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
                  <TableCell align="right">{Number(row.price).toLocaleString()} $</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                      {row.tags && row.tags.length > 0 ? (
                        row.tags
                          .slice(0, 3)
                          .map((tag, idx) => <Chip key={idx} label={tag} size="small" color="primary" variant="outlined" />)
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No tags
                        </Typography>
                      )}
                      {row.tags && row.tags.length > 3 && <Chip label={`+${row.tags.length - 3}`} size="small" variant="outlined" />}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {/* guard against undefined status */}
                    <Chip
                      label={row.status ?? 'UNAVAILABLE'}
                      color={String(row.status || '').toUpperCase() === 'AVAILABLE' ? 'success' : 'default'}
                      size="small"
                    />
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
                        {String(row.status || '').toUpperCase() === 'AVAILABLE' ? (
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

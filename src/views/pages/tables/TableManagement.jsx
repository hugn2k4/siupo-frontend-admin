import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import QrCodeIcon from '@mui/icons-material/QrCode';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useSnackbar } from 'contexts/SnackbarProvider';
import { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import tableService from '../../../services/tableService';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import TableFormDialog from './TableFormDialog';
import QRCodeDialog from './QRCodeDialog';

export default function TableManagement() {
  const { showSnackbar } = useSnackbar();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    setLoading(true);
    try {
      const response = await tableService.getAllTables();
      const data = response?.data || [];
      setTables(data);
    } catch (error) {
      console.error('Failed to load tables:', error);
      showSnackbar('Không thể tải danh sách bàn', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenCreate = () => {
    setEditData(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (table) => {
    setEditData(table);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditData(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editData) {
        await tableService.updateTable(editData.id, formData);
        showSnackbar('Cập nhật bàn thành công', 'success');
      } else {
        await tableService.createTable(formData);
        showSnackbar('Tạo bàn mới thành công', 'success');
      }
      loadTables();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
      showSnackbar(msg, 'error');
      throw error;
    }
  };

  const handleOpenDelete = (table) => {
    setDeleteData(table);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setDeleteData(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteData) return;
    setDeleting(true);
    try {
      await tableService.deleteTable(deleteData.id);
      showSnackbar('Xóa bàn thành công', 'success');
      loadTables();
      handleCloseDelete();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Không thể xóa bàn';
      showSnackbar(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleInitialize = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn khởi tạo lại 10 bàn mặc định? Điều này sẽ không xóa bàn hiện có.')) {
      return;
    }
    setLoading(true);
    try {
      await tableService.initializeTables();
      showSnackbar('Khởi tạo bàn thành công', 'success');
      loadTables();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Không thể khởi tạo bàn';
      showSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQR = (table) => {
    setQrData(table);
    setOpenQR(true);
  };

  const handleCloseQR = () => {
    setOpenQR(false);
    setQrData(null);
  };

  const paginatedTables = tables.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <MainCard
      title="Quản lý bàn"
      secondary={
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadTables} disabled={loading}>
            Làm mới
          </Button>
          <Button variant="outlined" onClick={handleInitialize} disabled={loading}>
            Khởi tạo 10 bàn
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Tạo bàn mới
          </Button>
        </Box>
      }
    >
      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: 'primary.main',
              color: 'white'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="rgba(255,255,255,0.9)" gutterBottom variant="body2">
                    Tổng số bàn
                  </Typography>
                  <Typography variant="h3" color="white">
                    {tables.length}
                  </Typography>
                </Box>
                <EventSeatIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.4)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: 'grey.700',
              color: 'white'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="rgba(255,255,255,0.95)" gutterBottom variant="body2">
                    Bàn 2-4 chỗ
                  </Typography>
                  <Typography variant="h3" color="white">
                    {tables.filter((t) => t.seat <= 4).length}
                  </Typography>
                </Box>
                <EventSeatIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.4)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: 'secondary.main',
              color: 'white'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="rgba(255,255,255,0.95)" gutterBottom variant="body2">
                    Bàn 6-8 chỗ
                  </Typography>
                  <Typography variant="h3" color="white">
                    {tables.filter((t) => t.seat > 4 && t.seat <= 8).length}
                  </Typography>
                </Box>
                <EventSeatIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.4)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: 'error.main',
              color: 'white'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="rgba(255,255,255,0.95)" gutterBottom variant="body2">
                    Bàn lớn (&gt;8)
                  </Typography>
                  <Typography variant="h3" color="white">
                    {tables.filter((t) => t.seat > 8).length}
                  </Typography>
                </Box>
                <EventSeatIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.4)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading && tables.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Số bàn</TableCell>
                  <TableCell align="center">Số chỗ ngồi</TableCell>
                  <TableCell>Mã QR</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTables.map((table) => (
                  <TableRow key={table.id} hover>
                    <TableCell>{table.id}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {table.tableNumber}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${table.seat} chỗ`}
                        color={table.seat <= 4 ? 'success' : table.seat <= 8 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {table.qr}
                        </Typography>
                        <Tooltip title="Xem mã QR">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenQR(table)}
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'primary.dark' }
                            }}
                          >
                            <QrCodeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(table.createdAt).toLocaleDateString('vi-VN')}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(table.createdAt).toLocaleTimeString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Sửa">
                        <IconButton color="primary" size="small" onClick={() => handleOpenEdit(table)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton color="error" size="small" onClick={() => handleOpenDelete(table)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedTables.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary" py={3}>
                        Không có bàn nào. Hãy tạo bàn mới hoặc khởi tạo 10 bàn mặc định.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={tables.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
          />
        </>
      )}

      {/* Dialogs */}
      <TableFormDialog open={openForm} onClose={handleCloseForm} onSuccess={handleFormSubmit} editData={editData} />

      <DeleteConfirmDialog
        open={openDelete}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        tableName={deleteData?.tableNumber}
        loading={deleting}
      />

      <QRCodeDialog open={openQR} onClose={handleCloseQR} tableData={qrData} />
    </MainCard>
  );
}

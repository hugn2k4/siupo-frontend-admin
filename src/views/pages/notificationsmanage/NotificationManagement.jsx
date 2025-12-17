import { useState, useEffect, useMemo } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

import notificationApi from '../../../api/notificationApi';
import userApi from '../../../api/userApi';
import { useSnackbar } from '../../../contexts/SnackbarProvider';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({ title: '', content: '', userId: null, sendToAll: true });
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    loadNotifications();
    loadUsers();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getAllNotifications();
      const notifList = Array.isArray(data) ? data : data?.data || data?.notifications || [];
      setNotifications(notifList);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userApi.getAllCustomers();
      const userList = Array.isArray(data) ? data : data?.data || data?.users || [];
      setUsers(userList);
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Please enter a title';
    else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    else if (formData.title.length > 255) newErrors.title = 'Title must not exceed 255 characters';
    if (!formData.content.trim()) newErrors.content = 'Please enter content';
    else if (formData.content.length < 10) newErrors.content = 'Content must be at least 10 characters';
    else if (formData.content.length > 2000) newErrors.content = 'Content must not exceed 2000 characters';
    if (!formData.sendToAll && !formData.userId) newErrors.userId = 'Please select a recipient';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenDialog = () => {
    setErrors({});
    setUserSearchTerm('');
    setFormData({ title: '', content: '', userId: null, sendToAll: true });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setErrors({});
    setUserSearchTerm('');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const requestData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        sendToAll: formData.sendToAll,
        userId: formData.sendToAll ? null : formData.userId
      };
      await notificationApi.createNotification(requestData);
      showSnackbar({
        message: formData.sendToAll ? 'Notification sent to all users' : 'Notification created successfully',
        severity: 'success'
      });
      handleCloseDialog();
      loadNotifications();
    } catch (err) {
      console.error('Error creating notification:', err);
      showSnackbar({ message: err.response?.data?.message || 'Unable to create notification. Please try again!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (id) => setFormData({ ...formData, sendToAll: false, userId: id });

  const filteredUsers = useMemo(() => {
    const q = userSearchTerm.toLowerCase();
    return users.filter((u) => (u.fullName || u.email || '').toLowerCase().includes(q));
  }, [users, userSearchTerm]);

  const filteredNotifications = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return notifications.filter((n) => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q));
  }, [notifications, searchTerm]);

  const getStatusText = (status) => {
    switch (status) {
      case 'READ':
        return 'Read';
      case 'UNREAD':
        return 'Unread';
      case 'DELETED':
        return 'Deleted';
      default:
        return status;
    }
  };

  return (
    <MainCard sx={{ height: '100%' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationImportantIcon fontSize="large" color="primary" />
          <Box>
            <Typography variant="h3">Notification Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage notifications sent to customers
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search notifications"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon /> }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog} disabled={loading}>
            Create new notification
          </Button>
        </Box>
      </Toolbar>

      <Box sx={{ p: 2 }}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Sent Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {searchTerm ? 'No notifications found' : 'No notifications yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotifications.map((notification) => (
                  <TableRow key={notification.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{notification.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {notification.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {notification.isGlobal ? 'All users' : users.find((u) => u.id === notification.userId)?.fullName || 'N/A'}
                    </TableCell>
                    <TableCell>{notification.sentAt ? new Date(notification.sentAt).toLocaleString('vi-VN') : 'N/A'}</TableCell>
                    <TableCell>{getStatusText(notification.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create New Notification</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title || `${formData.title.length}/255 characters`}
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              error={!!errors.content}
              helperText={errors.content || `${formData.content.length}/2000 characters`}
              disabled={loading}
              fullWidth
              multiline
              minRows={4}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Recipient
              </Typography>
              <RadioGroup
                value={formData.sendToAll ? 'all' : 'single'}
                onChange={(e) => setFormData({ ...formData, sendToAll: e.target.value === 'all' })}
              >
                <FormControlLabel value="all" control={<Radio />} label={`Send to all (${users.length})`} />
                <FormControlLabel value="single" control={<Radio />} label="Select specific user" />
              </RadioGroup>

              {!formData.sendToAll && (
                <Box sx={{ mt: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Search user..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: <SearchIcon /> }}
                    fullWidth
                  />
                  <Paper variant="outlined" sx={{ maxHeight: 240, overflow: 'auto', mt: 1 }}>
                    <List>
                      {filteredUsers.length === 0 ? (
                        <ListItem>
                          <ListItemText primary={userSearchTerm ? 'No users found' : 'No users available'} />
                        </ListItem>
                      ) : (
                        filteredUsers.map((u) => (
                          <ListItem key={u.id} button selected={formData.userId === u.id} onClick={() => handleSelectUser(u.id)}>
                            <ListItemAvatar>
                              <Avatar>{(u.fullName || 'U').charAt(0).toUpperCase()}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={u.fullName || 'Unnamed'} secondary={u.email} />
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Paper>
                  {errors.userId && (
                    <Typography color="error" variant="caption">
                      {errors.userId}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading} startIcon={<SendIcon />}>
            {loading ? <CircularProgress size={16} /> : formData.sendToAll ? 'Send to all' : 'Create notification'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default NotificationManagement;

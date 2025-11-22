import { useState, useEffect } from 'react';
import { Bell, Plus, Send, Search, X, Users, User } from 'lucide-react';
import notificationApi from '../../../api/notificationApi';
import userApi from '../../../api/userApi';
import './NotificationManagement.css';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState(''); // Search trong modal
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    userId: null,
    sendToAll: true // Mặc định chọn "Gửi cho tất cả"
  });

  // Load dữ liệu ban đầu
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
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      alert('Không thể tải danh sách thông báo');
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
    } catch (error) {
      console.error('Lỗi khi tải danh sách user:', error);
      setUsers([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Tiêu đề không được vượt quá 255 ký tự';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Nội dung phải có ít nhất 10 ký tự';
    } else if (formData.content.length > 2000) {
      newErrors.content = 'Nội dung không được vượt quá 2000 ký tự';
    }

    if (!formData.sendToAll && !formData.userId) {
      newErrors.userId = 'Vui lòng chọn người nhận';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = () => {
    setErrors({});
    setUserSearchTerm('');
    setFormData({
      title: '',
      content: '',
      userId: null,
      sendToAll: true
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrors({});
    setUserSearchTerm('');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        sendToAll: formData.sendToAll,
        userId: formData.sendToAll ? null : formData.userId
      };

      await notificationApi.createNotification(requestData);

      alert(formData.sendToAll ? 'Đã gửi thông báo thành công đến tất cả người dùng!' : 'Đã tạo thông báo thành công!');

      handleCloseModal();
      loadNotifications();
    } catch (error) {
      console.error('Lỗi khi tạo thông báo:', error);
      alert(error.response?.data?.message || 'Không thể tạo thông báo. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn "Gửi cho tất cả"
  const handleSendToAllChange = () => {
    setFormData({
      ...formData,
      sendToAll: true,
      userId: null
    });
    setErrors({ ...errors, userId: undefined });
  };

  // Xử lý khi chọn user cụ thể
  const handleSelectUser = (userId) => {
    setFormData({
      ...formData,
      sendToAll: false,
      userId: userId
    });
    setErrors({ ...errors, userId: undefined });
  };

  // Filter users theo search term
  const filteredUsers = users.filter((user) => {
    const searchLower = userSearchTerm.toLowerCase();
    return user.fullName?.toLowerCase().includes(searchLower) || user.email?.toLowerCase().includes(searchLower);
  });

  const filteredNotifications = notifications.filter((notification) => {
    const matchSearch =
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'READ':
        return 'status-sent';
      case 'UNREAD':
        return 'status-pending';
      case 'DELETED':
        return 'status-draft';
      default:
        return 'status-draft';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'READ':
        return 'Đã đọc';
      case 'UNREAD':
        return 'Chưa đọc';
      case 'DELETED':
        return 'Đã xóa';
      default:
        return status;
    }
  };

  return (
    <div className="notification-container">
      <div className="notification-wrapper">
        {/* Header */}
        <div className="header-card">
          <div className="header-content">
            <div className="header-left">
              <div className="icon-wrapper">
                <Bell className="bell-icon" />
              </div>
              <div>
                <h1 className="page-title">Quản lý Thông báo</h1>
                <p className="page-subtitle">Tạo và quản lý thông báo gửi đến khách hàng</p>
              </div>
            </div>
            <button onClick={handleOpenModal} className="btn-create" disabled={loading}>
              <Plus className="icon" />
              Tạo thông báo mới
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="filter-card">
          <div className="filter-grid">
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="table-card">
          <div className="table-wrapper">
            {loading ? (
              <div className="loading-state">Đang tải...</div>
            ) : (
              <table className="notification-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Người nhận</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        {searchTerm ? 'Không tìm thấy thông báo nào' : 'Chưa có thông báo nào'}
                      </td>
                    </tr>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <tr key={notification.id}>
                        <td>
                          <div>
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-content">{notification.content}</div>
                          </div>
                        </td>
                        <td className="cell-text">
                          {notification.isGlobal
                            ? 'Tất cả người dùng'
                            : (Array.isArray(users) && users.find((u) => u.id === notification.userId)?.fullName) || 'N/A'}
                        </td>
                        <td className="cell-text">{notification.sentAt ? new Date(notification.sentAt).toLocaleString('vi-VN') : 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(notification.status)}`}>
                            {getStatusText(notification.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2 className="modal-title">Tạo thông báo mới</h2>
              <button onClick={handleCloseModal} className="modal-close" disabled={loading}>
                <X className="icon" />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Tiêu đề <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`form-input ${errors.title ? 'input-error' : ''}`}
                  placeholder="Nhập tiêu đề thông báo"
                  maxLength={255}
                  disabled={loading}
                />
                {errors.title && <p className="error-text">{errors.title}</p>}
                <p className="help-text">{formData.title.length}/255 ký tự</p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Nội dung <span className="required">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="4"
                  className={`form-textarea ${errors.content ? 'input-error' : ''}`}
                  placeholder="Nhập nội dung thông báo"
                  maxLength={2000}
                  disabled={loading}
                />
                {errors.content && <p className="error-text">{errors.content}</p>}
                <p className="help-text">{formData.content.length}/2000 ký tự</p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Người nhận <span className="required">*</span>
                </label>

                {/* Radio: Gửi cho tất cả */}
                <div className="radio-group">
                  <label className={`radio-card ${formData.sendToAll ? 'radio-card-selected' : ''}`}>
                    <input
                      type="radio"
                      name="recipient"
                      checked={formData.sendToAll}
                      onChange={handleSendToAllChange}
                      disabled={loading}
                      className="radio-input"
                    />
                    <div className="radio-content">
                      <Users className="radio-icon" />
                      <div>
                        <div className="radio-label">Gửi cho tất cả</div>
                        <div className="radio-description">
                          Thông báo sẽ được gửi đến tất cả {Array.isArray(users) ? users.length : 0} người dùng
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Radio: Chọn người dùng cụ thể */}
                <div className="radio-group">
                  <label className={`radio-card ${!formData.sendToAll ? 'radio-card-selected' : ''}`}>
                    <input
                      type="radio"
                      name="recipient"
                      checked={!formData.sendToAll}
                      onChange={() => setFormData({ ...formData, sendToAll: false })}
                      disabled={loading}
                      className="radio-input"
                    />
                    <div className="radio-content">
                      <User className="radio-icon" />
                      <div>
                        <div className="radio-label">Chọn người dùng cụ thể</div>
                        <div className="radio-description">Chọn một người dùng từ danh sách bên dưới</div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Danh sách users khi chọn "Người dùng cụ thể" */}
                {!formData.sendToAll && (
                  <div className="user-list-container">
                    {/* Search users */}
                    <div className="user-search-wrapper">
                      <Search className="search-icon-small" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="user-search-input"
                        disabled={loading}
                      />
                    </div>

                    {/* User list */}
                    <div className="user-list">
                      {filteredUsers.length === 0 ? (
                        <div className="user-list-empty">
                          {userSearchTerm ? 'Không tìm thấy người dùng nào' : 'Không có người dùng nào'}
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <label key={user.id} className={`user-item ${formData.userId === user.id ? 'user-item-selected' : ''}`}>
                            <input
                              type="radio"
                              name="selectedUser"
                              checked={formData.userId === user.id}
                              onChange={() => handleSelectUser(user.id)}
                              disabled={loading}
                              className="user-radio"
                            />
                            <div className="user-info">
                              <div className="user-avatar">{user.fullName?.charAt(0).toUpperCase() || 'U'}</div>
                              <div className="user-details">
                                <div className="user-name">{user.fullName || 'Unnamed'}</div>
                                <div className="user-email">{user.email || 'No email'}</div>
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {errors.userId && <p className="error-text">{errors.userId}</p>}
              </div>

              <div className="modal-actions">
                <button onClick={handleCloseModal} className="btn-cancel" disabled={loading}>
                  Hủy
                </button>
                <button onClick={handleSubmit} className="btn-submit" disabled={loading}>
                  {loading ? (
                    'Đang xử lý...'
                  ) : (
                    <>
                      <Send className="icon" />
                      {formData.sendToAll ? 'Gửi đến tất cả' : 'Tạo thông báo'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;

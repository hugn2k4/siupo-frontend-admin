import { useState } from 'react';
import { Bell, Plus, Edit, Trash2, Send, Search, X } from 'lucide-react';
import './NotificationManagement.css';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Khuyến mãi mùa hè 2024',
      content: 'Giảm giá 50% cho tất cả các gói dịch vụ',
      target: 'Tất cả khách hàng',
      status: 'Đã gửi',
      sendDate: '2024-06-15',
      type: 'Khuyến mãi'
    },
    {
      id: 2,
      title: 'Bảo trì hệ thống',
      content: 'Hệ thống sẽ bảo trì từ 2h-4h sáng ngày 20/06',
      target: 'Khách hàng VIP',
      status: 'Nháp',
      sendDate: '2024-06-20',
      type: 'Thông báo hệ thống'
    },
    {
      id: 3,
      title: 'Cập nhật chính sách',
      content: 'Chính sách mới có hiệu lực từ ngày 01/07/2024',
      target: 'Tất cả khách hàng',
      status: 'Chờ gửi',
      sendDate: '2024-07-01',
      type: 'Chính sách'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [filterType, setFilterType] = useState('Tất cả');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: 'Tất cả khách hàng',
    type: 'Khuyến mãi',
    sendDate: '',
    status: 'Nháp'
  });

  const notificationTypes = ['Khuyến mãi', 'Thông báo hệ thống', 'Chính sách', 'Sự kiện'];
  const targetOptions = ['Tất cả khách hàng', 'Khách hàng VIP', 'Khách hàng mới', 'Khách hàng thân thiết'];
  const statusOptions = ['Nháp', 'Chờ gửi', 'Đã gửi'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Nội dung phải có ít nhất 10 ký tự';
    }

    if (!formData.sendDate) {
      newErrors.sendDate = 'Vui lòng chọn ngày gửi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (mode, notification = null) => {
    setModalMode(mode);
    setErrors({});

    if (mode === 'edit' && notification) {
      setSelectedNotification(notification);
      setFormData({
        title: notification.title,
        content: notification.content,
        target: notification.target,
        type: notification.type,
        sendDate: notification.sendDate,
        status: notification.status
      });
    } else {
      setFormData({
        title: '',
        content: '',
        target: 'Tất cả khách hàng',
        type: 'Khuyến mãi',
        sendDate: '',
        status: 'Nháp'
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (modalMode === 'create') {
      const newNotification = {
        id: notifications.length + 1,
        ...formData
      };
      setNotifications([...notifications, newNotification]);
    } else {
      setNotifications(notifications.map((n) => (n.id === selectedNotification.id ? { ...n, ...formData } : n)));
    }

    handleCloseModal();
  };

  const handleSendNotification = (notification) => {
    setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, status: 'Đã gửi' } : n)));
  };

  const handleDeleteNotification = () => {
    setNotifications(notifications.filter((n) => n.id !== selectedNotification.id));
    setShowDeleteModal(false);
    setSelectedNotification(null);
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Tất cả' || notification.status === filterStatus;
    const matchType = filterType === 'Tất cả' || notification.type === filterType;

    return matchSearch && matchStatus && matchType;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'Đã gửi':
        return 'status-sent';
      case 'Chờ gửi':
        return 'status-pending';
      case 'Nháp':
        return 'status-draft';
      default:
        return 'status-draft';
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
            <button onClick={() => handleOpenModal('create')} className="btn-create">
              <Plus className="icon" />
              Tạo thông báo mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-card">
          <div className="filter-grid">
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thông báo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                <option value="Tất cả">Tất cả trạng thái</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                <option value="Tất cả">Tất cả loại</option>
                {notificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="table-card">
          <div className="table-wrapper">
            <table className="notification-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Loại</th>
                  <th>Đối tượng</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      Không tìm thấy thông báo nào
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
                      <td className="cell-text">{notification.type}</td>
                      <td className="cell-text">{notification.target}</td>
                      <td className="cell-text">{new Date(notification.sendDate).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(notification.status)}`}>{notification.status}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {notification.status !== 'Đã gửi' && (
                            <button
                              onClick={() => handleSendNotification(notification)}
                              className="action-btn action-btn-send"
                              title="Gửi thông báo"
                            >
                              <Send className="action-icon" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal('edit', notification)}
                            className="action-btn action-btn-edit"
                            title="Chỉnh sửa"
                          >
                            <Edit className="action-icon" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedNotification(notification);
                              setShowDeleteModal(true);
                            }}
                            className="action-btn action-btn-delete"
                            title="Xóa"
                          >
                            <Trash2 className="action-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Tổng thông báo</div>
            <div className="stat-value">{notifications.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Đã gửi</div>
            <div className="stat-value stat-value-success">{notifications.filter((n) => n.status === 'Đã gửi').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Chờ gửi</div>
            <div className="stat-value stat-value-warning">{notifications.filter((n) => n.status === 'Chờ gửi').length}</div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{modalMode === 'create' ? 'Tạo thông báo mới' : 'Chỉnh sửa thông báo'}</h2>
              <button onClick={handleCloseModal} className="modal-close">
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
                />
                {errors.title && <p className="error-text">{errors.title}</p>}
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
                />
                {errors.content && <p className="error-text">{errors.content}</p>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Loại thông báo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-select"
                  >
                    {notificationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Đối tượng</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="form-select"
                  >
                    {targetOptions.map((target) => (
                      <option key={target} value={target}>
                        {target}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Ngày gửi <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.sendDate}
                    onChange={(e) => setFormData({ ...formData, sendDate: e.target.value })}
                    className={`form-input ${errors.sendDate ? 'input-error' : ''}`}
                  />
                  {errors.sendDate && <p className="error-text">{errors.sendDate}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={handleCloseModal} className="btn-cancel">
                  Hủy
                </button>
                <button onClick={handleSubmit} className="btn-submit">
                  {modalMode === 'create' ? 'Tạo thông báo' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <h3 className="delete-title">Xác nhận xóa</h3>
            <p className="delete-text">
              Bạn có chắc chắn muốn xóa thông báo "{selectedNotification?.title}"? Hành động này không thể hoàn tác.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedNotification(null);
                }}
                className="btn-cancel"
              >
                Hủy
              </button>
              <button onClick={handleDeleteNotification} className="btn-delete">
                Xóa thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;

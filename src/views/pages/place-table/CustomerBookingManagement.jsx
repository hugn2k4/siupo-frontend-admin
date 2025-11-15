import { useState, useEffect } from 'react';
import managePlaceTable from '../../../api/managePlaceTable';
import './CustomerBookingManagement.css';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EmailIcon from '@mui/icons-material/Email';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const CustomerBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(''); // 'view', 'confirm', 'deny'
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchStatistics();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedStatus, searchTerm]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await managePlaceTable.getAllCustomerBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Không thể tải dữ liệu đơn đặt bàn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await managePlaceTable.getBookingStatistics();
      setStatistics(stats.customer || stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchByDateRange = async () => {
    if (!dateRange.start || !dateRange.end) {
      alert('Vui lòng chọn cả ngày bắt đầu và kết thúc');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await managePlaceTable.getCustomerBookingsByDateRange(dateRange.start + 'T00:00:00', dateRange.end + 'T23:59:59');
      setBookings(data);
    } catch (error) {
      console.error('Error fetching by date range:', error);
      setError('Không thể lọc theo khoảng thời gian. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((b) => b.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.user?.fullname?.toLowerCase().includes(searchLower) ||
          b.phoneNumber?.includes(searchTerm) ||
          b.user?.email?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleConfirm = async () => {
    if (!selectedBooking) return;

    setActionLoading(true);
    try {
      await managePlaceTable.confirmCustomerBooking(selectedBooking.id, note || null);
      alert('Đã xác nhận đơn đặt bàn thành công!');
      await fetchBookings();
      await fetchStatistics();
      closeModal();
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Lỗi khi xác nhận: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedBooking) return;

    if (!note || note.trim() === '') {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setActionLoading(true);
    try {
      await managePlaceTable.denyCustomerBooking(selectedBooking.id, note);
      alert('Đã từ chối đơn đặt bàn thành công!');
      await fetchBookings();
      await fetchStatistics();
      closeModal();
    } catch (error) {
      console.error('Error denying booking:', error);
      alert('Lỗi khi từ chối: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (booking) => {
    if (!window.confirm('Xác nhận hoàn thành đơn đặt bàn này?')) return;

    setActionLoading(true);
    try {
      await managePlaceTable.completeCustomerBooking(booking.id, null);
      alert('Đã hoàn thành đơn đặt bàn thành công!');
      await fetchBookings();
      await fetchStatistics();
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('Lỗi khi hoàn thành: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setModalAction('');
    setNote('');
  };

  const openModal = (booking, action = 'view') => {
    setSelectedBooking(booking);
    setModalAction(action);
    setShowModal(true);
    setNote('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ xác nhận', class: 'pending', icon: <HourglassEmptyIcon fontSize="small" /> },
      CONFIRMED: { label: 'Đã xác nhận', class: 'confirmed', icon: <CheckIcon fontSize="small" /> },
      COMPLETED: { label: 'Hoàn thành', class: 'completed', icon: <DoneAllIcon fontSize="small" /> },
      DENIED: { label: 'Từ chối', class: 'denied', icon: <CloseIcon fontSize="small" /> }
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="customer-booking-container">
      <div className="customer-booking-wrapper">
        <div className="customer-booking-header">
          <h1 className="header-title">Quản lý đơn đặt bàn - Khách hàng</h1>

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠</span>
              <span className="error-message">{error}</span>
            </div>
          )}

          {statistics && (
            <div className="statistics-grid">
              <div className="stat-card total">
                <p className="stat-label total">Tổng số</p>
                <p className="stat-value total">{statistics.total || 0}</p>
              </div>
              <div className="stat-card pending clickable" onClick={() => setSelectedStatus('PENDING')}>
                <p className="stat-label pending">Chờ xác nhận</p>
                <p className="stat-value pending">{statistics.pending || 0}</p>
              </div>
              <div className="stat-card confirmed clickable" onClick={() => setSelectedStatus('CONFIRMED')}>
                <p className="stat-label confirmed">Đã xác nhận</p>
                <p className="stat-value confirmed">{statistics.confirmed || 0}</p>
              </div>
              <div className="stat-card completed clickable" onClick={() => setSelectedStatus('COMPLETED')}>
                <p className="stat-label completed">Hoàn thành</p>
                <p className="stat-value completed">{statistics.completed || 0}</p>
              </div>
              <div className="stat-card denied clickable" onClick={() => setSelectedStatus('DENIED')}>
                <p className="stat-label denied">Từ chối</p>
                <p className="stat-value denied">{statistics.denied || 0}</p>
              </div>
            </div>
          )}

          <div className="filter-section">
            <div className="search-input-wrapper">
              <span className="search-icon">
                <SearchIcon fontSize="small" />
              </span>
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT, email..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select className="status-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="DENIED">Từ chối</option>
            </select>

            <input
              type="date"
              className="date-input"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <input
              type="date"
              className="date-input"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
            {dateRange.start && dateRange.end && (
              <button onClick={fetchByDateRange} className="filter-date-button">
                Lọc theo ngày
              </button>
            )}

            <button
              onClick={() => {
                setSelectedStatus('all');
                setSearchTerm('');
                setDateRange({ start: '', end: '' });
                fetchBookings();
                fetchStatistics();
              }}
              className="refresh-button"
              disabled={loading}
            >
              <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>
                <RefreshIcon fontSize="small" />
              </span>
              Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="bookings-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Khách hàng</th>
                    <th>Liên hệ</th>
                    <th>Ngày - Giờ</th>
                    <th>Số khách</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="cell-id">#{booking.id}</td>
                      <td className="cell-name">{booking.user?.fullname || '-'}</td>
                      <td className="cell-contact">
                        <div>{booking.phoneNumber || '-'}</div>
                        {booking.user?.email && <div className="cell-contact-email">{booking.user.email}</div>}
                      </td>
                      <td className="cell-datetime">{formatDateTime(booking.startedAt)}</td>
                      <td className="cell-guests">{booking.member} người</td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => openModal(booking, 'view')} className="action-button view" title="Chi tiết">
                            <VisibilityIcon />
                          </button>

                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => openModal(booking, 'confirm')}
                                className="action-button confirm"
                                title="Xác nhận"
                                disabled={actionLoading}
                              >
                                <CheckIcon />
                              </button>
                              <button
                                onClick={() => openModal(booking, 'deny')}
                                className="action-button deny"
                                title="Từ chối"
                                disabled={actionLoading}
                              >
                                <CloseIcon />
                              </button>
                            </>
                          )}

                          {booking.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleComplete(booking)}
                              className="action-button complete"
                              title="Hoàn thành"
                              disabled={actionLoading}
                            >
                              <DoneAllIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredBookings.length === 0 && !loading && (
              <div className="empty-state">
                <div className="empty-icon">
                  <EmailIcon />
                </div>
                <p>Không có đơn đặt bàn nào</p>
              </div>
            )}
          </div>
        )}

        {showModal && selectedBooking && (
          <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && closeModal()}>
            <div className="modal-content">
              <h3 className="modal-title">
                {modalAction === 'confirm' && 'Xác nhận đơn đặt bàn'}
                {modalAction === 'deny' && 'Từ chối đơn đặt bàn'}
                {modalAction === 'view' && `Chi tiết đơn đặt bàn #${selectedBooking.id}`}
              </h3>

              <div className="modal-details">
                <div className="detail-row">
                  <p className="detail-label">Khách hàng:</p>
                  <p className="detail-value">{selectedBooking.user?.fullname || '-'}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">SĐT:</p>
                  <p className="detail-value">{selectedBooking.phoneNumber || '-'}</p>
                </div>
                {selectedBooking.user?.email && (
                  <div className="detail-row">
                    <p className="detail-label">Email:</p>
                    <p className="detail-value small">{selectedBooking.user.email}</p>
                  </div>
                )}
                <div className="detail-row">
                  <p className="detail-label">Ngày giờ:</p>
                  <p className="detail-value">{formatDateTime(selectedBooking.startedAt)}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Số khách:</p>
                  <p className="detail-value">{selectedBooking.member} người</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Trạng thái:</p>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>

                {/* Hiển thị danh sách món đặt trước */}
                {selectedBooking.hasPreOrder && selectedBooking.items && selectedBooking.items.length > 0 && (
                  <div className="preorder-section">
                    <div className="preorder-header">
                      <RestaurantMenuIcon />
                      <h4>Món ăn đặt trước ({selectedBooking.items.length})</h4>
                    </div>
                    <div className="preorder-items">
                      {selectedBooking.items.map((item, index) => (
                        <div key={item.id || index} className="preorder-item">
                          <div className="item-image-wrapper">
                            {item.product?.imageUrl ? (
                              <img src={item.product.imageUrl} alt={item.product.name} className="item-image" />
                            ) : (
                              <div className="item-image-placeholder">
                                <RestaurantMenuIcon />
                              </div>
                            )}
                          </div>
                          <div className="item-details">
                            <p className="item-name">{item.product?.name || 'Món ăn'}</p>
                            {item.product?.description && <p className="item-description">{item.product.description}</p>}
                            <div className="item-quantity-price">
                              <span className="item-quantity">Số lượng: {item.quantity}</span>
                              <span className="item-price">{formatCurrency(item.price)}</span>
                            </div>
                            {item.note && <p className="item-note">💬 {item.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedBooking.totalPrice && (
                      <div className="preorder-total">
                        <span>Tổng tiền:</span>
                        <span className="total-amount">{formatCurrency(selectedBooking.totalPrice)}</span>
                      </div>
                    )}
                    {selectedBooking.payment && (
                      <div className="payment-info">
                        <p className="payment-method">💳 Thanh toán: {selectedBooking.payment.method}</p>
                        <p className={`payment-status status-${selectedBooking.payment.status.toLowerCase()}`}>
                          Trạng thái: {selectedBooking.payment.status}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedBooking.note && (
                  <div className="detail-note">
                    <p className="detail-note-label">Ghi chú:</p>
                    <p className="detail-note-value">{selectedBooking.note}</p>
                  </div>
                )}
              </div>

              {(modalAction === 'confirm' || modalAction === 'deny') && (
                <div className="modal-input-section">
                  <label className="modal-input-label">
                    {modalAction === 'deny' ? 'Lý do từ chối' : 'Ghi chú của quản lý'}
                    {modalAction === 'deny' && <span className="required-mark"> *</span>}
                  </label>
                  <textarea
                    placeholder={modalAction === 'deny' ? 'Nhập lý do từ chối (bắt buộc)...' : 'Ghi chú thêm (tùy chọn)...'}
                    className="modal-textarea"
                    rows="4"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              )}

              <div className="modal-buttons">
                <button onClick={closeModal} className="modal-button close" disabled={actionLoading}>
                  {modalAction === 'view' ? 'Đóng' : 'Hủy'}
                </button>

                {modalAction === 'confirm' && (
                  <button onClick={handleConfirm} className="modal-button confirm" disabled={actionLoading}>
                    {actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                )}

                {modalAction === 'deny' && (
                  <button onClick={handleDeny} className="modal-button deny" disabled={actionLoading || !note.trim()}>
                    {actionLoading ? 'Đang xử lý...' : 'Từ chối'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBookingManagement;

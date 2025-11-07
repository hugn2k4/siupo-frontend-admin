import { useState, useEffect } from 'react';
import managePlaceTable from '../../../api/managePlaceTable';
import './GuestBookingManagement.css';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventIcon from '@mui/icons-material/Event';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';

const GuestBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(''); // 'view', 'confirm', 'deny', 'complete'
  const [note, setNote] = useState('');
  const [statistics, setStatistics] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, denied: 0 });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchStatistics();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedStatus, searchTerm, phoneSearch]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await managePlaceTable.getAllGuestBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching guest bookings:', error);
      setError('Không thể tải dữ liệu đơn đặt bàn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await managePlaceTable.getBookingStatistics();
      setStatistics(stats.guest || stats);
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
      const data = await managePlaceTable.getGuestBookingsByDateRange(dateRange.start + 'T00:00:00', dateRange.end + 'T23:59:59');
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
      filtered = filtered.filter((b) => b.fullname?.toLowerCase().includes(searchLower) || b.email?.toLowerCase().includes(searchLower));
    }

    if (phoneSearch) {
      filtered = filtered.filter((b) => b.phoneNumber?.includes(phoneSearch));
    }

    setFilteredBookings(filtered);
    calculateStatistics(filtered);
  };

  const calculateStatistics = (filtered) => {
    const stats = {
      total: filtered.length,
      pending: filtered.filter((b) => b.status === 'PENDING').length,
      confirmed: filtered.filter((b) => b.status === 'CONFIRMED').length,
      completed: filtered.filter((b) => b.status === 'COMPLETED').length,
      denied: filtered.filter((b) => b.status === 'DENIED').length
    };
    setStatistics(stats);
  };

  const handleConfirm = async () => {
    if (!selectedBooking) return;

    setActionLoading(true);
    try {
      await managePlaceTable.confirmGuestBooking(selectedBooking.id, note || null);
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
      await managePlaceTable.denyGuestBooking(selectedBooking.id, note);
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
      await managePlaceTable.completeGuestBooking(booking.id, null);
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

  const searchByPhone = async () => {
    if (!phoneSearch) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await managePlaceTable.getGuestBookingsByPhone(phoneSearch);
      setBookings(data);
    } catch (error) {
      console.error('Error searching by phone:', error);
      setError('Không thể tìm kiếm theo số điện thoại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setSearchTerm('');
    setPhoneSearch('');
    setSelectedStatus('all');
    fetchBookings();
    fetchStatistics();
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

  return (
    <div className="guest-booking-container">
      <div className="guest-booking-wrapper">
        <div className="guest-booking-header">
          <h1 className="header-title">Quản lý đơn đặt bàn - Khách vãng lai</h1>

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
                <p className="stat-value total">{statistics.total}</p>
              </div>
              <div className="stat-card pending clickable" onClick={() => setSelectedStatus('PENDING')}>
                <p className="stat-label pending">Chờ xác nhận</p>
                <p className="stat-value pending">{statistics.pending}</p>
              </div>
              <div className="stat-card confirmed clickable" onClick={() => setSelectedStatus('CONFIRMED')}>
                <p className="stat-label confirmed">Đã xác nhận</p>
                <p className="stat-value confirmed">{statistics.confirmed}</p>
              </div>
              <div className="stat-card completed clickable" onClick={() => setSelectedStatus('COMPLETED')}>
                <p className="stat-label completed">Hoàn thành</p>
                <p className="stat-value completed">{statistics.completed}</p>
              </div>
              <div className="stat-card denied clickable" onClick={() => setSelectedStatus('DENIED')}>
                <p className="stat-label denied">Từ chối</p>
                <p className="stat-value denied">{statistics.denied}</p>
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
                placeholder="Tìm theo tên, email..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="phone-search-wrapper">
              <span className="phone-icon">
                <PhoneIcon fontSize="small" />
              </span>
              <input
                type="text"
                placeholder="Số điện thoại..."
                className="phone-input"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
              />
              <button onClick={searchByPhone} className="search-button" disabled={loading}>
                Tìm
              </button>
            </div>
          </div>

          <div className="filter-controls">
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

            <button onClick={clearFilters} className="clear-filter-button">
              Xóa bộ lọc
            </button>

            <button
              onClick={() => {
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
                    <th>Tên khách</th>
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
                      <td className="cell-name">{booking.fullname || '-'}</td>
                      <td className="cell-contact">
                        <div>{booking.phoneNumber || '-'}</div>
                        {booking.email && <div className="cell-contact-email">{booking.email}</div>}
                      </td>
                      <td className="cell-datetime">{formatDateTime(booking.startedAt)}</td>
                      <td className="cell-guests">{booking.memberInt || '-'} người</td>
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
                  <EventIcon fontSize="large" />
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
                  <p className="detail-label">Tên khách:</p>
                  <p className="detail-value">{selectedBooking.fullname || '-'}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">SĐT:</p>
                  <p className="detail-value">{selectedBooking.phoneNumber || '-'}</p>
                </div>
                {selectedBooking.email && (
                  <div className="detail-row">
                    <p className="detail-label">Email:</p>
                    <p className="detail-value small">{selectedBooking.email}</p>
                  </div>
                )}
                <div className="detail-row">
                  <p className="detail-label">Ngày giờ:</p>
                  <p className="detail-value">{formatDateTime(selectedBooking.startedAt)}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Số khách:</p>
                  <p className="detail-value">{selectedBooking.memberInt || '-'} người</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Trạng thái:</p>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>
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

export default GuestBookingManagement;

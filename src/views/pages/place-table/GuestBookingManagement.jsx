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
import SearchIcon from '@mui/icons-material/Search';

const GuestBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, selectedStatus, searchTerm]);

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
      filtered = filtered.filter(
        (b) =>
          b.fullname?.toLowerCase().includes(searchLower) ||
          b.email?.toLowerCase().includes(searchLower) ||
          b.phoneNumber?.includes(searchTerm) // Thêm dòng này để tìm cả SĐT
      );
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
      <span className={`guest-status-badge ${config.class}`}>
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
          <h1 className="guest-header-title">Quản lý đơn đặt bàn - Khách vãng lai</h1>

          {error && (
            <div className="guest-error-alert">
              <span className="guest-error-icon">⚠</span>
              <span className="guest-error-message">{error}</span>
            </div>
          )}

          {statistics && (
            <div className="guest-statistics-grid">
              <div className="guest-stat-card total">
                <p className="guest-stat-label total">Tổng số</p>
                <p className="guest-stat-value total">{statistics.total}</p>
              </div>
              <div className="guest-stat-card pending clickable" onClick={() => setSelectedStatus('PENDING')}>
                <p className="guest-stat-label pending">Chờ xác nhận</p>
                <p className="guest-stat-value pending">{statistics.pending}</p>
              </div>
              <div className="guest-stat-card confirmed clickable" onClick={() => setSelectedStatus('CONFIRMED')}>
                <p className="guest-stat-label confirmed">Đã xác nhận</p>
                <p className="guest-stat-value confirmed">{statistics.confirmed}</p>
              </div>
              <div className="guest-stat-card completed clickable" onClick={() => setSelectedStatus('COMPLETED')}>
                <p className="guest-stat-label completed">Hoàn thành</p>
                <p className="guest-stat-value completed">{statistics.completed}</p>
              </div>
              <div className="guest-stat-card denied clickable" onClick={() => setSelectedStatus('DENIED')}>
                <p className="guest-stat-label denied">Từ chối</p>
                <p className="guest-stat-value denied">{statistics.denied}</p>
              </div>
            </div>
          )}

          <div className="guest-filter-section">
            <div className="guest-search-input-wrapper">
              <span className="guest-search-icon">
                <SearchIcon fontSize="small" />
              </span>
              <input
                type="text"
                placeholder="Tìm theo tên hoặc số điện thoại..."
                className="guest-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select className="guest-status-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="DENIED">Từ chối</option>
            </select>

            <input
              type="date"
              className="guest-date-input"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <input
              type="date"
              className="guest-date-input"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
            {dateRange.start && dateRange.end && (
              <button onClick={fetchByDateRange} className="guest-filter-date-button">
                Lọc theo ngày
              </button>
            )}

            <button
              onClick={() => {
                fetchBookings();
                fetchStatistics();
              }}
              className="guest-refresh-button"
              disabled={loading}
            >
              <span className={`guest-refresh-icon ${loading ? 'spinning' : ''}`}>
                <RefreshIcon fontSize="small" />
              </span>
              Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="guest-loading-container">
            <div className="guest-loading-spinner"></div>
            <p className="guest-loading-text">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="guest-table-container">
            <div className="guest-table-wrapper">
              <table className="guest-bookings-table">
                <thead className="guest-table-header">
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
                <tbody className="guest-table-body">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="guest-cell-id">#{booking.id}</td>
                      <td className="guest-cell-name">{booking.fullname || '-'}</td>
                      <td className="guest-cell-contact">
                        <div>{booking.phoneNumber || '-'}</div>
                        {booking.email && <div className="guest-cell-contact-email">{booking.email}</div>}
                      </td>
                      <td className="guest-cell-datetime">{formatDateTime(booking.startedAt)}</td>
                      <td className="guest-cell-guests">{booking.memberInt || '-'} người</td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td>
                        <div className="guest-action-buttons">
                          <button onClick={() => openModal(booking, 'view')} className="guest-action-button view" title="Chi tiết">
                            <VisibilityIcon />
                          </button>

                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => openModal(booking, 'confirm')}
                                className="guest-action-button confirm"
                                title="Xác nhận"
                                disabled={actionLoading}
                              >
                                <CheckIcon />
                              </button>
                              <button
                                onClick={() => openModal(booking, 'deny')}
                                className="guest-action-button deny"
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
                              className="guest-action-button complete"
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
              <div className="guest-empty-state">
                <div className="guest-empty-icon">
                  <EventIcon />
                </div>
                <p>Không có đơn đặt bàn nào</p>
              </div>
            )}
          </div>
        )}

        {showModal && selectedBooking && (
          <div className="guest-modal-overlay" onClick={(e) => e.target.className === 'guest-modal-overlay' && closeModal()}>
            <div className="guest-modal-content">
              <h3 className="guest-modal-title">
                {modalAction === 'confirm' && 'Xác nhận đơn đặt bàn'}
                {modalAction === 'deny' && 'Từ chối đơn đặt bàn'}
                {modalAction === 'view' && `Chi tiết đơn đặt bàn #${selectedBooking.id}`}
              </h3>

              <div className="guest-modal-details">
                <div className="guest-detail-row">
                  <p className="guest-detail-label">Tên khách:</p>
                  <p className="guest-detail-value">{selectedBooking.fullname || '-'}</p>
                </div>
                <div className="guest-detail-row">
                  <p className="guest-detail-label">SĐT:</p>
                  <p className="guest-detail-value">{selectedBooking.phoneNumber || '-'}</p>
                </div>
                {selectedBooking.email && (
                  <div className="guest-detail-row">
                    <p className="guest-detail-label">Email:</p>
                    <p className="guest-detail-value small">{selectedBooking.email}</p>
                  </div>
                )}
                <div className="guest-detail-row">
                  <p className="guest-detail-label">Ngày giờ:</p>
                  <p className="guest-detail-value">{formatDateTime(selectedBooking.startedAt)}</p>
                </div>
                <div className="guest-detail-row">
                  <p className="guest-detail-label">Số khách:</p>
                  <p className="guest-detail-value">{selectedBooking.memberInt || '-'} người</p>
                </div>
                <div className="guest-detail-row">
                  <p className="guest-detail-label">Trạng thái:</p>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>
                {selectedBooking.note && (
                  <div className="guest-detail-note">
                    <p className="guest-detail-note-label">Ghi chú:</p>
                    <p className="guest-detail-note-value">{selectedBooking.note}</p>
                  </div>
                )}
              </div>

              {(modalAction === 'confirm' || modalAction === 'deny') && (
                <div className="guest-modal-input-section">
                  <label className="guest-modal-input-label">
                    {modalAction === 'deny' ? 'Lý do từ chối' : 'Ghi chú của quản lý'}
                    {modalAction === 'deny' && <span className="guest-required-mark"> *</span>}
                  </label>
                  <textarea
                    placeholder={modalAction === 'deny' ? 'Nhập lý do từ chối (bắt buộc)...' : 'Ghi chú thêm (tùy chọn)...'}
                    className="guest-modal-textarea"
                    rows="4"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              )}

              <div className="guest-modal-buttons">
                <button onClick={closeModal} className="guest-modal-button close" disabled={actionLoading}>
                  {modalAction === 'view' ? 'Đóng' : 'Hủy'}
                </button>

                {modalAction === 'confirm' && (
                  <button onClick={handleConfirm} className="guest-modal-button confirm" disabled={actionLoading}>
                    {actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                )}

                {modalAction === 'deny' && (
                  <button onClick={handleDeny} className="guest-modal-button deny" disabled={actionLoading || !note.trim()}>
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

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import bannerApi from '../../../api/bannerApi';
import uploadApi from '../../../api/uploadApi';
import ConfirmDialog from '../../../components/ConfirmDialog';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: '', position: '' });
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  // Notification system
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await bannerApi.getAll();
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      showNotification('Lỗi khi tải danh sách banner', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentBanner(null);
    setFormData({ name: '', url: '', position: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (banner) => {
    setCurrentBanner(banner);
    setFormData({
      name: banner.name,
      url: banner.url,
      position: banner.position
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setConfirmTarget(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    try {
      await bannerApi.delete(confirmTarget);
      showNotification('Xóa banner thành công', 'success');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      showNotification('Lỗi khi xóa banner', 'error');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, url: '' }));
      setUploading(true);
      try {
        const response = await uploadApi.uploadSingle(file);
        const newUrl = response;
        setFormData((prev) => ({ ...prev, url: newUrl }));
        showNotification('Upload hình ảnh thành công', 'success');
        e.target.value = '';
      } catch (error) {
        console.error('Error uploading file:', error);
        showNotification('Lỗi khi upload hình ảnh', 'error');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      url: formData.url,
      position: formData.position
    };

    try {
      if (currentBanner) {
        await bannerApi.update(currentBanner.id, payload);
        showNotification('Cập nhật banner thành công', 'success');
      } else {
        await bannerApi.create(payload);
        showNotification('Thêm banner thành công', 'success');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      showNotification(error.response?.data?.message || 'Lỗi khi lưu banner', 'error');
    }
  };

  return (
    <div style={styles.container}>
      {/* Notifications */}
      <div style={styles.notificationContainer}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              ...styles.notification,
              ...(notif.type === 'success' ? styles.notificationSuccess : {}),
              ...(notif.type === 'error' ? styles.notificationError : {}),
              ...(notif.type === 'warning' ? styles.notificationWarning : {})
            }}
          >
            {notif.type === 'success' && <CheckCircle size={20} />}
            {notif.type === 'error' && <XCircle size={20} />}
            {notif.type === 'warning' && <AlertCircle size={20} />}
            <span>{notif.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Quản Lý Nội Dung Hiển Thị</h1>
          <p style={styles.subtitle}>Quản lý banner, hình ảnh quảng cáo và nội dung hiển thị</p>
        </div>
        <button style={styles.addButton} onClick={handleAdd}>
          <Plus size={20} />
          Thêm Banner Mới
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Tổng Banner</div>
          <div style={styles.statValue}>{banners.length}</div>
        </div>
      </div>

      {/* Banner List */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loading}>Đang tải...</div>
        ) : banners.length === 0 ? (
          <div style={styles.empty}>Chưa có banner nào</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Hình Ảnh</th>
                <th style={styles.th}>Tên Banner</th>
                <th style={styles.th}>Ngày Tạo</th>
                <th style={styles.th}>Cập Nhật</th>
                <th style={styles.th}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {banners
                .sort((a, b) => a.position - b.position)
                .map((banner) => (
                  <tr key={banner.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.imageContainer}>
                        <img src={banner.url} alt={banner.name} style={styles.thumbnail} />
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.bannerName}>{banner.name}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.dateText}>{new Date(banner.createdAt).toLocaleDateString('vi-VN')}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.dateText}>{new Date(banner.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button style={styles.actionBtnPrimary} onClick={() => handleEdit(banner)} title="Chỉnh sửa">
                          <Edit2 size={16} />
                        </button>
                        <button style={styles.actionBtnDanger} onClick={() => handleDelete(banner.id)} title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <ImageIcon size={24} />
                {currentBanner ? 'Chỉnh Sửa Banner' : 'Thêm Banner Mới'}
              </h2>
              <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tên Banner *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Banner Khuyến Mãi Tết"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Upload Hình Ảnh</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={styles.input} disabled={uploading} />
                {uploading && <small style={{ ...styles.helpText, color: '#3b82f6' }}>⏳ Đang upload...</small>}
                {!uploading && <small style={styles.helpText}>Hoặc nhập URL bên dưới</small>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>URL Hình Ảnh *</label>
                <input
                  type="url"
                  style={styles.input}
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  required
                  key={formData.url}
                />
                {formData.url && <small style={{ ...styles.helpText, color: '#10b981', marginTop: '4px' }}>✓ URL đã được cập nhật</small>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Vị Trí Hiển Thị *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Home "
                  min="1"
                  required
                />
                <small style={styles.helpText}>Số nhỏ hơn sẽ hiển thị trước</small>
              </div>

              {formData.url && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Xem Trước</label>
                  <div style={styles.previewContainer}>
                    <img
                      src={formData.url}
                      alt="Preview"
                      style={styles.previewImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
                  <X size={18} />
                  Hủy
                </button>
                <button type="submit" style={styles.saveButton} disabled={uploading}>
                  <Save size={18} />
                  {currentBanner ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xóa"
        content="Bạn có chắc chắn muốn xóa banner này?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={false}
        confirmText="Xóa"
      />
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  notificationContainer: {
    position: 'fixed',
    top: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  notification: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '300px',
    animation: 'slideIn 0.3s ease-out',
    fontWeight: '500',
    fontSize: '14px'
  },
  notificationSuccess: {
    backgroundColor: '#10b981',
    color: 'white'
  },
  notificationError: {
    backgroundColor: '#ef4444',
    color: 'white'
  },
  notificationWarning: {
    backgroundColor: '#f59e0b',
    color: 'white'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px'
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#1f2937'
  },
  imageContainer: {
    width: '80px',
    height: '50px',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  bannerName: {
    fontWeight: '500',
    color: '#1f2937'
  },
  dateText: {
    color: '#6b7280',
    fontSize: '13px'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  actionBtnPrimary: {
    padding: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  actionBtnDanger: {
    padding: '8px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  form: {
    padding: '24px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  helpText: {
    display: 'block',
    marginTop: '4px',
    fontSize: '12px',
    color: '#6b7280'
  },
  previewContainer: {
    width: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb'
  },
  previewImage: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default BannerManagement;

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import bannerApi from '../../../api/bannerApi';
import uploadApi from '../../../api/uploadApi';
import ConfirmDialog from '../../../components/ConfirmDialog';

// 12 fixed banner positions
const BANNER_POSITIONS = [
  { value: 'Home1', label: 'Home - Position 1' },
  { value: 'Home2', label: 'Home - Position 2' },
  { value: 'Menu1', label: 'Menu - Position 1' },
  { value: 'Menu2', label: 'Menu - Position 2' },
  { value: 'Menu3', label: 'Menu - Position 3' },
  { value: 'Menu4', label: 'Menu - Position 4' },
  { value: 'AboutUs1', label: 'About Us - Position 1' },
  { value: 'AboutUs2', label: 'About Us - Position 2' },
  { value: 'AboutUs3', label: 'About Us - Position 3' },
  { value: 'AboutUs4', label: 'About Us - Position 4' },
  { value: 'AboutUs5', label: 'About Us - Position 5' },
  { value: 'PlaceTable1', label: 'Place Table - Position 1' }
];

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

  // Calculate occupied positions (excluding current editing banner)
  const occupiedPositions = useMemo(() => {
    return banners.filter((b) => currentBanner?.id !== b.id).map((b) => b.position);
  }, [banners, currentBanner]);

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

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bannerApi.getAll();
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      showNotification('Error loading banner list', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Merge positions with actual banners
  const positionSlots = useMemo(() => {
    return BANNER_POSITIONS.map((pos) => {
      const banner = banners.find((b) => b.position === pos.value);
      return {
        position: pos.value,
        label: pos.label,
        banner: banner || null
      };
    });
  }, [banners]);

  const handleAdd = (position = '') => {
    setCurrentBanner(null);
    setFormData({ name: '', url: '', position });
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
      showNotification('Banner deleted successfully', 'success');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      showNotification('Error deleting banner', 'error');
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
        showNotification('Image uploaded successfully', 'success');
        e.target.value = '';
      } catch (error) {
        console.error('Error uploading file:', error);
        showNotification('Error uploading image', 'error');
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
        showNotification('Banner updated successfully', 'success');
      } else {
        await bannerApi.create(payload);
        showNotification('Banner added successfully', 'success');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      showNotification(error.response?.data?.message || 'Error saving banner', 'error');
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
          <h1 style={styles.title}>Banner Management</h1>
          <p style={styles.subtitle}>Manage banners, promotional images and display content</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Banners</div>
          <div style={styles.statValue}>
            {banners.length} / {BANNER_POSITIONS.length}
          </div>
          <small style={styles.statSubtext}>{BANNER_POSITIONS.length - banners.length} positions available</small>
        </div>
      </div>

      {/* Banner List */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : banners.length === 0 ? (
          <div style={styles.empty}>No banners yet</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Position</th>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Created Date</th>
                <th style={styles.th}>Updated</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {positionSlots.map((slot) => (
                <tr key={slot.position} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.positionLabel}>{slot.label}</div>
                  </td>
                  {slot.banner ? (
                    // Has banner - show banner info
                    <>
                      <td style={styles.td}>
                        <div style={styles.imageContainer}>
                          <img src={slot.banner.url} alt={slot.banner.name} style={styles.thumbnail} />
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.dateText}>{new Date(slot.banner.createdAt).toLocaleDateString('vi-VN')}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.dateText}>{new Date(slot.banner.updatedAt).toLocaleDateString('vi-VN')}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button style={styles.actionBtnPrimary} onClick={() => handleEdit(slot.banner)} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button style={styles.actionBtnDanger} onClick={() => handleDelete(slot.banner.id)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // Empty slot - show add button
                    <>
                      <td colSpan="3" style={styles.td}>
                        <div style={styles.emptySlot}>
                          <span style={styles.emptyText}>No banner assigned</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.addBannerBtn} onClick={() => handleAdd(slot.position)} title="Add Banner">
                          <Plus size={16} />
                          Add Banner
                        </button>
                      </td>
                    </>
                  )}
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
                {currentBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Upload Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={styles.input} disabled={uploading} />
                {uploading && <small style={{ ...styles.helpText, color: '#3b82f6' }}>⏳ Uploading...</small>}
                {!uploading && <small style={styles.helpText}>Or enter URL below</small>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Image URL *</label>
                <input
                  type="url"
                  style={styles.input}
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  required
                  key={formData.url}
                />
                {formData.url && <small style={{ ...styles.helpText, color: '#10b981', marginTop: '4px' }}>✓ URL updated</small>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Display Position *</label>
                <select
                  style={styles.select}
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                >
                  <option value="">Select position...</option>
                  {BANNER_POSITIONS.map((pos) => {
                    const isOccupied = occupiedPositions.includes(pos.value);
                    return (
                      <option key={pos.value} value={pos.value} disabled={isOccupied}>
                        {pos.label} {isOccupied ? '(Occupied)' : ''}
                      </option>
                    );
                  })}
                </select>
                <small style={styles.helpText}>
                  {formData.position && occupiedPositions.includes(formData.position)
                    ? '⚠️ Position already occupied'
                    : 'Select an available position for the banner'}
                </small>
              </div>

              {formData.url && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Preview</label>
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
                  Cancel
                </button>
                <button type="submit" style={styles.saveButton} disabled={uploading}>
                  <Save size={18} />
                  {currentBanner ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Delete"
        content="Are you sure you want to delete this banner?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={false}
        confirmText="Delete"
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
  statSubtext: {
    display: 'block',
    marginTop: '4px',
    fontSize: '13px',
    color: '#10b981',
    fontWeight: '500'
  },
  positionLabel: {
    fontWeight: '600',
    color: '#3b82f6',
    fontSize: '13px'
  },
  emptySlot: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: '14px',
    fontStyle: 'italic'
  },
  addBannerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
  select: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    cursor: 'pointer'
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

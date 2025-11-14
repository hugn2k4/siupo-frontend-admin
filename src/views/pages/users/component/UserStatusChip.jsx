import { Chip } from '@mui/material';

const statusConfig = {
  ACTIVE: { color: 'success', label: 'Active' },
  INACTIVE: { color: 'warning', label: 'Inactive' },
  SUSPENDED: { color: 'error', label: 'Suspended' },
  DELETED: { color: 'default', label: 'Deleted' }
};

export default function UserStatusChip({ status }) {
  const config = statusConfig[status] || statusConfig.INACTIVE;
  return <Chip label={config.label} color={config.color} size="small" sx={{ minWidth: 80 }} />;
}

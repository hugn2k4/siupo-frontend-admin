import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useGlobal } from '../hooks/useGlobal';

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const { isLogin, user } = useGlobal();

  const isAdmin = user && (user.role || '').toString().toUpperCase() === 'ADMIN';

  // Require both authentication and ADMIN role
  if (!isLogin || !isAdmin) {
    return <Navigate to="/pages/login" replace state={{ from: location }} />;
  }

  return children;
}

PrivateRoute.propTypes = {
  children: PropTypes.node
};

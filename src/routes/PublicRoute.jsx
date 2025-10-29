import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useGlobal } from '../hooks/useGlobal';

export default function PublicRoute({ children }) {
  const { isLogin } = useGlobal();
  if (isLogin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

PublicRoute.propTypes = {
  children: PropTypes.node
};
